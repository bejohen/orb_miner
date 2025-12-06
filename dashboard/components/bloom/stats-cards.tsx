'use client';

import { Coins, Gauge, Clock, Percent, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ label, value, subValue, trend, trendUp, icon, highlight }: StatCardProps) {
  return (
    <div className={cn(
      "stat-card p-4",
      highlight && "stat-card-highlight"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-xl md:text-2xl font-bold text-primary">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-green-400 mt-0.5">
              {subValue}
            </p>
          )}
          {trend && (
            <p className={cn(
              "text-xs mt-0.5 flex items-center gap-1",
              trendUp ? "text-green-400" : "text-muted-foreground"
            )}>
              {trendUp && <TrendingUp className="w-3 h-3" />}
              {trend}
            </p>
          )}
        </div>
        <div className="text-primary/50">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  balance: number;
  balanceChange?: number;
  hashrate?: number;
  hashrateAvgDiff?: number;
  timeMining: string;
  sessionStatus: string;
  successRate: number;
  successRatePeriod: string;
}

export function StatsCards({
  balance = 0,
  balanceChange = 0,
  hashrate = 0,
  hashrateAvgDiff = 0,
  timeMining = '0h 0m',
  sessionStatus = 'Session active',
  successRate = 0,
  successRatePeriod = 'Last 100 blocks',
}: Partial<StatsCardsProps>) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard
        label="Balance"
        value={`${balance.toFixed(4)} ORB`}
        subValue={balanceChange > 0 ? `+${balanceChange.toFixed(4)} today` : undefined}
        icon={<Coins className="w-6 h-6" />}
        highlight
      />
      <StatCard
        label="Hashrate"
        value={hashrate > 0 ? `${hashrate.toFixed(1)} KH/s` : 'N/A'}
        trend={hashrateAvgDiff !== 0 ? `${hashrateAvgDiff > 0 ? '↑' : '↓'} ${Math.abs(hashrateAvgDiff)}% from avg` : undefined}
        trendUp={hashrateAvgDiff > 0}
        icon={<Gauge className="w-6 h-6" />}
      />
      <StatCard
        label="Time Mining"
        value={timeMining}
        subValue={sessionStatus}
        icon={<Clock className="w-6 h-6" />}
      />
      <StatCard
        label="Success Rate"
        value={`${successRate.toFixed(1)}%`}
        subValue={successRatePeriod}
        icon={<Percent className="w-6 h-6" />}
      />
    </div>
  );
}
