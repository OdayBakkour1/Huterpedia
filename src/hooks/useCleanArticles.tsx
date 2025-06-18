
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanHtmlContent, isValidDescription } from '@/utils/textUtils';

export const useCleanArticles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Starting article cleanup process...');
      
      // Get all articles that might need cleaning
      const { data: articles, error: fetchError } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching articles:', fetchError);
        throw fetchError;
      }

      let cleanedCount = 0;
      let generatedDescriptions = 0;

      for (const article of articles || []) {
        let needsUpdate = false;
        const updates: any = {};

        // Clean title if it has HTML
        const cleanedTitle = cleanHtmlContent(article.title);
        if (cleanedTitle !== article.title && cleanedTitle.length > 0) {
          updates.title = cleanedTitle;
          needsUpdate = true;
        }

        // Clean description if it has HTML or generate if missing/invalid
        const cleanedDescription = cleanHtmlContent(article.description || '');
        const hasValidDescription = isValidDescription(article.description);

        if (!hasValidDescription) {
          // Generate AI description
          try {
            const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-description', {
              body: {
                title: cleanedTitle || article.title,
                url: article.url,
                source: article.source
              }
            });

            if (!aiError && aiData?.description) {
              updates.description = aiData.description;
              generatedDescriptions++;
              needsUpdate = true;
            } else {
              // Fallback description
              updates.description = `This cybersecurity article from ${article.source} discusses important security developments. Click to read the full article for detailed information.`;
              needsUpdate = true;
            }
          } catch (error) {
            console.error('Error generating AI description for article:', article.id, error);
            // Fallback description
            updates.description = `This cybersecurity article from ${article.source} discusses important security developments. Click to read the full article for detailed information.`;
            needsUpdate = true;
          }
        } else if (cleanedDescription !== article.description) {
          updates.description = cleanedDescription;
          needsUpdate = true;
        }

        // Update article if needed
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('news_articles')
            .update(updates)
            .eq('id', article.id);

          if (updateError) {
            console.error('Error updating article:', article.id, updateError);
          } else {
            cleanedCount++;
            console.log(`Updated article: ${updates.title || article.title}`);
          }
        }
      }

      return {
        totalArticles: articles?.length || 0,
        cleanedCount,
        generatedDescriptions
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast({
        title: "Articles cleaned successfully",
        description: `Cleaned ${data.cleanedCount} articles and generated ${data.generatedDescriptions} AI descriptions out of ${data.totalArticles} total articles.`,
      });
    },
    onError: (error) => {
      console.error('Failed to clean articles:', error);
      toast({
        title: "Error cleaning articles",
        description: "Failed to clean article content",
        variant: "destructive",
      });
    },
  });
};
