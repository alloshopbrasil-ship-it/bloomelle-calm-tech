
-- 1) Drop the overly permissive UPDATE policy on profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2) Create a restricted UPDATE policy that prevents plan_type/trial escalation
CREATE POLICY "Users can update own non-sensitive profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND plan_type IS NOT DISTINCT FROM (SELECT plan_type FROM public.profiles WHERE id = auth.uid())
  AND trial_ends_at IS NOT DISTINCT FROM (SELECT trial_ends_at FROM public.profiles WHERE id = auth.uid())
  AND trial_started_at IS NOT DISTINCT FROM (SELECT trial_started_at FROM public.profiles WHERE id = auth.uid())
  AND has_used_trial IS NOT DISTINCT FROM (SELECT has_used_trial FROM public.profiles WHERE id = auth.uid())
);

-- 3) Lock down password_reset_tokens - no client access at all
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Users can insert tokens" ON public.password_reset_tokens;

-- Ensure RLS is enabled (it should be already)
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Block all client access - tokens are managed only by service_role in edge functions
-- No policies = no access for anon/authenticated roles (secure by default with RLS on)
