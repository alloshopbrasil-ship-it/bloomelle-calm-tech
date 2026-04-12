
-- Create journal_images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal_images', 'journal_images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Journal images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal_images');

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own journal images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own images
CREATE POLICY "Users can update their own journal images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'journal_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own images
CREATE POLICY "Users can delete their own journal images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
