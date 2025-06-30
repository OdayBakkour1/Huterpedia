import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsGrid } from "@/components/NewsGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { FeedPreferences } from "@/components/FeedPreferences";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionExpiredDialog } from "@/components/SubscriptionExpiredDialog";
import { WelcomeBackDialog } from "@/components/WelcomeBackDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNewsArticles } from "@/hooks/useNewsArticles";
import { usePreloadCachedContent } from "@/hooks/useCachedContent";
import { useFeedPreferences } from "@/hooks/useFeedPreferences";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useInView } from 'react-intersection-observer';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);
  const [usePersonalizedFeed, setUsePersonalizedFeed] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    data: newsPages,
    isLoading: newsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error: newsError,
  } = useNewsArticles();
  const { data: personalizedArticles, isLoading: personalizedLoading } = useFeedPreferences(usePersonalizedFeed);
  const { data: subscriptionStatus, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const { data: userRole } = useCurrentUserRole();
  
  // Preload cached content only after articles are loaded
  usePreloadCachedContent(newsPages?.pages ? newsPages.pages.flatMap(page => page.articles) : []);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Flatten paginated articles
  const paginatedArticles = newsPages?.pages
    ? newsPages.pages.flatMap(page => page.articles)
    : [];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    // Check subscription status and redirect if expired (skip for admins)
    if (!loading && !subscriptionLoading && user && subscriptionStatus?.isExpired && userRole !== 'admin') {
      navigate('/checkout');
    }
  }, [user, loading, subscriptionStatus, subscriptionLoading, navigate, userRole]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !usePersonalizedFeed) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, usePersonalizedFeed]);

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Use paginatedArticles for general feed, personalizedArticles for personalized feed
  const articles = usePersonalizedFeed ? (personalizedArticles || []) : paginatedArticles;
  const isLoading = usePersonalizedFeed ? personalizedLoading : newsLoading;

  // Filtered news for search and category
  const filteredNews = articles.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Count cached articles for performance info
  const cachedCount = filteredNews.filter(article => article.cached_content_url).length;

  // Preload cached content only after filtered articles are loaded
  usePreloadCachedContent(filteredNews);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header 
        usePersonalizedFeed={usePersonalizedFeed}
        setUsePersonalizedFeed={setUsePersonalizedFeed}
        showPreferences={showPreferences}
        setShowPreferences={setShowPreferences}
      />
      <SubscriptionBanner />
      <WelcomeBackDialog />
      <SubscriptionExpiredDialog />
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Cyber<span className="text-cyan-400">Security</span> News
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-4 sm:mb-6 px-2">
            Stay informed with the latest cybersecurity threats, vulnerabilities, and industry developments
          </p>

          {/* Feed Preferences Component */}
          {showPreferences && (
            <div className="mb-4 sm:mb-8">
              <FeedPreferences />
            </div>
          )}
          
          {articles.length > 0 && (
            <div className="flex justify-center flex-col items-center gap-2">
              <span className="text-slate-400 text-sm text-center px-2">
                {articles.length} articles available • {usePersonalizedFeed ? "Personalized feed" : "General feed"} • Updated automatically every 15 minutes
              </span>
            </div>
          )}
        </div>

        <div className="mb-4 sm:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <div className="w-full sm:flex-1 order-1 sm:order-2">
              <CategoryFilter 
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory} 
                articles={articles}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-700 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-slate-700 rounded w-1/4 mx-auto"></div>
            </div>
            <p className="text-xl text-slate-400 mt-4">Loading latest news articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 sm:p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">No Articles Available</h3>
              <p className="text-slate-400 text-sm sm:text-base">
                {usePersonalizedFeed 
                  ? "No articles match your current preferences. Try adjusting your feed settings or switch to the general feed."
                  : "News articles are automatically fetched every 15 minutes. Please check back shortly for the latest cybersecurity updates from the last 30 days."
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            <NewsGrid articles={filteredNews} />
            {!usePersonalizedFeed && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage ? (
                  <span className="text-slate-400">Loading more articles...</span>
                ) : hasNextPage ? (
                  <span className="text-slate-400">Scroll down to load more</span>
                ) : (
                  <span className="text-slate-500">You've reached the end.</span>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;