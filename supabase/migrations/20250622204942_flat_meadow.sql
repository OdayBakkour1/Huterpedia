-- Create article-cache bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-cache', 'article-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Storage rules for article-cache bucket
CREATE POLICY "Article cache is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-cache')
ON CONFLICT DO NOTHING;

-- Only service role can upload to article-cache
CREATE POLICY "Only service role can upload article cache"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-cache' AND
  auth.role() = 'service_role'
)
ON CONFLICT DO NOTHING;

-- Only service role can update article cache
CREATE POLICY "Only service role can update article cache"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'article-cache' AND
  auth.role() = 'service_role'
)
ON CONFLICT DO NOTHING;

-- Only service role can delete article cache
CREATE POLICY "Only service role can delete article cache"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-cache' AND
  auth.role() = 'service_role'
)
ON CONFLICT DO NOTHING;