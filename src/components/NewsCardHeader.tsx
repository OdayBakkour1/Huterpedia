import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanHtmlContent } from "@/utils/textUtils";
import { formatDistanceToNow } from 'date-fns';

interface NewsCardHeaderProps {
  category: string;
  publishedAt: string;
  title: string;
  user: any;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  isBookmarkPending: boolean;
}

export const NewsCardHeader = ({ 
  category, 
  publishedAt, 
  title, 
  user, 
  isBookmarked, 
  onBookmarkToggle, 
  isBookmarkPending 
}: NewsCardHeaderProps) => {
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true })
        .replace('about ', '')
        .replace('less than a minute ago', 'just now')
        .replace(' minutes', ' min')
        .replace(' minute', ' min')
        .replace(' hours', ' hr')
        .replace(' hour', ' hr');
    } catch (error) {
      console.error("Invalid date:", dateString, error);
      return "a while ago";
    }
  };

  const getSeverityColor = (category: string) => {
    const colors = {
      'Threats': 'bg-red-500',
      'Vulnerabilities': 'bg-orange-500',
      'Breaches': 'bg-purple-500',
      'Tools': 'bg-cyan-500',
      'Updates': 'bg-green-500',
      'Threat Actors Landscape': 'bg-yellow-500',
    };
    return colors[category as keyof typeof colors] || 'bg-slate-500';
  };

  // Clean the title to remove any HTML content
  const cleanTitle = cleanHtmlContent(title);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={cn("w-3 h-3 rounded-full flex-shrink-0", getSeverityColor(category))} />
        <Badge variant="outline" className="text-xs bg-slate-700/50 text-cyan-400 border-slate-600">
          {category}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-slate-900/80 hover:bg-slate-900 border border-slate-600"
            onClick={onBookmarkToggle}
            disabled={isBookmarkPending}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-3 w-3 text-cyan-400" />
            ) : (
              <Bookmark className="h-3 w-3 text-slate-300" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
