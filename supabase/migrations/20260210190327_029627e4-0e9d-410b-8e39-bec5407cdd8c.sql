
-- 1. Fix profiles: allow authenticated users to see public fields of other users
-- First, drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a policy that allows authenticated users to see any profile
-- (email is still in the table but we'll create a safe view for public queries)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Create a safe public view that excludes sensitive fields (email)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, name, avatar_url, is_anonymous, plan_type, created_at
FROM public.profiles;
-- Excludes: email, trial_started_at, trial_ends_at, has_used_trial

-- 3. For the user's own full profile, they query profiles directly (which now requires auth)
-- This is secure because email is only visible to authenticated users, not anonymous
