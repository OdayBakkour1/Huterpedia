-- Unscheduling the 15-minute cron job for processing articles,
-- as this is now handled by the fetch-news Edge Function.
SELECT cron.unschedule('process-articles-every-15-minutes'); 