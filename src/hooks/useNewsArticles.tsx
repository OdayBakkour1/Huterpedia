import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from '@/types/news';

export const useNewsArticles = () => {
  return useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      console.log('Fetching news articles from database...');
      
      // Calculate date for 15 days ago
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .gte('published_at', fifteenDaysAgo.toISOString()) // Only articles from last 15 days
        .order('published_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching news articles:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} articles in database (last 15 days)`);
      
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

      // Sort articles to prioritize those with cached content
      const cachedArticles = articles.filter(article => article.cached_content_url);
      const nonCachedArticles = articles.filter(article => !article.cached_content_url);

      // Sort both lists by date to ensure newest appear first within their groups
      const sortedCachedArticles = cachedArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      const sortedNonCachedArticles = nonCachedArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      // Combine arrays, showing cached articles first
      const finalArticles = [
        ...sortedCachedArticles,
        ...sortedNonCachedArticles
      ];

      console.log('Articles processed for display:', finalArticles.length);
      console.log('Cached articles:', cachedArticles.length);
      return finalArticles;
    },
    staleTime: 2 * 60 * 1000, // Increased to 2 minutes to reduce refetching
    refetchInterval: 5 * 60 * 1000, // Increased to 5 minutes to reduce background requests
    refetchOnWindowFocus: false, // Disable to prevent unnecessary refetches
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
