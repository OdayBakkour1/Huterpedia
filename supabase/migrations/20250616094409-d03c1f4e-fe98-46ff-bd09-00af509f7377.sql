
-- Remove articles older than 48 hours from the main news_articles table
DELETE FROM public.news_articles 
WHERE published_at < (now() - interval '48 hours');
