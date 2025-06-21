import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { NewsArticle } from "@/types/news";
import { useIsMobile } from "@/hooks/use-mobile";

interface AISummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string | null;
  article: NewsArticle;
}

export const AISummaryDialog = ({ open, onOpenChange, summary, article }: AISummaryDialogProps) => {
  const isMobile = useIsMobile();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          isMobile
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm rounded-lg max-h-[80vh] overflow-y-auto z-[9999] bg-slate-900 border-slate-700"
            : "max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto"
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" />
            AI Summary
          </DialogTitle>
          <DialogDescription>
            This is an AI-generated summary of the article below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-slate-300 leading-relaxed">{summary}</p>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <h4 className="font-medium text-white mb-2">{article.title}</h4>
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
              <span>{article.source}</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <p className="text-sm text-slate-400">{article.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
