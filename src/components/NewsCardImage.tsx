
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsCardImageProps {
  imageUrl?: string;
  title: string;
  category: string;
  user: any;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  isBookmarkPending: boolean;
}

export const NewsCardImage = ({ 
  imageUrl, 
  title, 
  category, 
  user, 
  isBookmarked, 
  onBookmarkToggle, 
  isBookmarkPending 
}: NewsCardImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getPlaceholderImage = () => {
    const placeholders = {
      'Threats': 'photo-1518770660439-4636190af475',
      'Vulnerabilities': 'photo-1461749280684-dccba630e2f6',
      'Breaches': 'photo-1486312338219-ce68d2c6f44d',
      'Tools': 'photo-1488590528505-98d2b5aba04b',
      'Updates': 'photo-1649972904349-6e44c42644a7',
    };
    
    const imageId = placeholders[category as keyof typeof placeholders] || placeholders.Updates;
    return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=400&h=200&q=80`;
  };

  const getSeverityColor = (category: string) => {
    const colors = {
      'Threats': 'bg-red-500',
      'Vulnerabilities': 'bg-orange-500',
      'Breaches': 'bg-purple-500',
      'Tools': 'bg-cyan-500',
      'Updates': 'bg-green-500',
    };
    return colors[category as keyof typeof colors] || 'bg-slate-500';
  };

  const finalImageUrl = imageError || !imageUrl 
    ? getPlaceholderImage()
    : imageUrl;

  return (
    <div className="relative h-48 overflow-hidden">
      {imageLoading && !imageError && (
        <div className="h-full bg-slate-700 animate-pulse flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      )}
      <img
        src={finalImageUrl}
        alt={title}
        className={`w-full h-full object-cover ${imageLoading && !imageError ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      
      {/* Severity Indicator */}
      <div className="absolute top-2 left-2">
        <div className={cn("w-3 h-3 rounded-full", getSeverityColor(category))} />
      </div>

      {/* Bookmark Button */}
      {user && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-slate-900/80 hover:bg-slate-900 border border-slate-600"
            onClick={onBookmarkToggle}
            disabled={isBookmarkPending}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-cyan-400" />
            ) : (
              <Bookmark className="h-4 w-4 text-slate-300" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
