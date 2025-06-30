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
  console.log('[COMP] NewsCardHeader render', { category, publishedAt, title, user, isBookmarked, isBookmarkPending });

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

  // Format the published date
  let formattedDate = 'Unknown date';
  if (publishedAt) {
    const date = new Date(publishedAt);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Badge className={getSeverityColor(category)}>{category}</Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-2"
        onClick={onBookmarkToggle}
        disabled={isBookmarkPending}
        aria-label={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
      >
        {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-cyan-400" /> : <Bookmark className="w-5 h-5 text-slate-400" />}
      </Button>
    </div>
  );
};
