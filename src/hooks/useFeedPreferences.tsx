import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NewsArticle } from "@/types/news";

export interface FeedPreferences {
  id?: string;
  user_id: string;
  preferred_sources: string[];
  preferred_categories: string[];
  preferred_tags: string[];
  date_range_days: number;
  max_articles: number;
  sort_preference: 'newest' | 'oldest' | 'relevance';
}

export const useFeedPreferences = (enabled: boolean = false) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['feedPreferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_feed_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

  const { data: personalizedArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ['personalizedFeed', user?.id],
    queryFn: async (): Promise<NewsArticle[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_personalized_feed', {
        _user_id: user.id
      });

      if (error) throw error;
      
      // Transform the data to match NewsArticle interface
      return (data || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        description: article.description,
        source: article.source,
        url: article.url,
        category: article.category,
        publishedAt: article.published_at,
        imageUrl: article.image_url,
        cached_content_url: article.cached_content_url,
        cached_image_url: article.cached_image_url,
        cache_updated_at: article.cache_updated_at,
      }));
    },
    enabled: enabled && !!user,
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<FeedPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_feed_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPreferences', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['personalizedFeed', user?.id] });
    },
  });

  return {
    data: personalizedArticles,
    isLoading: articlesLoading,
    preferences,
    preferencesLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  };
};
