
-- Fix Auth RLS Initialization Plan issues by wrapping auth.uid() in SELECT statements
-- and consolidate multiple permissive policies for better performance

-- Drop existing problematic policies for coupon_codes
DROP POLICY IF EXISTS "Admins can manage coupon codes" ON public.coupon_codes;
DROP POLICY IF EXISTS "Users can view active coupon codes" ON public.coupon_codes;

-- Create optimized single policy for coupon_codes SELECT
CREATE POLICY "View coupon codes policy" 
  ON public.coupon_codes 
  FOR SELECT 
  USING (
    -- Users can view active coupons OR admins can view all
    (is_active = true AND (valid_until IS NULL OR valid_until > now()))
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  );

-- Create optimized admin management policy for coupon_codes
CREATE POLICY "Admin manage coupon codes" 
  ON public.coupon_codes 
  FOR ALL 
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

-- Drop existing problematic policies for coupon_redemptions
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.coupon_redemptions;
DROP POLICY IF EXISTS "Users can create their own redemptions" ON public.coupon_redemptions;
DROP POLICY IF EXISTS "Admins can view all redemptions" ON public.coupon_redemptions;

-- Create optimized single policy for coupon_redemptions SELECT
CREATE POLICY "View redemptions policy" 
  ON public.coupon_redemptions 
  FOR SELECT 
  USING (
    user_id = (SELECT auth.uid()) 
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  );

-- Create optimized policy for coupon_redemptions INSERT
CREATE POLICY "Create own redemptions" 
  ON public.coupon_redemptions 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Drop existing problematic policies for news_articles
DROP POLICY IF EXISTS "Admins can manage news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Anyone can view news articles" ON public.news_articles;

-- Create optimized single policy for news_articles
CREATE POLICY "View news articles policy" 
  ON public.news_articles 
  FOR SELECT 
  USING (true); -- Public read access

CREATE POLICY "Admin manage news articles" 
  ON public.news_articles 
  FOR ALL 
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

-- Drop existing problematic policies for payment_methods
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can view all payment methods" ON public.payment_methods;

-- Create optimized single policy for payment_methods
CREATE POLICY "Manage payment methods policy" 
  ON public.payment_methods 
  FOR ALL 
  USING (
    user_id = (SELECT auth.uid()) 
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  )
  WITH CHECK (
    user_id = (SELECT auth.uid()) 
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  );

-- Drop existing problematic policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create optimized policies for profiles
CREATE POLICY "View profiles policy"
  ON public.profiles
  FOR SELECT
  USING (
    (SELECT auth.uid()) = id 
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Update profiles policy"
  ON public.profiles
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = id 
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  )
  WITH CHECK (
    (SELECT auth.uid()) = id 
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

-- Drop existing problematic policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create optimized single policy for user_roles SELECT
CREATE POLICY "View roles policy"
  ON public.user_roles
  FOR SELECT
  USING (
    user_id = (SELECT auth.uid()) 
    OR 
    public.has_role((SELECT auth.uid()), 'admin')
  );

-- Create optimized admin management policy for user_roles
CREATE POLICY "Admin manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));
