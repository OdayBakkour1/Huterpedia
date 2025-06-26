import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsArticle } from "@/types/news";
import { cleanHtmlContent, isValidDescription } from "@/utils/textUtils";

interface NewsCardDialogProps {
  article: NewsArticle;
  user: any;
  aiUsage: any;
  isAiSummarizing: boolean;
  onAiSummarize: () => void;
}

export const NewsCardDialog = ({ 
  article, 
  user, 
  aiUsage, 
  isAiSummarizing, 
  onAiSummarize 
}: NewsCardDialogProps) => {
  const getTopicTags = () => {
    const tags = [];
    const textToCheck = `${article.title} ${article.description}`.toLowerCase();
    
    // Security threats
    if (textToCheck.includes('ransomware')) tags.push('ransomware');
    if (textToCheck.includes('malware') || textToCheck.includes('trojan') || textToCheck.includes('virus')) tags.push('malware');
    if (textToCheck.includes('phishing') || textToCheck.includes('spoofing')) tags.push('phishing');
    if (textToCheck.includes('ddos') || textToCheck.includes('denial of service')) tags.push('DDoS');
    if (textToCheck.includes('botnet') || textToCheck.includes('zombie')) tags.push('botnet');
    
    // Vulnerabilities
    if (textToCheck.includes('zero-day') || textToCheck.includes('0-day')) tags.push('zero-day');
    if (textToCheck.includes('exploit') || textToCheck.includes('rce') || textToCheck.includes('remote code execution')) tags.push('exploit');
    if (textToCheck.includes('sql injection') || textToCheck.includes('xss') || textToCheck.includes('cross-site')) tags.push('web-vuln');
    if (textToCheck.includes('buffer overflow') || textToCheck.includes('memory corruption')) tags.push('memory-vuln');
    
    // Data breaches and incidents
    if (textToCheck.includes('breach') || textToCheck.includes('data leak') || textToCheck.includes('exposed')) tags.push('data-breach');
    if (textToCheck.includes('hack') || textToCheck.includes('compromise') || textToCheck.includes('infiltrat')) tags.push('hack');
    if (textToCheck.includes('stolen') || textToCheck.includes('theft') || textToCheck.includes('exfiltrat')) tags.push('data-theft');
    
    // Technologies and tools
    if (textToCheck.includes('ai') || textToCheck.includes('artificial intelligence') || textToCheck.includes('machine learning')) tags.push('AI');
    if (textToCheck.includes('vpn') || textToCheck.includes('virtual private network')) tags.push('VPN');
    if (textToCheck.includes('cloud') || textToCheck.includes('aws') || textToCheck.includes('azure') || textToCheck.includes('gcp')) tags.push('cloud');
    if (textToCheck.includes('kubernetes') || textToCheck.includes('docker') || textToCheck.includes('container')) tags.push('containers');
    if (textToCheck.includes('blockchain') || textToCheck.includes('cryptocurrency') || textToCheck.includes('bitcoin')) tags.push('crypto');
    
    // Industries
    if (textToCheck.includes('healthcare') || textToCheck.includes('hospital') || textToCheck.includes('medical')) tags.push('healthcare');
    if (textToCheck.includes('financial') || textToCheck.includes('bank') || textToCheck.includes('fintech')) tags.push('finance');
    if (textToCheck.includes('government') || textToCheck.includes('military') || textToCheck.includes('defense')) tags.push('government');
    if (textToCheck.includes('education') || textToCheck.includes('university') || textToCheck.includes('school')) tags.push('education');
    
    // Security measures
    if (textToCheck.includes('encryption') || textToCheck.includes('crypto') || textToCheck.includes('cipher')) tags.push('encryption');
    if (textToCheck.includes('firewall') || textToCheck.includes('network security')) tags.push('network-sec');
    if (textToCheck.includes('authentication') || textToCheck.includes('2fa') || textToCheck.includes('mfa')) tags.push('auth');
    if (textToCheck.includes('patch') || textToCheck.includes('update') || textToCheck.includes('fix')) tags.push('patch');
    
    // APT and threat actors
    if (textToCheck.includes('apt') || textToCheck.includes('advanced persistent') || textToCheck.includes('nation-state')) tags.push('APT');
    if (textToCheck.includes('lazarus') || textToCheck.includes('fancy bear') || textToCheck.includes('cozy bear') || textToCheck.includes('threat actor')) tags.push('threat-actor');
    
    // Remove duplicates and limit to 4 tags
    return [...new Set(tags)].slice(0, 4);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlaceholderImage = () => {
    const placeholders = {
      'Threats': 'photo-1518770660439-4636190af475',
      'Vulnerabilities': 'photo-1461749280684-dccba630e2f6',
      'Breaches': 'photo-1486312338219-ce68d2c6f44d',
      'Tools': 'photo-1488590528505-98d2b5aba04b',
      'Updates': 'photo-1649972904349-6e44c42644a7',
      'Threat Actors Landscape': 'photo-1518770660439-4636190af475',
    };
    
    const imageId = placeholders[article.category as keyof typeof placeholders] || placeholders.Updates;
    return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=400&h=200&q=80`;
  };

  const imageUrl = !article.image_url ? getPlaceholderImage() : article.image_url;

  // Clean the title and description
  const cleanTitle = cleanHtmlContent(article.title) || 'Untitled Article';
  const cleanDescription = cleanHtmlContent(article.description);
  const hasValidDescription = isValidDescription(article.description);
  const topicTags = getTopicTags();

  // Format the published date
  let formattedDate = 'Unknown date';
  if (article.publishedAt) {
    const date = new Date(article.publishedAt);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
      <DialogHeader>
        <DialogTitle className="text-xl text-white">{cleanTitle}</DialogTitle>
        <DialogDescription>
          Detailed information about the selected news article, including source, date, tags, and description.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {article.image_url && (
          <img
            src={imageUrl}
            alt={cleanTitle}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{article.source}</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {topicTags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-cyan-300">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="prose max-w-none">
          <p className="text-base leading-relaxed text-slate-300">
            {hasValidDescription ? cleanDescription : `No detailed description available for this ${article.source} article. Click "View Original" to read the full content.`}
          </p>
        </div>
        <div className="flex gap-2 pt-4">
          {article.url && (
            <Button variant="outline" asChild className="bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Original
              </a>
            </Button>
          )}
          <Button 
            variant="outline" 
            className={cn(
              "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30",
              (!user || (aiUsage && aiUsage.remaining <= 0)) && "opacity-50 cursor-not-allowed"
            )}
            onClick={onAiSummarize}
            disabled={isAiSummarizing || !user || (aiUsage && aiUsage.remaining <= 0)}
          >
            {isAiSummarizing ? (
              <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Summarize {aiUsage && `(${aiUsage.remaining}/15)`}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
