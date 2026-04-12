
-- 1. Add DELETE policy on profiles
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- 2. Add DELETE policy on popup_states
CREATE POLICY "Users can delete their own popup states"
ON public.popup_states FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Add DELETE policy on user_streaks
CREATE POLICY "Users can delete their own streaks"
ON public.user_streaks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
