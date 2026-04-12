
-- 1. Fix profiles_public: remove plan_type exposure
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, name, avatar_url, is_anonymous, created_at
  FROM public.profiles;

-- 2. Fix community_posts_safe: add security_invoker and hide flag_reason
DROP VIEW IF EXISTS public.community_posts_safe;
CREATE VIEW public.community_posts_safe
WITH (security_invoker=on) AS
  SELECT
    cp.id,
    CASE WHEN cp.is_anonymous = true THEN NULL ELSE cp.user_id END AS user_id,
    cp.content,
    cp.topic,
    cp.mood_emoji,
    cp.visibility,
    cp.is_anonymous,
    cp.is_flagged,
    cp.image_url,
    cp.likes_count,
    cp.comments_count,
    cp.saves_count,
    cp.created_at
  FROM public.community_posts cp
  WHERE cp.is_flagged = false;

-- 3. Restrict follows SELECT to authenticated users only
DROP POLICY IF EXISTS "Users can view follows" ON public.follows;
CREATE POLICY "Authenticated users can view follows"
  ON public.follows FOR SELECT
  TO authenticated
  USING (true);
