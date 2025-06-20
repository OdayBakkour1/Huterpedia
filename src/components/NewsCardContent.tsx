import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, LoaderCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface NewsCardActionsProps {
  user: any;
  aiUsage: any;
  isAiSummarizing: boolean;
  onAiSummarize: () => void;
  articleUrl?: string;
  children: React.ReactNode; // For the dialog content
}

export const NewsCardActions = ({ 
  user, 
  aiUsage, 
  isAiSummarizing, 
  onAiSummarize,
  articleUrl,
  children 
}: NewsCardActionsProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleAiClick = () => {
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
      return;
    }

    onAiSummarize();
  };

  return (
    <div className="flex gap-2">
      {articleUrl ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white touch-target"
          asChild
        >
          <a href={articleUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            {isMobile ? "Read" : "Read Full Article"}
          </a>
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white touch-target">
              {isMobile ? "Read" : "Read Full Article"}
            </Button>
          </DialogTrigger>
          {children}
        </Dialog>
      )}

      <Button 
        variant="outline" 
        size={isMobile ? "default" : "sm"}
        className={cn(
          "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30 touch-target focus-mobile",
          isMobile ? "min-w-[48px] px-3" : "min-w-[40px]"
        )}
        onClick={handleAiClick}
        disabled={isAiSummarizing}
        title={!user ? "Sign in to use AI summarization" : (aiUsage && aiUsage.remaining <= 0) ? "Monthly limit reached" : `${aiUsage?.remaining || 0} summaries remaining`}
      >
        {isAiSummarizing ? (
          <LoaderCircle className={cn("animate-spin", isMobile ? "w-5 h-5" : "w-4 h-4")} />
        ) : (
          <Sparkles className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
        )}
        {isMobile && (
          <span className="ml-1 text-xs">AI</span>
        )}
      </Button>
    </div>
  );
};

export { NewsCardActions as NewsCardContent };
