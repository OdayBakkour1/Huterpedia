
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalyticsManagement = () => {
  const queryClient = useQueryClient();

  const updateAnalyticsMetrics = useMutation({
    mutationFn: async () => {
      // Get current counts from database
      const [usersResult, articlesResult, bookmarksResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('news_articles').select('id', { count: 'exact' }),
        supabase.from('user_bookmarks').select('id', { count: 'exact' })
      ]);

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const monthlySignupsResult = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', `${currentMonth}-01T00:00:00.000Z`)
        .lt('created_at', `${currentMonth}-31T23:59:59.999Z`);

      // Update analytics table with current counts
      const updates = [
        { metric_name: 'total_users', metric_value: usersResult.count || 0 },
        { metric_name: 'total_articles', metric_value: articlesResult.count || 0 },
        { metric_name: 'total_bookmarks', metric_value: bookmarksResult.count || 0 },
        { metric_name: 'monthly_signups', metric_value: monthlySignupsResult.count || 0 }
      ];

      for (const update of updates) {
        await supabase
          .from('analytics')
          .upsert({
            ...update,
            date_recorded: new Date().toISOString().split('T')[0]
          }, {
            onConflict: 'metric_name,date_recorded'
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const getAnalyticsSummary = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('date_recorded', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      // Group by metric and calculate trends
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.metric_name]) {
          acc[item.metric_name] = [];
        }
        acc[item.metric_name].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate growth rates
      const summary = Object.entries(grouped).map(([metricName, values]) => {
        const latest = values[0];
        const previous = values[1];
        const growthRate = previous 
          ? ((latest.metric_value - previous.metric_value) / previous.metric_value) * 100 
          : 0;

        return {
          metricName,
          currentValue: latest.metric_value,
          previousValue: previous?.metric_value || 0,
          growthRate: Math.round(growthRate * 100) / 100,
          trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable'
        };
      });

      return summary;
    },
  });

  return {
    updateAnalyticsMetrics,
    getAnalyticsSummary,
  };
};
