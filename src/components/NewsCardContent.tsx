import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NewsCardContentProps {
  description: string;
  title: string;
  source: string;
  publishedAt: string;
  user?: any;
  aiUsage?: any;
  isCached?: boolean;
}

export const NewsCardContent = ({
  description,
  title,
  source,
  publishedAt,
  isCached
}: NewsCardContentProps) => {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-cyan-300">
          {source}
        </Badge>
        <span className="text-xs text-slate-400">{new Date(publishedAt).toLocaleString()}</span>
        {isCached && (
          <span className="ml-2 text-xs text-cyan-400">Cached</span>
        )}
      </div>
      <p className="text-slate-300 text-sm line-clamp-4 min-h-[3.5rem]">{description}</p>
    </div>
  );
};
