
-- Create an RPC function for safe community post reads
CREATE OR REPLACE FUNCTION public.get_safe_community_posts()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  topic text,
  mood_emoji text,
  visibility text,
  is_anonymous boolean,
  is_flagged boolean,
  flag_reason text,
  image_url text,
  likes_count integer,
  comments_count integer,
  saves_count integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT
    cp.id,
    CASE WHEN cp.is_anonymous = true THEN NULL ELSE cp.user_id END,
    cp.content,
    cp.topic,
    cp.mood_emoji,
    cp.visibility,
    cp.is_anonymous,
    cp.is_flagged,
    cp.flag_reason,
    cp.image_url,
    cp.likes_count,
    cp.comments_count,
    cp.saves_count,
    cp.created_at
  FROM public.community_posts cp;
$$;
