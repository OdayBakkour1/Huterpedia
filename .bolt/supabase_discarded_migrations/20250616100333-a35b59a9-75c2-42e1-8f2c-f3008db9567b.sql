
-- Fix unindexed foreign keys and remove unused index for better performance

-- Add index for payment_methods.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);

-- Add index for user_bookmarks.article_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_article_id ON public.user_bookmarks(article_id);

-- Remove unused index on news_articles
DROP INDEX IF EXISTS idx_news_articles_cached_content;

-- Add useful indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON public.news_articles(source);
