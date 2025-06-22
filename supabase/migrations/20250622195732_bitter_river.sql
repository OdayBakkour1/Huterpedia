/*
  # Add storage rules for avatar uploads

  1. Security
    - Add storage policies for avatar uploads
    - Restrict file types to JPG and PNG only
    - Ensure users can only access their own avatar folder
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage rules for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars')
ON CONFLICT DO NOTHING;

-- Only authenticated users can upload avatars with file type restrictions
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid AND
  (storage.extension(name) = 'jpg' OR 
   storage.extension(name) = 'jpeg' OR 
   storage.extension(name) = 'png') AND
  (LOWER(mimetype) = 'image/jpeg' OR 
   LOWER(mimetype) = 'image/jpg' OR 
   LOWER(mimetype) = 'image/png')
)
ON CONFLICT DO NOTHING;

-- Users can update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid AND
  (storage.extension(name) = 'jpg' OR 
   storage.extension(name) = 'jpeg' OR 
   storage.extension(name) = 'png') AND
  (LOWER(mimetype) = 'image/jpeg' OR 
   LOWER(mimetype) = 'image/jpg' OR 
   LOWER(mimetype) = 'image/png')
)
ON CONFLICT DO NOTHING;

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
)
ON CONFLICT DO NOTHING;