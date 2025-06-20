import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor } from 'lucide-react';

export const SystemMonitor = () => {
  // You can replace these with real env vars if available
  const region = process.env.VERCEL_REGION || 'iad1 (Washington, D.C., USA)';
  const memory = '8 GB';
  const cpu = '2 vCPU';
  const provider = 'Vercel';

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          System Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-slate-300 text-center py-8 space-y-4">
          <div>
            <div className="text-lg font-semibold text-white mb-2">Deployment Info</div>
            <div className="flex flex-col items-center space-y-1">
              <span><b>Provider:</b> {provider}</span>
              <span><b>Region:</b> {region}</span>
              <span><b>Memory:</b> {memory}</span>
              <span><b>CPU:</b> {cpu}</span>
            </div>
          </div>
          <div className="mt-6 text-slate-400">
            <b>Live monitoring</b> (CPU, memory, uptime, etc.) coming soon.<br />
            For now, this shows static deployment info.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
