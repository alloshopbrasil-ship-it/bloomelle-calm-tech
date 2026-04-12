
-- Recreate view with SECURITY INVOKER to respect RLS
CREATE OR REPLACE VIEW public.community_posts_safe 
WITH (security_invoker = true) AS
SELECT
  id,
  CASE WHEN is_anonymous = true THEN NULL ELSE user_id END AS user_id,
  content,
  topic,
  mood_emoji,
  visibility,
  is_anonymous,
  is_flagged,
  flag_reason,
  image_url,
  likes_count,
  comments_count,
  saves_count,
  created_at
FROM public.community_posts;
