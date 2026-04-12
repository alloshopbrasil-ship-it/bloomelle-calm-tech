-- Add trial tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN has_used_trial BOOLEAN DEFAULT FALSE;

-- Create function to start trial for new users
CREATE OR REPLACE FUNCTION public.start_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only set trial for new users who haven't used it
  IF NEW.has_used_trial IS NULL OR NEW.has_used_trial = FALSE THEN
    NEW.trial_started_at := NOW();
    NEW.trial_ends_at := NOW() + INTERVAL '7 days';
    NEW.plan_type := 'premium';
    NEW.has_used_trial := TRUE;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-start trial on profile creation
DROP TRIGGER IF EXISTS trigger_start_user_trial ON public.profiles;
CREATE TRIGGER trigger_start_user_trial
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.start_user_trial();