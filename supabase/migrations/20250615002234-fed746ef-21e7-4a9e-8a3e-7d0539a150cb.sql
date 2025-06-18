
-- Create a table to track AI summarization usage per user
CREATE TABLE public.ai_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL DEFAULT 'ai_summarize',
  usage_count INTEGER NOT NULL DEFAULT 0,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type, month_year)
);

-- Enable Row Level Security
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own usage
CREATE POLICY "Users can view their own AI usage" 
  ON public.ai_usage_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own usage records
CREATE POLICY "Users can create their own AI usage records" 
  ON public.ai_usage_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own usage records
CREATE POLICY "Users can update their own AI usage records" 
  ON public.ai_usage_tracking 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a function to get or create usage record for current month
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
AS $$
DECLARE
  current_month TEXT;
  usage_record RECORD;
BEGIN
  -- Get current month in YYYY-MM format
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Try to get existing record
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

-- Create a function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  _user_id UUID,
  _feature_type TEXT DEFAULT 'ai_summarize'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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
