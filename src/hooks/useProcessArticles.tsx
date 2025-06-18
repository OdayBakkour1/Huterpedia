
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProcessArticles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Triggering article processing...');
      
      const { data, error } = await supabase.rpc('process_staging_articles');

      if (error) {
        console.error('Error processing articles:', error);
        throw error;
      }

      console.log('Article processing result:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      
      if (data && data.length > 0) {
        const result = data[0];
        toast({
          title: "Articles processed successfully",
          description: `Processed ${result.articles_processed} articles, removed ${result.duplicates_removed} duplicates, moved ${result.articles_moved} to main table`,
        });
      } else {
        toast({
          title: "Articles processed",
          description: "Article processing completed",
        });
      }
    },
    onError: (error) => {
      console.error('Failed to process articles:', error);
      toast({
        title: "Error processing articles",
        description: "Failed to process staged articles",
        variant: "destructive",
      });
    },
  });
};
