
-- Make journal_images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'journal_images';

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Journal images are publicly accessible" ON storage.objects;

-- Create private SELECT policy - only owner can view
CREATE POLICY "Users can view their own journal images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
