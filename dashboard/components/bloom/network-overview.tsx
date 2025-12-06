'use client';

import { Globe, Activity, Users } from 'lucide-react';

interface NetworkOverviewProps {
  globalHashrate: string;
  activeMiners: number;
}

export function NetworkOverview({
  globalHashrate = '142.8 TH/s',
  activeMiners = 12847,
}: Partial<NetworkOverviewProps>) {
  return (
    <div className="stat-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Network Overview
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Global Hashrate
            </span>
          </div>
          <p className="text-lg font-bold text-primary">{globalHashrate}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Active Miners
            </span>
          </div>
          <p className="text-lg font-bold text-foreground">{activeMiners.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
