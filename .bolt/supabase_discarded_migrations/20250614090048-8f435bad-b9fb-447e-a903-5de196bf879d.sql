
-- Create news_sources table
CREATE TABLE public.news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'rss',
  category TEXT NOT NULL DEFAULT 'Threats',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add subscription column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription TEXT DEFAULT 'free';

-- Enable RLS on news_sources table
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;

-- Create policy for news_sources (admin only access)
CREATE POLICY "Only admins can manage news sources" 
  ON public.news_sources 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));
