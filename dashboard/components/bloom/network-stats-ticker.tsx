'use client';

import { TrendingUp, TrendingDown, Activity, Users, Blocks, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkStatsTickerProps {
  orbPriceSol: number;
  orbPriceChange: number;
  networkHash: string;
  networkHashChange: number;
  activeMiners: number;
  activeMinerChange: number;
  blockHeight: number;
  difficulty: string;
  difficultyChange: number;
}

export function NetworkStatsTicker({
  orbPriceSol = 0.00847,
  orbPriceChange = 2.4,
  networkHash = '142.8 TH/s',
  networkHashChange = -0.8,
  activeMiners = 12847,
  activeMinerChange = 156,
  blockHeight = 8291042,
  difficulty = '4.28T',
  difficultyChange = 0.2,
}: Partial<NetworkStatsTickerProps>) {
  const stats = [
    {
      label: 'ORB/SOL',
      value: orbPriceSol.toFixed(5),
      change: orbPriceChange,
      icon: Activity,
    },
    {
      label: 'NETWORK HASH',
      value: networkHash,
      change: networkHashChange,
      icon: Gauge,
    },
    {
      label: 'ACTIVE MINERS',
      value: activeMiners.toLocaleString(),
      change: activeMinerChange,
      prefix: '+',
      icon: Users,
    },
    {
      label: 'BLOCK HEIGHT',
      value: `#${blockHeight.toLocaleString()}`,
      change: 1,
      prefix: '+',
      icon: Blocks,
    },
    {
      label: 'DIFFICULTY',
      value: difficulty,
      change: difficultyChange,
      icon: Activity,
    },
  ];

  return (
    <div className="w-full bg-card/50 border-b border-border/30 overflow-hidden">
      <div className="flex items-center gap-8 py-2 px-4 text-xs">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">
              {stat.label}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {stat.value}
            </span>
            <span className={cn(
              "font-mono text-[10px]",
              stat.change > 0 ? "text-green-400" : stat.change < 0 ? "text-red-400" : "text-muted-foreground"
            )}>
              {stat.change > 0 ? '+' : ''}{stat.prefix || ''}{stat.change}
              {stat.label !== 'ACTIVE MINERS' && stat.label !== 'BLOCK HEIGHT' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
