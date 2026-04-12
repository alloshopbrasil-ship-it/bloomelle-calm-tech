-- Fix: Private Group Members Publicly Visible
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;

-- Create a proper policy that respects group privacy
-- Public group members: visible to all authenticated users
-- Private group members: only visible to members of that group
CREATE POLICY "Users can view appropriate group members"
ON public.group_members FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    -- User can see members of public groups
    group_id IN (
      SELECT id FROM groups WHERE is_private = false
    )
    OR
    -- User can see members of private groups they belong to
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  )
);