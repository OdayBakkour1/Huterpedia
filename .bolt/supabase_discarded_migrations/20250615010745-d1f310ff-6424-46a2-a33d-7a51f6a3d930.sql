
-- Fix the ambiguous column reference in get_or_create_monthly_usage function
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
