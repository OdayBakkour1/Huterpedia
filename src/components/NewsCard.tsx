import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NewsArticle } from "@/types/news";
import { useToggleBookmark, useUserBookmarks } from "@/hooks/useNewsArticles";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAIUsage } from "@/hooks/useAIUsage";
import { useQueryClient } from "@tanstack/react-query";
import { useCachedContent } from "@/hooks/useCachedContent";
import { NewsCardHeader } from "./NewsCardHeader";
import { NewsCardContent } from "./NewsCardContent";
import { NewsCardActions } from "./NewsCardActions";
import { NewsCardDialog } from "./NewsCardDialog";
import { AISummaryDialog } from "./AISummaryDialog";
import { cleanArticleData } from "@/utils/textUtils";

interface NewsCardProps {
  article: NewsArticle & {
    cached_content_url?: string;
    cached_image_url?: string;
    cache_updated_at?: string;
  };
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: bookmarks } = useUserBookmarks();
  const { data: aiUsage } = useAIUsage();
  const { data: cachedContent } = useCachedContent(article.id, article.cached_content_url);
  const toggleBookmark = useToggleBookmark();
  const queryClient = useQueryClient();
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  // Use cached content if available, otherwise fall back to original data
  const effectiveArticle = cachedContent ? {
    ...article,
    title: cachedContent.title || article.title,
    description: cachedContent.description || article.description,
  } : article;

  const cleanedArticle = cleanArticleData(effectiveArticle);

  const isBookmarked = bookmarks?.some(bookmark => bookmark.article_id === article.id);

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark articles",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleBookmark.mutateAsync({
        articleId: article.id,
        isBookmarked: !!isBookmarked,
        articleData: cleanedArticle,
      });
      
      toast({
        title: isBookmarked ? "Bookmark Removed" : "Article Bookmarked",
        description: isBookmarked 
          ? "Article removed from your bookmarks" 
          : "Article saved to your bookmarks",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  const handleAiSummarize = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI summarization",
        variant: "destructive",
      });
      return;
    }

    if (aiUsage && aiUsage.remaining <= 0) {
      toast({
        title: "Monthly Limit Reached",
        description: "You've used all 15 AI summaries this month. Limit resets next month.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
      return;
    }

    setIsAiSummarizing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('summarize-article', {
        body: {
          title: cleanedArticle.title,
          description: cleanedArticle.description,
          url: article.url
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        if (data.error === 'Monthly limit reached') {
          toast({
            title: "Monthly Limit Reached",
            description: data.message || "You've reached your monthly limit of AI summaries.",
            variant: "destructive",
          });
          queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
          return;
        }
        throw new Error(data.details || data.error);
      }

      if (data?.summary) {
        setAiSummary(data.summary);
        setShowSummaryDialog(true);
        queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
      } else {
        throw new Error("No summary received");
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiSummarizing(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 bg-slate-800/50 border-slate-700 hover:border-slate-600 backdrop-blur-sm h-full flex flex-col group">
        <CardHeader className="pb-3 flex-shrink-0">
          <NewsCardHeader
            category={cleanedArticle.category}
            publishedAt={cleanedArticle.publishedAt}
            title={cleanedArticle.title}
            user={user}
            isBookmarked={!!isBookmarked}
            onBookmarkToggle={handleBookmarkToggle}
            isBookmarkPending={toggleBookmark.isPending}
          />
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <NewsCardContent
            description={cleanedArticle.description}
            title={cleanedArticle.title}
            source={cleanedArticle.source}
            publishedAt={cleanedArticle.publishedAt}
            user={user}
            aiUsage={aiUsage}
            isCached={!!cachedContent}
          />

          <div className="mt-auto pt-4">
            <NewsCardActions
              user={user}
              aiUsage={aiUsage}
              isAiSummarizing={isAiSummarizing}
              onAiSummarize={handleAiSummarize}
              articleUrl={article.url}
            >
              <NewsCardDialog
                article={cleanedArticle}
                user={user}
                aiUsage={aiUsage}
                isAiSummarizing={isAiSummarizing}
                onAiSummarize={handleAiSummarize}
              />
            </NewsCardActions>
          </div>
        </CardContent>
      </Card>

      <AISummaryDialog
        open={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        summary={aiSummary}
        article={cleanedArticle}
      />
    </>
  );
};
