
-- Enable Row Level Security on news_articles_staging table
ALTER TABLE public.news_articles_staging ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to manage staging articles
CREATE POLICY "Only admins can manage staging articles" 
  ON public.news_articles_staging 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create policy to allow the service role (for cron jobs) to manage staging articles
CREATE POLICY "Service role can manage staging articles" 
  ON public.news_articles_staging 
  FOR ALL 
  TO service_role 
  USING (true);
