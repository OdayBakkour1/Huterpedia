
import { useAuth } from '@/contexts/AuthContext';
import { useAICredits } from '@/hooks/useAICredits';
import { AlertTriangle } from 'lucide-react';

export const AIUsageIndicator = () => {
  const { user } = useAuth();
  const { data: aiCredits, isLoading } = useAICredits(user?.id || '');

  if (isLoading || !aiCredits) {
    return (
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-slate-400">
        <div className="h-3 w-3 animate-pulse bg-slate-600 rounded"></div>
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  const isLimitReached = aiCredits.remainingCredits === 0;

  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 ${isLimitReached ? 'text-red-400' : 'text-cyan-400'}`}>
      {isLimitReached && <AlertTriangle className="h-3 w-3" />}
      <span className="text-xs font-medium">
        AI Summaries
      </span>
      <span className={`text-xs font-mono ${isLimitReached ? 'text-red-400' : 'text-cyan-400'}`}>
        {aiCredits.remainingCredits} of {aiCredits.maxCredits}
      </span>
      <div className={`h-1.5 w-10 sm:w-12 rounded-full ${isLimitReached ? 'bg-red-900' : 'bg-slate-700'}`}>
        <div 
          className={`h-full rounded-full transition-all ${isLimitReached ? 'bg-red-500' : 'bg-cyan-500'}`}
          style={{ width: `${Math.min(100, (aiCredits.currentUsage / aiCredits.maxCredits) * 100)}%` }}
        />
      </div>
    </div>
  );
};
