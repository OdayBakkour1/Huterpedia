import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFetchNews = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ useStaging = false }: { useStaging?: boolean } = {}) => {
      console.log(`Triggering news fetch... (Staging: ${useStaging})`);
      
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { staging: useStaging }
      });

      if (error) {
        console.error('Error invoking fetch-news function:', error);
        throw error;
      }

      console.log('News fetch result:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast({
        title: "News fetch completed",
        description: data?.message || "News articles have been updated",
      });
    },
    onError: (error) => {
      console.error('Failed to fetch news:', error);
      toast({
        title: "Error fetching news",
        description: "Failed to fetch latest news articles",
        variant: "destructive",
      });
    },
  });
};
