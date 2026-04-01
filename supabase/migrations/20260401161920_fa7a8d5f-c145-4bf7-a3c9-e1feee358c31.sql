
-- Create a secure view for reading community posts that masks user_id for anonymous posts
CREATE OR REPLACE VIEW public.community_posts_safe AS
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

-- Grant access to the view for authenticated users
GRANT SELECT ON public.community_posts_safe TO authenticated;
GRANT SELECT ON public.community_posts_safe TO anon;
