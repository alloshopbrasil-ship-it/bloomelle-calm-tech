
-- 1. Restrict profiles SELECT to own data only (fixes email + trial data exposure)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. Add RLS to profiles_public view — it's a view so we rely on underlying table RLS
-- But add explicit security: recreate view with only safe fields
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT id, name, avatar_url, is_anonymous, plan_type, created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO authenticated;

-- 3. Add DELETE policy for direct_messages (senders can delete own messages)
CREATE POLICY "Users can delete their own sent messages"
ON public.direct_messages
FOR DELETE
USING (auth.uid() = sender_id);

-- 4. Add DELETE policy for conversations (participants can delete)
CREATE POLICY "Users can delete their conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- 5. Prevent group_members role escalation
CREATE POLICY "Only group creators can update member roles"
ON public.group_members
FOR UPDATE
USING (
  group_id IN (
    SELECT id FROM public.groups WHERE created_by = auth.uid()
  )
);

-- 6. Allow moderators/admins to resolve moderation flags
CREATE POLICY "Moderators can update flags"
ON public.moderation_flags
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);

-- 7. Add UPDATE/DELETE for moods
CREATE POLICY "Users can update their own moods"
ON public.moods
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moods"
ON public.moods
FOR DELETE
USING (auth.uid() = user_id);

-- 8. Add DELETE for daily_completions
CREATE POLICY "Users can delete their own completions"
ON public.daily_completions
FOR DELETE
USING (auth.uid() = user_id);

-- 9. Add rate limiting trigger for notifications insert (prevent spam)
CREATE OR REPLACE FUNCTION public.rate_limit_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.notifications
  WHERE user_id = NEW.user_id
    AND created_at > now() - interval '1 minute';
  
  IF recent_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded for notifications';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_limit_notifications_trigger
BEFORE INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_notifications();

-- 10. Add rate limiting for community posts (prevent spam)
CREATE OR REPLACE FUNCTION public.rate_limit_posts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.community_posts
  WHERE user_id = NEW.user_id
    AND created_at > now() - interval '5 minutes';
  
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'You are posting too fast. Please wait a few minutes.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_limit_posts_trigger
BEFORE INSERT ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_posts();

-- 11. Rate limit comments
CREATE OR REPLACE FUNCTION public.rate_limit_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.post_comments
  WHERE user_id = NEW.user_id
    AND created_at > now() - interval '1 minute';
  
  IF recent_count >= 15 THEN
    RAISE EXCEPTION 'You are commenting too fast. Please wait.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_limit_comments_trigger
BEFORE INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_comments();

-- 12. Rate limit direct messages
CREATE OR REPLACE FUNCTION public.rate_limit_messages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.direct_messages
  WHERE sender_id = NEW.sender_id
    AND created_at > now() - interval '1 minute';
  
  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'You are sending messages too fast. Please wait.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_limit_messages_trigger
BEFORE INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_messages();
