
-- Fix search_path security issue for get_or_create_monthly_usage function
CREATE OR REPLACE FUNCTION public.get_or_create_monthly_usage(
  _user_id UUID,
  _feature_type TEXT DEFAULT 'ai_summarize'
)
RETURNS TABLE (
  id UUID,
  usage_count INTEGER,
  month_year TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
  usage_record RECORD;
BEGIN
  -- Get current month in YYYY-MM format
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Try to get existing record with explicit table prefix
  SELECT aut.id, aut.usage_count, aut.month_year INTO usage_record
  FROM public.ai_usage_tracking aut
  WHERE aut.user_id = _user_id 
    AND aut.feature_type = _feature_type 
    AND aut.month_year = current_month;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.ai_usage_tracking (user_id, feature_type, usage_count, month_year)
    VALUES (_user_id, _feature_type, 0, current_month)
    RETURNING ai_usage_tracking.id, ai_usage_tracking.usage_count, ai_usage_tracking.month_year INTO usage_record;
  END IF;
  
  -- Return the record
  RETURN QUERY SELECT usage_record.id, usage_record.usage_count, usage_record.month_year;
END;
$$;

-- Fix search_path security issue for increment_ai_usage function
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  _user_id UUID,
  _feature_type TEXT DEFAULT 'ai_summarize'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
  current_usage INTEGER;
  max_usage INTEGER := 15; -- Monthly limit
BEGIN
  -- Get current month in YYYY-MM format
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current usage count
  SELECT aut.usage_count INTO current_usage
  FROM public.ai_usage_tracking aut
  WHERE aut.user_id = _user_id 
    AND aut.feature_type = _feature_type 
    AND aut.month_year = current_month;
  
  -- If no record exists, create one and set usage to 1
  IF NOT FOUND THEN
    INSERT INTO public.ai_usage_tracking (user_id, feature_type, usage_count, month_year)
    VALUES (_user_id, _feature_type, 1, current_month);
    RETURN TRUE;
  END IF;
  
  -- Check if user has reached the limit
  IF current_usage >= max_usage THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage count
  UPDATE public.ai_usage_tracking
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE user_id = _user_id 
    AND feature_type = _feature_type 
    AND month_year = current_month;
  
  RETURN TRUE;
END;
$$;

-- Fix search_path security issue for process_staging_articles function
CREATE OR REPLACE FUNCTION public.process_staging_articles()
RETURNS TABLE(
  total_staged INTEGER,
  duplicates_removed INTEGER,
  articles_processed INTEGER,
  articles_moved INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path security issue for get_personalized_feed function
CREATE OR REPLACE FUNCTION public.get_personalized_feed(_user_id uuid)
RETURNS TABLE(
  id uuid, 
  title text, 
  description text, 
  source text, 
  url text, 
  category text, 
  published_at timestamp with time zone, 
  image_url text, 
  cached_content_url text, 
  cached_image_url text, 
  cache_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_prefs RECORD;
BEGIN
  -- Get user preferences
  SELECT * INTO user_prefs 
  FROM public.user_feed_preferences 
  WHERE user_id = _user_id;
  
  -- If no preferences found, return default feed
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT na.id, na.title, na.description, na.source, na.url, na.category, 
           na.published_at, na.image_url, na.cached_content_url, 
           na.cached_image_url, na.cache_updated_at
    FROM public.news_articles na
    WHERE na.published_at >= (now() - interval '7 days')
    ORDER BY na.published_at DESC
    LIMIT 50;
    RETURN;
  END IF;
  
  -- Return personalized feed based on preferences
  RETURN QUERY
  SELECT na.id, na.title, na.description, na.source, na.url, na.category, 
         na.published_at, na.image_url, na.cached_content_url, 
         na.cached_image_url, na.cache_updated_at
  FROM public.news_articles na
  WHERE 
    -- Date filter
    na.published_at >= (now() - (user_prefs.date_range_days || ' days')::interval)
    -- Source filter (if specified)
    AND (
      array_length(user_prefs.preferred_sources, 1) IS NULL 
      OR na.source = ANY(user_prefs.preferred_sources)
    )
    -- Category filter (if specified)
    AND (
      array_length(user_prefs.preferred_categories, 1) IS NULL 
      OR na.category = ANY(user_prefs.preferred_categories)
    )
    -- Cached content filter
    AND (
      NOT user_prefs.show_cached_only 
      OR na.cached_content_url IS NOT NULL
    )
  ORDER BY 
    CASE 
      WHEN user_prefs.sort_preference = 'newest' THEN na.published_at 
    END DESC,
    CASE 
      WHEN user_prefs.sort_preference = 'oldest' THEN na.published_at 
    END ASC,
    CASE 
      WHEN user_prefs.sort_preference = 'relevance' THEN 
        CASE WHEN na.cached_content_url IS NOT NULL THEN 1 ELSE 2 END
    END ASC,
    na.published_at DESC
  LIMIT user_prefs.max_articles;
END;
$$;

-- Fix search_path security issue for get_weekly_articles_summary function
CREATE OR REPLACE FUNCTION public.get_weekly_articles_summary()
RETURNS TABLE(
  source text, 
  article_count integer, 
  latest_article_title text, 
  latest_article_url text, 
  latest_article_published_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    na.source,
    COUNT(na.id)::INTEGER as article_count,
    (ARRAY_AGG(na.title ORDER BY na.published_at DESC))[1] as latest_article_title,
    (ARRAY_AGG(na.url ORDER BY na.published_at DESC))[1] as latest_article_url,
    MAX(na.published_at) as latest_article_published_at
  FROM public.news_articles na
  WHERE na.published_at >= (now() - interval '7 days')
  GROUP BY na.source
  ORDER BY MAX(na.published_at) DESC;
END;
$$;

-- Fix search_path security issue for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Fix search_path security issue for has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Move pg_net extension from public schema to extensions schema
DROP EXTENSION IF EXISTS pg_net;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
