
-- First, let's add columns to store article data directly in the bookmarks table
ALTER TABLE public.user_bookmarks 
ADD COLUMN title TEXT,
ADD COLUMN description TEXT,
ADD COLUMN source TEXT,
ADD COLUMN url TEXT,
ADD COLUMN category TEXT,
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN image_url TEXT,
ADD COLUMN cached_content_url TEXT,
ADD COLUMN cached_image_url TEXT,
ADD COLUMN cache_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN bookmarked_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing bookmarks to copy article data
UPDATE public.user_bookmarks 
SET 
  title = na.title,
  description = na.description,
  source = na.source,
  url = na.url,
  category = na.category,
  published_at = na.published_at,
  image_url = na.image_url,
  cached_content_url = na.cached_content_url,
  cached_image_url = na.cached_image_url,
  cache_updated_at = na.cache_updated_at
FROM public.news_articles na
WHERE user_bookmarks.article_id = na.id;

-- Remove the foreign key constraint to news_articles
ALTER TABLE public.user_bookmarks 
DROP CONSTRAINT IF EXISTS user_bookmarks_article_id_fkey;

-- Make title, source, category, and published_at required since they're essential
ALTER TABLE public.user_bookmarks 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN source SET NOT NULL,
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN published_at SET NOT NULL;
