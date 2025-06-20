-- Drop the existing, separate policies
DROP POLICY IF EXISTS "Users can view their own feed preferences" ON public.user_feed_preferences;
DROP POLICY IF EXISTS "Users can insert their own feed preferences" ON public.user_feed_preferences;
DROP POLICY IF EXISTS "Users can update their own feed preferences" ON public.user_feed_preferences;
DROP POLICY IF EXISTS "Users can delete their own feed preferences" ON public.user_feed_preferences;

-- Create a single, consolidated policy for all actions
CREATE POLICY "Users can manage their own feed preferences"
  ON public.user_feed_preferences
  FOR ALL
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id); 