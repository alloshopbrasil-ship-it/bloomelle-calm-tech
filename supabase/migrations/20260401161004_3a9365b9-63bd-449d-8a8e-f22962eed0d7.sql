
-- Trigger: Free users max 3 active goals
CREATE OR REPLACE FUNCTION public.enforce_goal_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_plan text;
  active_count integer;
BEGIN
  SELECT plan_type INTO user_plan FROM public.profiles WHERE id = NEW.user_id;
  
  IF COALESCE(user_plan, 'free') = 'premium' THEN
    RETURN NEW;
  END IF;
  
  SELECT count(*) INTO active_count
  FROM public.goals
  WHERE user_id = NEW.user_id AND is_completed = false;
  
  IF active_count >= 3 THEN
    RAISE EXCEPTION 'Free plan limit: maximum 3 active goals. Upgrade to Premium for unlimited goals.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_goal_limit_trigger
BEFORE INSERT ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.enforce_goal_limit();

-- Trigger: Free users max 5 journal entries per month
CREATE OR REPLACE FUNCTION public.enforce_journal_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_plan text;
  monthly_count integer;
BEGIN
  SELECT plan_type INTO user_plan FROM public.profiles WHERE id = NEW.user_id;
  
  IF COALESCE(user_plan, 'free') = 'premium' THEN
    RETURN NEW;
  END IF;
  
  SELECT count(*) INTO monthly_count
  FROM public.journal_entries
  WHERE user_id = NEW.user_id
    AND created_at >= date_trunc('month', now());
  
  IF monthly_count >= 5 THEN
    RAISE EXCEPTION 'Free plan limit: maximum 5 journal entries per month. Upgrade to Premium for unlimited entries.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_journal_limit_trigger
BEFORE INSERT ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.enforce_journal_limit();
