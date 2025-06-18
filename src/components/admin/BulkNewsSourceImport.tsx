
import { useState } from 'react';
import { useAddNewsSource } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsSourceData {
  name: string;
  url: string;
  type: string;
  category: string;
}

export const BulkNewsSourceImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  });
  const addSourceMutation = useAddNewsSource();
  const { toast } = useToast();

  // Predefined cybersecurity news sources
  const predefinedSources: NewsSourceData[] = [
    { name: "404 Media", url: "https://www.404media.co/rss", type: "rss", category: "Threats" },
    { name: "AboutDFIR – The Definitive Compendium Project", url: "https://aboutdfir.com/feed", type: "rss", category: "Analysis" },
    { name: "A Few Thoughts on Cryptographic Engineering", url: "https://blog.cryptographyengineering.com/feed", type: "rss", category: "Analysis" },
    { name: "Akamai Blog", url: "http://feeds.feedburner.com/akamai/blog", type: "rss", category: "Updates" },
    { name: "All CISA Advisories", url: "https://www.cisa.gov/cybersecurity-advisories/all.xml", type: "rss", category: "Vulnerabilities" },
    { name: "Almost Secure", url: "https://palant.info/rss.xml", type: "rss", category: "Analysis" },
    { name: "Anomali Blog", url: "https://www.anomali.com/site/blog-rss", type: "rss", category: "Threats" },
    { name: "API Security News", url: "https://apisecurity.io/feed/index.xml", type: "rss", category: "Vulnerabilities" },
    { name: "Application and Cybersecurity Blog", url: "https://blog.securityinnovation.com/rss.xml", type: "rss", category: "Analysis" },
    { name: "ASEC BLOG", url: "https://asec.ahnlab.com/en/feed/", type: "rss", category: "Threats" },
    { name: "Australian Information Security Awareness and Advisory", url: "https://kirbyidau.com/feed/", type: "rss", category: "Updates" },
    { name: "Avast Threat Labs", url: "https://decoded.avast.io/feed/", type: "rss", category: "Threats" },
    { name: "AWS Security Blog", url: "https://aws.amazon.com/blogs/security/feed/", type: "rss", category: "Updates" },
    { name: "BankInfoSecurity.com", url: "https://www.bankinfosecurity.com/rss-feeds", type: "rss", category: "Breaches" },
    { name: "Biometric Update", url: "http://feeds.feedburner.com/biometricupdate", type: "rss", category: "Updates" },
    { name: "bishopfox.com", url: "https://bishopfox.com/feeds/blog.rss", type: "rss", category: "Analysis" },
    { name: "BitSight Security Ratings Blog", url: "https://www.bitsight.com/blog/rss.xml", type: "rss", category: "Analysis" },
    { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", type: "rss", category: "Threats" },
    { name: "Blockchain Threat Intelligence", url: "https://newsletter.blockthreat.io/feed", type: "rss", category: "Threats" },
    { name: "Imperva Cybersecurity Blog", url: "https://www.imperva.com/blog/feed/", type: "rss", category: "Analysis" },
    { name: "Praetorian Blog", url: "https://www.praetorian.com/blog/feed/", type: "rss", category: "Analysis" },
    { name: "Sam Curry", url: "https://samcurry.net/feed.rss", type: "rss", category: "Analysis" },
    { name: "Offensive Security Blog", url: "https://www.offensive-security.com/blog/feed", type: "rss", category: "Analysis" },
    { name: "ZeroFox Blog", url: "https://www.zerofox.com/blog/feed", type: "rss", category: "Threats" },
    { name: "Bloomberg Technology", url: "https://feeds.bloomberg.com/technology/news.rss", type: "rss", category: "Updates" },
    { name: "C4ISRNet", url: "https://www.c4isrnet.com/arc/outboundfeeds/rss/category/cyber/?outputType=xml", type: "rss", category: "Updates" },
    { name: "Center for Internet Security", url: "https://www.cisecurity.org/feed/advisories", type: "rss", category: "Vulnerabilities" },
    { name: "Cert.be advisories", url: "https://cert.be/en/rss", type: "rss", category: "Vulnerabilities" },
    { name: "CERT Recently Published Vulnerability Notes", url: "https://www.kb.cert.org/vulfeed/", type: "rss", category: "Vulnerabilities" },
    { name: "Chainalysis", url: "https://blog.chainalysis.com/feed/", type: "rss", category: "Analysis" },
    { name: "Check Point Research", url: "https://research.checkpoint.com/feed", type: "rss", category: "Threats" },
    { name: "Criminal IP Blog", url: "https://blog.criminalip.io/feed/", type: "rss", category: "Threats" },
    { name: "CISA Blog", url: "https://www.cisa.gov/cisa/blog.xml", type: "rss", category: "Updates" },
    { name: "CISA News", url: "https://www.cisa.gov/news.xml", type: "rss", category: "Updates" },
    { name: "Cisco Talos Intelligence Group", url: "https://feeds.feedburner.com/feedburner/Talos", type: "rss", category: "Threats" },
    { name: "ClamAV blog", url: "https://feeds.feedburner.com/Clamav", type: "rss", category: "Updates" },
    { name: "Cloud7 News", url: "https://cloud7.news/feed/gn", type: "rss", category: "Updates" },
    { name: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/blog/feed/", type: "rss", category: "Analysis" },
    { name: "Cofense", url: "https://cofense.com/feed/", type: "rss", category: "Threats" },
    { name: "Compass Security Blog", url: "https://blog.compass-security.com/feed/", type: "rss", category: "Analysis" },
    { name: "CSO Online", url: "https://www.csoonline.com/feed/", type: "rss", category: "Analysis" },
    { name: "CVE THREATINT", url: "https://cve.threatint.com/rss/new", type: "rss", category: "Vulnerabilities" },
    { name: "Cybercrime Magazine", url: "https://cybersecurityventures.com/feed/", type: "rss", category: "Breaches" },
    { name: "Cyber Defence News", url: "https://bluepurple.substack.com/feed", type: "rss", category: "Analysis" },
    { name: "Cyber Defense Magazine", url: "https://www.cyberdefensemagazine.com/feed/", type: "rss", category: "Analysis" },
    { name: "Cyber Exposure Alerts", url: "https://www.tenable.com/blog/cyber-exposure-alerts/feed", type: "rss", category: "Vulnerabilities" },
    { name: "CyberScoop", url: "https://www.cyberscoop.com/feed", type: "rss", category: "Updates" },
    { name: "CrowdStrike Blog", url: "https://www.crowdstrike.com/blog/feed", type: "rss", category: "Threats" },
    { name: "Cybersecurity Dive", url: "https://www.cybersecuritydive.com/feeds/news/", type: "rss", category: "Updates" },
    { name: "Cybersecurity News", url: "https://cybersecuritynews.com/feed/", type: "rss", category: "Threats" },
    { name: "Dark Reading", url: "https://www.darkreading.com/rss_simple.asp", type: "rss", category: "Threats" },
    { name: "DataBreachToday", url: "https://www.databreachtoday.co.uk/rss-feeds", type: "rss", category: "Breaches" },
    { name: "Datadog Security Labs", url: "https://securitylabs.datadoghq.com/rss/feed.xml", type: "rss", category: "Analysis" },
    { name: "Deep Instinct Blog", url: "https://www.deepinstinct.com/blog/feed", type: "rss", category: "Threats" },
    { name: "EFF Deeplinks", url: "https://www.eff.org/rss/updates.xml", type: "rss", category: "Updates" },
    { name: "Elastic Blog", url: "https://www.elastic.co/blog/feed", type: "rss", category: "Updates" },
    { name: "Exploit-DB", url: "https://www.exploit-db.com/rss.xml", type: "rss", category: "Vulnerabilities" },
    { name: "F5 Labs", url: "https://www.f5.com/labs/rss-feeds/all.xml", type: "rss", category: "Analysis" },
    { name: "Forbes Cybersecurity", url: "https://www.forbes.com/cybersecurity/feed/", type: "rss", category: "Updates" },
    { name: "GBHackers On Security", url: "http://feeds.feedburner.com/gbhackers", type: "rss", category: "Threats" },
    { name: "Google Online Security Blog", url: "https://googleonlinesecurity.blogspot.com/atom.xml", type: "rss", category: "Updates" },
    { name: "Graham Cluley", url: "https://www.grahamcluley.com/feed/", type: "rss", category: "Analysis" },
    { name: "Hackaday", url: "https://hackaday.com/feed/", type: "rss", category: "Analysis" },
    { name: "HackerOne Blog", url: "https://www.hackerone.com/blog.rss", type: "rss", category: "Vulnerabilities" },
    { name: "HACKMAGEDDON", url: "https://www.hackmageddon.com/feed/", type: "rss", category: "Breaches" },
    { name: "HackRead", url: "https://www.hackread.com/feed", type: "rss", category: "Threats" },
    { name: "Have I Been Pwned", url: "https://feeds.feedburner.com/HaveIBeenPwnedLatestBreaches", type: "rss", category: "Breaches" },
    { name: "Heimdal Security Blog", url: "https://heimdalsecurity.com/blog/feed", type: "rss", category: "Analysis" },
    { name: "Help Net Security", url: "https://www.helpnetsecurity.com/feed", type: "rss", category: "Updates" },
    { name: "Industrial Cyber", url: "https://industrialcyber.co/feed/", type: "rss", category: "Threats" },
    { name: "Infosecurity Magazine", url: "https://www.infosecurity-magazine.com/rss/news", type: "rss", category: "Updates" },
    { name: "Kali Linux", url: "https://www.kali.org/rss.xml", type: "rss", category: "Updates" },
    { name: "KitPloit", url: "http://feeds.feedburner.com/PentestTools", type: "rss", category: "Analysis" },
    { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", type: "rss", category: "Breaches" },
    { name: "Let's Encrypt", url: "https://letsencrypt.org/feed.xml", type: "rss", category: "Updates" },
    { name: "Malwarebytes Labs", url: "https://blog.malwarebytes.com/feed/", type: "rss", category: "Threats" },
    { name: "MalwareTech", url: "https://malwaretech.com/feed.xml", type: "rss", category: "Analysis" },
    { name: "Microsoft Security Blog", url: "https://www.microsoft.com/security/blog/feed", type: "rss", category: "Updates" },
    { name: "Microsoft Security Response Center", url: "https://msrc-blog.microsoft.com/feed", type: "rss", category: "Vulnerabilities" },
    { name: "Mozilla Security Blog", url: "https://blog.mozilla.org/security/feed/", type: "rss", category: "Updates" },
    { name: "Naked Security", url: "https://nakedsecurity.sophos.com/feed", type: "rss", category: "Threats" },
    { name: "NCC Group Research", url: "https://research.nccgroup.com/feed", type: "rss", category: "Analysis" },
    { name: "NCSC Feed", url: "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml", type: "rss", category: "Updates" },
    { name: "NVISO Labs", url: "https://blog.nviso.eu/feed", type: "rss", category: "Analysis" },
    { name: "Objective-See", url: "https://objective-see.org/rss.xml", type: "rss", category: "Analysis" },
    { name: "Packet Storm", url: "https://rss.packetstormsecurity.com/", type: "rss", category: "Vulnerabilities" },
    { name: "Pen Test Partners", url: "https://www.pentestpartners.com/feed", type: "rss", category: "Analysis" },
    { name: "PortSwigger Blog", url: "https://portswigger.net/blog/rss", type: "rss", category: "Analysis" },
    { name: "PortSwigger Research", url: "https://portswigger.net/research/rss", type: "rss", category: "Vulnerabilities" },
    { name: "Project Zero", url: "https://googleprojectzero.blogspot.com/feeds/posts/default?alt=rss", type: "rss", category: "Vulnerabilities" },
    { name: "Proofpoint", url: "https://www.proofpoint.com/us/rss.xml", type: "rss", category: "Threats" },
    { name: "Rapid7 Blog", url: "https://blog.rapid7.com/rss/", type: "rss", category: "Analysis" },
    { name: "Red Hat Security", url: "https://www.redhat.com/en/rss/blog/channel/security", type: "rss", category: "Updates" },
    { name: "Rekt", url: "https://rekt.news/rss/feed.xml", type: "rss", category: "Breaches" },
    { name: "Resecurity", url: "https://www.resecurity.com/feed", type: "rss", category: "Threats" },
    { name: "ReversingLabs Blog", url: "https://blog.reversinglabs.com/blog/rss.xml", type: "rss", category: "Analysis" },
    { name: "SANS Blog", url: "https://www.sans.org/blog/feed.xml", type: "rss", category: "Analysis" },
    { name: "Schneier on Security", url: "https://www.schneier.com/feed/atom", type: "rss", category: "Analysis" },
    { name: "Scott Helme", url: "https://scotthelme.co.uk/rss/", type: "rss", category: "Analysis" },
    { name: "Secureworks CTU Research", url: "https://www.secureworks.com/rss?feed=research", type: "rss", category: "Threats" },
    { name: "Security Affairs", url: "http://securityaffairs.co/wordpress/feed", type: "rss", category: "Threats" },
    { name: "Security Boulevard", url: "https://securityboulevard.com/feed/", type: "rss", category: "Updates" },
    { name: "Security Intelligence", url: "https://securityintelligence.com/feed", type: "rss", category: "Analysis" },
    { name: "SecurityWeek", url: "https://feeds.feedburner.com/securityweek", type: "rss", category: "Updates" },
    { name: "SentinelOne Labs", url: "https://www.sentinelone.com/feed/", type: "rss", category: "Threats" },
    { name: "Signal Blog", url: "https://signal.org/blog/rss.xml", type: "rss", category: "Updates" },
    { name: "SOCRadar", url: "https://socradar.io/feed/", type: "rss", category: "Threats" },
    { name: "Sucuri Blog", url: "https://blog.sucuri.net/feed/", type: "rss", category: "Threats" },
    { name: "Synack", url: "https://www.synack.com/feed/", type: "rss", category: "Analysis" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", type: "rss", category: "Updates" },
    { name: "The Citizen Lab", url: "https://citizenlab.ca/feed/", type: "rss", category: "Analysis" },
    { name: "The Cloudflare Blog", url: "http://blog.cloudflare.com/rss/", type: "rss", category: "Updates" },
    { name: "The DFIR Report", url: "https://thedfirreport.com/feed/", type: "rss", category: "Analysis" },
    { name: "The GitHub Blog: Security", url: "https://github.blog/category/security/feed/", type: "rss", category: "Updates" },
    { name: "The GreyNoise Blog", url: "https://www.greynoise.io/blog/rss.xml", type: "rss", category: "Threats" },
    { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", type: "rss", category: "Threats" },
    { name: "The Record by Recorded Future", url: "https://therecord.media/feed/", type: "rss", category: "Threats" },
    { name: "The Red Canary Blog", url: "https://redcanary.com/blog/feed/", type: "rss", category: "Analysis" },
    { name: "The Register - Security", url: "https://www.theregister.com/security/headlines.atom", type: "rss", category: "Updates" },
    { name: "The State of Security", url: "https://www.tripwire.com/state-of-security/feed/", type: "rss", category: "Analysis" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", type: "rss", category: "Updates" },
    { name: "Threat Analysis Group", url: "https://blog.google/threat-analysis-group/rss", type: "rss", category: "Threats" },
    { name: "Threatpost", url: "https://threatpost.com/feed", type: "rss", category: "Threats" },
    { name: "Trail of Bits Blog", url: "https://blog.trailofbits.com/feed/", type: "rss", category: "Analysis" },
    { name: "Trend Micro Simply Security", url: "http://feeds.trendmicro.com/TrendMicroSimplySecurity", type: "rss", category: "Threats" },
    { name: "Troy Hunt's Blog", url: "https://feeds.feedburner.com/TroyHunt", type: "rss", category: "Breaches" },
    { name: "TrustedSec", url: "http://www.trustedsec.com/feed/", type: "rss", category: "Analysis" },
    { name: "Ubuntu Security Notices", url: "https://ubuntu.com/security/notices/rss.xml", type: "rss", category: "Vulnerabilities" },
    { name: "Unit42", url: "https://unit42.paloaltonetworks.com/feed", type: "rss", category: "Threats" },
    { name: "Venture in Security", url: "https://ventureinsecurity.net/feed", type: "rss", category: "Analysis" },
    { name: "VulnCheck Blog", url: "https://vulncheck.com/feed/blog/atom.xml", type: "rss", category: "Vulnerabilities" },
    { name: "watchTowr Labs", url: "https://labs.watchtowr.com/rss/", type: "rss", category: "Analysis" },
    { name: "WeLiveSecurity", url: "https://www.welivesecurity.com/feed", type: "rss", category: "Threats" },
    { name: "Wordfence", url: "https://www.wordfence.com/feed/", type: "rss", category: "Threats" },
    { name: "Zero Day Initiative", url: "https://www.zerodayinitiative.com/blog?format=rss", type: "rss", category: "Vulnerabilities" }
  ];

  const handleBulkImport = async () => {
    setIsImporting(true);
    setProgress(0);
    const newResults = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < predefinedSources.length; i++) {
      const source = predefinedSources[i];
      try {
        await addSourceMutation.mutateAsync({
          name: source.name,
          url: source.url,
          type: source.type,
          category: source.category,
          isActive: true,
        });
        newResults.success++;
      } catch (error) {
        newResults.failed++;
        newResults.errors.push(`${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setProgress(((i + 1) / predefinedSources.length) * 100);
    }

    setResults(newResults);
    setIsImporting(false);
    
    toast({
      title: "Import Complete",
      description: `Successfully imported ${newResults.success} sources. ${newResults.failed} failed.`,
      variant: newResults.failed > 0 ? "destructive" : "default",
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import Cybersecurity News Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-slate-300">
          <p>Import {predefinedSources.length} pre-configured cybersecurity news sources including:</p>
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>Threat intelligence feeds (Krebs on Security, The Hacker News, etc.)</li>
            <li>Vulnerability databases (CISA, CVE, Exploit-DB, etc.)</li>
            <li>Security vendor blogs (Microsoft, Google, AWS, etc.)</li>
            <li>Research publications (SANS, NCC Group, Trail of Bits, etc.)</li>
            <li>Industry news (Dark Reading, SecurityWeek, etc.)</li>
          </ul>
        </div>

        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-slate-400 text-sm">
              Importing sources... {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {results.success > 0 || results.failed > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Successfully imported: {results.success}</span>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>Failed: {results.failed}</span>
              </div>
            )}
            {results.errors.length > 0 && (
              <details className="text-sm">
                <summary className="text-slate-400 cursor-pointer">View errors</summary>
                <div className="mt-2 text-red-400 space-y-1">
                  {results.errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : null}

        <Button
          onClick={handleBulkImport}
          disabled={isImporting}
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          {isImporting ? 'Importing...' : `Import ${predefinedSources.length} News Sources`}
        </Button>
      </CardContent>
    </Card>
  );
};
