import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from '@/types/news';
import { useState, useCallback } from 'react';
import React from 'react';

const SUPABASE_FUNCTIONS_URL = 'https://gzpayeckolpfflgvkqvh.functions.supabase.co';

export const useNewsArticles = () => {
  return useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      // Call the secure read-only fetch-news-readonly Edge Function
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/fetch-news-readonly`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch news articles');
      const data = await response.json();
      // Map published_at to publishedAt for frontend compatibility
      return (data.articles as any[]).map(article => ({
        ...article,
        publishedAt: article.published_at || article.publishedAt,
      })) as NewsArticle[];
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
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

export const usePaginatedNewsArticles = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ showMeta: boolean; totalCount?: number; categories?: string[]; categoryCounts?: Record<string, number> }>({ showMeta: false });

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/fetch-news-readonly`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch news articles');
      const data = await response.json();
      const newArticles = (data.articles as any[]).map(article => ({
        ...article,
        publishedAt: article.published_at || article.publishedAt,
      })) as NewsArticle[];
      setArticles(newArticles);
      setMeta({
        showMeta: !!data.showMeta,
        totalCount: data.totalCount,
        categories: data.categories,
        categoryCounts: data.categoryCounts,
      });
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    setArticles([]);
    setMeta({ showMeta: false });
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { articles, isLoading, error, meta };
};