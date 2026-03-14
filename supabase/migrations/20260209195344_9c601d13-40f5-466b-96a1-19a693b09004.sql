
-- 1. Fix notifications INSERT: only allow system/triggers to insert (restrict to service role)
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a restrictive policy: users can only insert notifications for themselves (for client-triggered ones)
-- Triggers use SECURITY DEFINER so they bypass RLS
CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Fix post_likes SELECT: only authenticated users can see likes
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;

CREATE POLICY "Authenticated users can view likes"
ON public.post_likes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Fix community_posts SELECT: require authentication
DROP POLICY IF EXISTS "Anyone can view posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view posts"
ON public.community_posts
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. Fix post_comments SELECT: require authentication
DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;

CREATE POLICY "Authenticated users can view comments"
ON public.post_comments
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 5. Group admins/creators can remove members
CREATE POLICY "Group creators can remove members"
ON public.group_members
FOR DELETE
USING (
  group_id IN (
    SELECT id FROM public.groups WHERE created_by = auth.uid()
  )
);

-- 6. Add content length constraints via validation triggers
CREATE OR REPLACE FUNCTION public.validate_content_length()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_TABLE_NAME = 'community_posts' AND length(NEW.content) > 5000 THEN
    RAISE EXCEPTION 'Content exceeds maximum length of 5000 characters';
  END IF;
  IF TG_TABLE_NAME = 'post_comments' AND length(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Comment exceeds maximum length of 2000 characters';
  END IF;
  IF TG_TABLE_NAME = 'direct_messages' AND length(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Message exceeds maximum length of 2000 characters';
  END IF;
  IF TG_TABLE_NAME = 'journal_entries' AND length(NEW.content) > 10000 THEN
    RAISE EXCEPTION 'Journal entry exceeds maximum length of 10000 characters';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_community_post_length
BEFORE INSERT OR UPDATE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.validate_content_length();

CREATE TRIGGER validate_comment_length
BEFORE INSERT OR UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.validate_content_length();

CREATE TRIGGER validate_message_length
BEFORE INSERT OR UPDATE ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_content_length();

CREATE TRIGGER validate_journal_length
BEFORE INSERT OR UPDATE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.validate_content_length();
