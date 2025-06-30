import { useQuery } from '@tanstack/react-query';

console.log('[HOOK] useCachedContent loaded');

export const useCachedContent = (articleId: string, cachedContentUrl?: string) => {
  return useQuery({
    queryKey: ['cached-content', articleId],
    queryFn: async () => {
      if (!cachedContentUrl) return null;
      
      try {
        const response = await fetch(cachedContentUrl);
        if (!response.ok) return null;
        
        const cachedData = await response.json();
        return cachedData;
      } catch (error) {
        console.error('Error fetching cached content:', error);
        return null;
      }
    },
    enabled: !!cachedContentUrl,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const usePreloadCachedContent = (articles: any[]) => {
  console.log('[HOOK] usePreloadCachedContent called, articles:', articles?.length);
  return useQuery({
    queryKey: ['preload-cached-content'],
    queryFn: async () => {
      // Only preload first 5 articles with cached content for faster initial load
      const preloadPromises = articles
        .filter(article => article.cached_content_url)
        .slice(0, 5) // Reduced from 10 to 5 for faster loading
        .map(async (article) => {
          try {
            const response = await fetch(article.cached_content_url);
            if (response.ok) {
              const data = await response.json();
              return { id: article.id, data };
            }
          } catch (error) {
            console.error('Error preloading article:', article.id, error);
          }
          return null;
        });

      const results = await Promise.all(preloadPromises);
      return results.filter(Boolean);
    },
    enabled: articles.length > 0,
    staleTime: 10 * 60 * 1000, // Reduced to 10 minutes for more frequent updates
  });
};
