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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Your Bookmarks</h1>
      {bookmarks && bookmarks.length > 0 ? (
        <NewsGrid articles={bookmarks.map(b => b.article)} />
      ) : (
        <div className="text-slate-400 text-center">You have no bookmarked articles yet.</div>
      )}
    </div>
  );
};

export default Bookmarks;
