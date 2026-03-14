-- Create storage bucket for community posts images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-images', 'community-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for community images
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own community images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community images"
ON storage.objects FOR DELETE
USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);