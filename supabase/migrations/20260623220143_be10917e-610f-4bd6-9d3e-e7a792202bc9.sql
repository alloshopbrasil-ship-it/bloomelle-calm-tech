
-- 1) Profiles: revoke sensitive cols from anon (defense-in-depth; RLS already blocks)
REVOKE SELECT (email, plan_type, trial_started_at, trial_ends_at, has_used_trial) ON public.profiles FROM anon;
COMMENT ON TABLE public.profiles IS 'Owner-only SELECT. Use profiles_public view for cross-user lookups (exposes only name, avatar_url).';

-- 2) Community posts: mask user_id for anonymous posts
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS anonymous_author_id uuid;
REVOKE SELECT (anonymous_author_id) ON public.community_posts FROM anon, authenticated;
GRANT SELECT (anonymous_author_id) ON public.community_posts TO service_role;

UPDATE public.community_posts
SET anonymous_author_id = user_id, user_id = NULL
WHERE is_anonymous = true AND user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.mask_anonymous_post_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_anonymous = true THEN
    NEW.anonymous_author_id := COALESCE(NEW.anonymous_author_id, NEW.user_id, auth.uid());
    NEW.user_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.mask_anonymous_post_author() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_mask_anonymous_post_author ON public.community_posts;
CREATE TRIGGER trg_mask_anonymous_post_author
BEFORE INSERT OR UPDATE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.mask_anonymous_post_author();

DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
CREATE POLICY "Users can create their own posts" ON public.community_posts
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = COALESCE(user_id, anonymous_author_id));

DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts" ON public.community_posts
FOR UPDATE TO authenticated
USING (auth.uid() = COALESCE(user_id, anonymous_author_id));

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
CREATE POLICY "Users can delete their own posts" ON public.community_posts
FOR DELETE TO authenticated
USING (auth.uid() = COALESCE(user_id, anonymous_author_id));

-- 3) Post comments: mask user_id when parent post is anonymous
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS anonymous_author_id uuid;
REVOKE SELECT (anonymous_author_id) ON public.post_comments FROM anon, authenticated;
GRANT SELECT (anonymous_author_id) ON public.post_comments TO service_role;

CREATE OR REPLACE FUNCTION public.mask_anonymous_comment_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  parent_anonymous boolean;
BEGIN
  SELECT is_anonymous INTO parent_anonymous FROM public.community_posts WHERE id = NEW.post_id;
  IF parent_anonymous = true THEN
    NEW.anonymous_author_id := COALESCE(NEW.anonymous_author_id, NEW.user_id, auth.uid());
    NEW.user_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.mask_anonymous_comment_author() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_mask_anonymous_comment_author ON public.post_comments;
CREATE TRIGGER trg_mask_anonymous_comment_author
BEFORE INSERT OR UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.mask_anonymous_comment_author();

UPDATE public.post_comments c
SET anonymous_author_id = c.user_id, user_id = NULL
WHERE c.user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = c.post_id AND p.is_anonymous = true);

DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
CREATE POLICY "Users can create comments" ON public.post_comments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = COALESCE(user_id, anonymous_author_id));

DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;
CREATE POLICY "Users can update their own comments" ON public.post_comments
FOR UPDATE TO authenticated
USING (auth.uid() = COALESCE(user_id, anonymous_author_id));

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
CREATE POLICY "Users can delete their own comments" ON public.post_comments
FOR DELETE TO authenticated
USING (auth.uid() = COALESCE(user_id, anonymous_author_id));

-- 4) Follows: only the involved parties can read the relationship
DROP POLICY IF EXISTS "Authenticated users can view follows" ON public.follows;
CREATE POLICY "Users view follows involving themselves" ON public.follows
FOR SELECT TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);
