
-- Fix 1: Restrict community-images uploads to user's own folder
-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload community images" ON storage.objects;
DROP POLICY IF EXISTS "community-images insert" ON storage.objects;

-- Create a new INSERT policy with path restriction
CREATE POLICY "Users can upload their own community images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Fix 2: Remove user-facing INSERT policy on notifications
-- Notifications should only be created by triggers/service_role
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
