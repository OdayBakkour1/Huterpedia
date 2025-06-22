
-- Fix RLS performance issues by wrapping auth.uid() calls in SELECT statements
-- This prevents re-evaluation for each row and improves query performance

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Fix user_bookmarks table policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.user_bookmarks;

CREATE POLICY "Users can view their own bookmarks"
  ON public.user_bookmarks
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.user_bookmarks
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.user_bookmarks
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Fix user_roles table policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Fix analytics table policies
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics;
DROP POLICY IF EXISTS "Admins can manage analytics" ON public.analytics;

CREATE POLICY "Admins can manage analytics"
  ON public.analytics
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Fix payment_methods table policies
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can view all payment methods" ON public.payment_methods;

CREATE POLICY "Users can manage their own payment methods"
  ON public.payment_methods
  FOR ALL
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all payment methods"
  ON public.payment_methods
  FOR SELECT
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Fix news_articles table policies
DROP POLICY IF EXISTS "Admins can manage news articles" ON public.news_articles;

CREATE POLICY "Admins can manage news articles"
  ON public.news_articles
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Fix news_sources table policies
DROP POLICY IF EXISTS "Only admins can manage news sources" ON public.news_sources;

CREATE POLICY "Only admins can manage news sources"
  ON public.news_sources
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Fix news_articles_staging table policies
DROP POLICY IF EXISTS "Only admins can manage staging articles" ON public.news_articles_staging;

CREATE POLICY "Only admins can manage staging articles"
  ON public.news_articles_staging
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Fix ai_usage_tracking table policies
DROP POLICY IF EXISTS "Users can view their own AI usage" ON public.ai_usage_tracking;
DROP POLICY IF EXISTS "Users can create their own AI usage records" ON public.ai_usage_tracking;
DROP POLICY IF EXISTS "Users can update their own AI usage records" ON public.ai_usage_tracking;

CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_tracking
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own AI usage records"
  ON public.ai_usage_tracking
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own AI usage records"
  ON public.ai_usage_tracking
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

-- Fix user_feed_preferences table policies
DROP POLICY IF EXISTS "Users can view their own feed preferences" ON public.user_feed_preferences;
DROP POLICY IF EXISTS "Users can insert their own feed preferences" ON public.user_feed_preferences;
DROP POLICY IF EXISTS "Users can update their own feed preferences" ON public.user_feed_preferences;
DROP POLICY IF EXISTS "Users can delete their own feed preferences" ON public.user_feed_preferences;

CREATE POLICY "Users can view their own feed preferences"
  ON public.user_feed_preferences
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own feed preferences"
  ON public.user_feed_preferences
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own feed preferences"
  ON public.user_feed_preferences
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own feed preferences"
  ON public.user_feed_preferences
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);
