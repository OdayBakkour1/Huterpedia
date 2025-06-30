import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from '@/types/news';
import { useAuth } from '@/contexts/AuthContext';

const SUPABASE_FUNCTIONS_URL = 'https://gzpayeckolpfflgvkqvh.functions.supabase.co';

console.log('[HOOK] useNewsArticles loaded');

export const useNewsArticles = (page: number) => {
  console.log('[HOOK] useNewsArticles called, page:', page);
  const { session, loading } = useAuth();

  return useQuery<{ articles: NewsArticle[]; totalCount: number }, Error>({
    queryKey: ['news-articles', page, !!session],
    queryFn: async () => {
      if (loading) return { articles: [], totalCount: 0 };
      const token = session?.access_token;
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/fetch-news-readonly?page=${page}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch news articles');
      const data = await response.json();
      return {
        articles: (data.articles as any[]).map(article => ({
          ...article,
          publishedAt: article.published_at || article.publishedAt,
        })) as NewsArticle[],
        totalCount: data.totalCount,
      };
    },
    enabled: !loading,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUserBookmarks = () => {
  return useQuery({
    queryKey: ['user-bookmarks'],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/fetch-bookmarks`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      const data = await response.json();
      return data.bookmarks;
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
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('User must be authenticated to bookmark articles');
      if (isBookmarked) {
        // Remove bookmark via Edge Function
        const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/remove-bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId }),
        });
        if (!response.ok) throw new Error('Failed to remove bookmark');
      } else {
        if (!articleData) throw new Error('Article data is required to create bookmark');
        // Add bookmark via Edge Function
        const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/add-bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ article: articleData }),
        });
        if (!response.ok) throw new Error('Failed to add bookmark');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
    },
  });
};