import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from '@/types/news';

export const useNewsArticles = () => {
  return useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      console.log('Fetching news articles from database...');
      
      // Fetch articles from the last 30 days for better content variety
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .gte('published_at', thirtyDaysAgo.toISOString())
        .order('published_at', { ascending: false })
        .limit(200); // Increased limit for better variety
      
      if (error) {
        console.error('Error fetching news articles:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} articles in database`);
      
      // Transform database format to match NewsArticle type
      const articles = data.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description || '',
        source: article.source,
        publishedAt: article.published_at,
        category: article.category,
        url: article.url || undefined,
        image_url: article.image_url || undefined,
        cached_content_url: article.cached_content_url || undefined,
        cached_image_url: article.cached_image_url || undefined,
        cache_updated_at: article.cache_updated_at || undefined,
      })) as NewsArticle[];

      // Enhanced sorting: prioritize recent articles but mix in some variety
      const now = new Date();
      const sortedArticles = articles.sort((a, b) => {
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        
        // Calculate recency score (more recent = higher score)
        const recencyScoreA = Math.max(0, 1 - (now.getTime() - dateA.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const recencyScoreB = Math.max(0, 1 - (now.getTime() - dateB.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        // Add some randomness for variety while maintaining recency preference
        const randomFactorA = Math.random() * 0.3;
        const randomFactorB = Math.random() * 0.3;
        
        const finalScoreA = recencyScoreA + randomFactorA;
        const finalScoreB = recencyScoreB + randomFactorB;
        
        return finalScoreB - finalScoreA;
      });

      console.log('Articles processed for display:', sortedArticles.length);
      return sortedArticles;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useUserBookmarks = () => {
  return useQuery({
    queryKey: ['user-bookmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .order('bookmarked_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, isBookmarked, articleData }: { 
      articleId: string; 
      isBookmarked: boolean;
      articleData?: NewsArticle;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to bookmark articles');
      }

      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        if (!articleData) {
          throw new Error('Article data is required to create bookmark');
        }
        
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({ 
            article_id: articleId,
            user_id: user.id,
            title: articleData.title,
            description: articleData.description || '',
            source: articleData.source,
            url: articleData.url || null,
            category: articleData.category,
            published_at: articleData.publishedAt,
            image_url: articleData.image_url || null,
            cached_content_url: articleData.cached_content_url || null,
            cached_image_url: articleData.cached_image_url || null,
            cache_updated_at: articleData.cache_updated_at || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
    },
  });
};