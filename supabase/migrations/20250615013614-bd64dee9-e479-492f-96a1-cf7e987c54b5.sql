-- Create a temporary staging table for news articles
CREATE TABLE IF NOT EXISTS public.news_articles_staging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,
  url TEXT,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  cached_content_url TEXT,
  cached_image_url TEXT,
  cache_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_processed BOOLEAN DEFAULT false,
  has_valid_description BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_staging_processed ON public.news_articles_staging(is_processed);
CREATE INDEX IF NOT EXISTS idx_news_articles_staging_title_source ON public.news_articles_staging(title, source);
CREATE INDEX IF NOT EXISTS idx_news_articles_main_title_source ON public.news_articles(title, source);

-- Create a function to clean and deduplicate articles
CREATE OR REPLACE FUNCTION public.process_staging_articles()
RETURNS TABLE(
  total_staged INTEGER,
  duplicates_removed INTEGER,
  articles_processed INTEGER,
  articles_moved INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _total_staged INTEGER;
  _duplicates_removed INTEGER;
  _articles_processed INTEGER;
  _articles_moved INTEGER;
BEGIN
  -- Count total staged articles
  SELECT COUNT(*) INTO _total_staged FROM public.news_articles_staging WHERE NOT is_processed;
  
  -- Remove duplicates within staging table (keep the latest)
  WITH duplicate_articles AS (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY title, source 
             ORDER BY created_at DESC
           ) as rn
    FROM public.news_articles_staging
    WHERE NOT is_processed
  )
  DELETE FROM public.news_articles_staging 
  WHERE id IN (
    SELECT id FROM duplicate_articles WHERE rn > 1
  );
  
  GET DIAGNOSTICS _duplicates_removed = ROW_COUNT;
  
  -- Process articles (check descriptions, clean data)
  UPDATE public.news_articles_staging 
  SET 
    is_processed = true,
    has_valid_description = (
      description IS NOT NULL 
      AND LENGTH(TRIM(description)) > 20 
      AND description !~ '<[^>]*>'  -- Simple HTML tag check
    )
  WHERE NOT is_processed;
  
  GET DIAGNOSTICS _articles_processed = ROW_COUNT;
  
  -- Clear main table
  DELETE FROM public.news_articles;
  
  -- Move processed articles to main table (only articles with valid descriptions or those that can be fixed)
  INSERT INTO public.news_articles (
    title, description, source, url, category, published_at,
    image_url, cached_content_url, cached_image_url, cache_updated_at
  )
  SELECT 
    title,
    CASE 
      WHEN has_valid_description THEN description
      ELSE CONCAT('This cybersecurity article from ', source, ' discusses important security developments. Click to read the full article for detailed information.')
    END as description,
    source,
    url,
    category,
    published_at,
    image_url,
    cached_content_url,
    cached_image_url,
    cache_updated_at
  FROM public.news_articles_staging 
  WHERE is_processed = true
  AND NOT EXISTS (
    SELECT 1 FROM public.news_articles 
    WHERE news_articles.title = news_articles_staging.title 
    AND news_articles.source = news_articles_staging.source
  );
  
  GET DIAGNOSTICS _articles_moved = ROW_COUNT;
  
  -- Clear staging table
  DELETE FROM public.news_articles_staging WHERE is_processed = true;
  
  -- Return results
  total_staged := _total_staged;
  duplicates_removed := _duplicates_removed;
  articles_processed := _articles_processed;
  articles_moved := _articles_moved;
  
  RETURN QUERY SELECT total_staged, duplicates_removed, articles_processed, articles_moved;
END;
$$;

-- Update the cron job to run fetch-news every 10 minutes (for staging)
SELECT cron.unschedule('fetch-news-every-15-minutes');

SELECT cron.schedule(
  'fetch-news-to-staging-every-10-minutes',
  '*/10 * * * *',
  $$
  DECLARE
    jwt_token TEXT;
  BEGIN
    -- This is a placeholder for a secure way to get a token for a specific role
    -- For now, we get the current user's token, assuming the cron runs as an authenticated user
    -- A better long-term solution would be to create a specific user for cron jobs
    jwt_token := auth.jwt();
    
    PERFORM net.http_post(
        url:='https://gzpayeckolpfflgvkqvh.supabase.co/functions/v1/fetch-news',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || jwt_token
        ),
        body:='{"staging": true}'::jsonb
    );
  END;
  $$
);

-- Add a cron job to process and move articles every 15 minutes
SELECT cron.schedule(
  'process-articles-every-15-minutes',
  '*/15 * * * *',
  $$
  SELECT public.process_staging_articles();
  $$
);
