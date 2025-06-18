
-- Create storage bucket for article content caching
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-cache', 'article-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for article cache bucket
CREATE POLICY "Anyone can view cached articles" ON storage.objects
FOR SELECT USING (bucket_id = 'article-cache');

CREATE POLICY "System can upload article cache" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'article-cache');

CREATE POLICY "System can update article cache" ON storage.objects
FOR UPDATE USING (bucket_id = 'article-cache');

CREATE POLICY "System can delete article cache" ON storage.objects
FOR DELETE USING (bucket_id = 'article-cache');

-- Create RLS policies for article images bucket
CREATE POLICY "Anyone can view article images" ON storage.objects
FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "System can upload article images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'article-images');

CREATE POLICY "System can update article images" ON storage.objects
FOR UPDATE USING (bucket_id = 'article-images');

CREATE POLICY "System can delete article images" ON storage.objects
FOR DELETE USING (bucket_id = 'article-images');

-- Add cache columns to news_articles table
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS cached_content_url TEXT,
ADD COLUMN IF NOT EXISTS cached_image_url TEXT,
ADD COLUMN IF NOT EXISTS cache_updated_at TIMESTAMP WITH TIME ZONE;
