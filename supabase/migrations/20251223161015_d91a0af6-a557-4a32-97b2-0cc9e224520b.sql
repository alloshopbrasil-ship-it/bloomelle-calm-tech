-- Set replica identity for full row data
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;

-- Enable realtime for tables not yet added
DO $$ 
BEGIN
  -- Check and add post_comments if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'post_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
  END IF;
  
  -- Check and add follows if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'follows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
  END IF;
  
  -- Check and add notifications if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Create trigger to create notification when someone likes a post
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  liker_name text;
BEGIN
  -- Get the post author
  SELECT user_id INTO post_author_id FROM public.community_posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker's name
  SELECT name INTO liker_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
  VALUES (
    post_author_id,
    'like',
    'Nova curtida no seu post 💕',
    COALESCE(liker_name, 'Alguém') || ' curtiu sua publicação',
    NEW.post_id,
    'post'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for likes
DROP TRIGGER IF EXISTS on_post_like ON public.post_likes;
CREATE TRIGGER on_post_like
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Create trigger to create notification when someone comments on a post
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  commenter_name text;
BEGIN
  -- Get the post author
  SELECT user_id INTO post_author_id FROM public.community_posts WHERE id = NEW.post_id;
  
  -- Don't notify if user comments on their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter's name
  SELECT name INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
  VALUES (
    post_author_id,
    'comment',
    'Novo comentário no seu post 💬',
    COALESCE(commenter_name, 'Alguém') || ' comentou na sua publicação',
    NEW.post_id,
    'post'
  );
  
  -- Update comments count
  UPDATE public.community_posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for comments
DROP TRIGGER IF EXISTS on_post_comment ON public.post_comments;
CREATE TRIGGER on_post_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Create trigger to create notification when someone follows a user
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_name text;
BEGIN
  -- Get follower's name
  SELECT name INTO follower_name FROM public.profiles WHERE id = NEW.follower_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
  VALUES (
    NEW.following_id,
    'follow',
    'Nova seguidora 🌸',
    COALESCE(follower_name, 'Alguém') || ' começou a te seguir',
    NEW.follower_id,
    'user'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for follows
DROP TRIGGER IF EXISTS on_user_follow ON public.follows;
CREATE TRIGGER on_user_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();