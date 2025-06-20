import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUserBookmarks } from '@/hooks/useNewsArticles';
import { NewsGrid } from '@/components/NewsGrid';

const Bookmarks = () => {
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Your Bookmarks</h1>
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
