import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanHtmlContent, isValidDescription } from '@/utils/textUtils';

export const useProcessStagedArticles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Starting staged article processing...');

      const { data: stagedArticles, error: fetchError } = await supabase
        .from('news_articles_staging')
        .select('*');

      if (fetchError) {
        console.error('Error fetching staged articles:', fetchError);
        throw fetchError;
      }

      if (!stagedArticles || stagedArticles.length === 0) {
        return {
          processedCount: 0,
          movedCount: 0,
          deletedCount: 0
        };
      }

      let processedCount = 0;
      let movedCount = 0;
      
      const processedArticles = await Promise.all(stagedArticles.map(async (article) => {
        const cleanedTitle = cleanHtmlContent(article.title);
        let cleanedDescription = cleanHtmlContent(article.description || '');

        if (!isValidDescription(article.description)) {
          try {
            const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-description', {
              body: {
                title: cleanedTitle,
                url: article.url,
                source: article.source
              }
            });

            if (!aiError && aiData?.description) {
              cleanedDescription = aiData.description;
            } else {
              cleanedDescription = `This cybersecurity article from ${article.source} discusses important security developments. Click to read the full article for detailed information.`;
            }
          } catch (error) {
            console.error('Error generating AI description for staged article:', article.id, error);
            cleanedDescription = `This cybersecurity article from ${article.source} discusses important security developments. Click to read the full article for detailed information.`;
          }
        }
        
        processedCount++;
        return {
          ...article,
          title: cleanedTitle,
          description: cleanedDescription,
        };
      }));

      // Insert processed articles into the production table
      const { data: movedData, error: insertError } = await supabase
        .from('news_articles')
        .insert(processedArticles.map(({ id, ...rest }) => rest)) // Exclude staging ID
        .select();

      if (insertError) {
        console.error('Error moving articles to production:', insertError);
        throw insertError;
      }
      
      movedCount = movedData?.length || 0;

      // Delete the processed articles from the staging table
      const processedIds = stagedArticles.map(a => a.id);
      const { error: deleteError } = await supabase
        .from('news_articles_staging')
        .delete()
        .in('id', processedIds);
        
      if (deleteError) {
        console.error('Error deleting staged articles:', deleteError);
        // Don't throw here, as articles were already moved
      }

      return {
        processedCount,
        movedCount,
        deletedCount: processedIds.length,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-staging'] });
      toast({
        title: "Staged articles processed",
        description: `Processed ${data.processedCount}, moved ${data.movedCount}, and cleaned ${data.deletedCount} articles from staging.`,
      });
    },
    onError: (error) => {
      console.error('Failed to process staged articles:', error);
      toast({
        title: "Error processing staged articles",
        description: "An error occurred while processing the staged articles.",
        variant: "destructive",
      });
    },
  });
}; 