-- Storage rules for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Only authenticated users can upload avatars
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
);

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
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);