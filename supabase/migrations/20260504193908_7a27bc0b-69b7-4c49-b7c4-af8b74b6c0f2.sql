
-- Enforce daily post limit (5/day for free)
CREATE OR REPLACE FUNCTION public.enforce_daily_post_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan text;
  daily_count integer;
BEGIN
  SELECT plan_type INTO user_plan FROM public.profiles WHERE id = NEW.user_id;
  IF COALESCE(user_plan, 'free') = 'premium' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO daily_count
  FROM public.community_posts
  WHERE user_id = NEW.user_id
    AND created_at >= date_trunc('day', now());

  IF daily_count >= 5 THEN
    RAISE EXCEPTION 'Free plan limit: maximum 5 community posts per day. Upgrade to Premium for unlimited posts.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_daily_post_limit_trg ON public.community_posts;
CREATE TRIGGER enforce_daily_post_limit_trg
BEFORE INSERT ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.enforce_daily_post_limit();

-- Enforce group membership limit (2 for free)
CREATE OR REPLACE FUNCTION public.enforce_group_membership_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan text;
  group_count integer;
BEGIN
  SELECT plan_type INTO user_plan FROM public.profiles WHERE id = NEW.user_id;
  IF COALESCE(user_plan, 'free') = 'premium' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO group_count
  FROM public.group_members
  WHERE user_id = NEW.user_id;

  IF group_count >= 2 THEN
    RAISE EXCEPTION 'Free plan limit: maximum 2 groups. Upgrade to Premium for unlimited groups.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_group_membership_limit_trg ON public.group_members;
CREATE TRIGGER enforce_group_membership_limit_trg
BEFORE INSERT ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.enforce_group_membership_limit();

-- Make sure existing limit triggers are attached
DROP TRIGGER IF EXISTS enforce_goal_limit_trg ON public.goals;
CREATE TRIGGER enforce_goal_limit_trg
BEFORE INSERT ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.enforce_goal_limit();

DROP TRIGGER IF EXISTS enforce_journal_limit_trg ON public.journal_entries;
CREATE TRIGGER enforce_journal_limit_trg
BEFORE INSERT ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_journal_limit();

-- Lock down execution of the new functions to authenticated only
REVOKE EXECUTE ON FUNCTION public.enforce_daily_post_limit() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.enforce_group_membership_limit() FROM anon, public;
