import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserBookmarks } from '@/hooks/useNewsArticles';
import { NewsGrid } from '@/components/NewsGrid';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

const Bookmarks = () => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [usePersonalizedFeed, setUsePersonalizedFeed] = useState(false);
  const { user, loading } = useAuth();
  const { data: bookmarks, isLoading } = useUserBookmarks();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || isLoading) {
    return <div className="text-center text-white py-12">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Normalize bookmark data for NewsGrid
  const validArticles = (bookmarks || []).filter(Boolean).map(b => ({
    ...b,
    publishedAt: b.published_at || b.publishedAt || '',
    image_url: b.image_url || '',
    // add other fallbacks as needed
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header 
        usePersonalizedFeed={usePersonalizedFeed}
        setUsePersonalizedFeed={setUsePersonalizedFeed}
        showPreferences={showPreferences}
        setShowPreferences={setShowPreferences}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Your Bookmarks</h1>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700">
            Back to Dashboard
          </Button>
        </div>
        {validArticles.length > 0 ? (
          <NewsGrid articles={validArticles} />
        ) : (
          <div className="text-slate-400 text-center">You have no bookmarked articles yet.</div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
