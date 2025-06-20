import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor } from 'lucide-react';

export const SystemMonitor = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          System Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-slate-300 text-center py-8">
          <p className="mb-2">System/server monitoring coming soon.</p>
          <p>This section will display real-time server metrics (CPU, memory, uptime, etc.).</p>
        </div>
      </CardContent>
    </Card>
  );
};
