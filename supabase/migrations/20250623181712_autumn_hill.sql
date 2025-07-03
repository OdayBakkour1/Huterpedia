/*
  # Add article cache bucket

  1. Storage
    - Create article-cache bucket for storing cached article content
    - Set up public access policy for article-cache bucket
*/

-- Create article-cache bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('article-cache', 'article-cache', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create policy to allow public read access to article-cache bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'article-cache');

-- Create policy to allow service role to upload to article-cache bucket
CREATE POLICY "Service Role Upload" ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'article-cache');

-- Create policy to allow service role to update objects in article-cache bucket
CREATE POLICY "Service Role Update" ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'article-cache');

-- Fix function search_path warnings (Supabase Security Advisor)
ALTER FUNCTION public.truncate_table()
SET search_path = public;

ALTER FUNCTION public.category_counts_today()
SET search_path = public;

ALTER FUNCTION public.check_subscription_status(uuid)
SET search_path = public;

ALTER FUNCTION public.get_user_subscription(uuid)
SET search_path = public;