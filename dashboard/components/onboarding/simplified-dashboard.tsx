'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Pause,
  Settings,
  Eye,
  Zap,
  Coins,
  Activity
} from 'lucide-react';
import { MiningAnimation } from '@/components/mining-animation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SimplifiedDashboardProps {
  netProfit: number;
  roi: number;
  currentBalance: number;
  motherlode: number;
  miningEnabled: boolean;
  miningStatus: 'mining' | 'waiting' | 'idle';
  isAutomationActive: boolean;
  chartData: any[];
  onViewFullDashboard: () => void;
}

async function toggleMining(enabled: boolean) {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'MINING_ENABLED', value: enabled }),
  });
  if (!res.ok) throw new Error('Failed to toggle mining');
  return res.json();
}

export function SimplifiedDashboard({
  netProfit,
  roi,
  currentBalance,
  motherlode,
  miningEnabled,
  miningStatus,
  isAutomationActive,
  chartData,
  onViewFullDashboard,
}: SimplifiedDashboardProps) {
  const queryClient = useQueryClient();
  const isProfit = netProfit >= 0;

  const toggleMiningMutation = useMutation({
    mutationFn: toggleMining,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['status'] });
      const enabled = data.value;
      toast.success(enabled ? 'Mining enabled' : 'Mining paused', {
        description: enabled
          ? 'Bot will mine on next round'
          : 'Mining paused - you can resume anytime',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to toggle mining', {
        description: error.message,
      });
    },
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <Card className="border-border/50 bg-card">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome to ORB Mining! 🎉</h2>
              <p className="text-sm text-muted-foreground">
                Your bot is running automatically. Check back anytime to see your progress.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onViewFullDashboard}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Full Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats - Big and Clear */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Profit Display */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Your Profit
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-bold",
                    isProfit
                      ? "bg-green-950/20 text-green-400 border-green-800/30"
                      : "bg-red-950/20 text-red-400 border-red-800/30"
                  )}
                >
                  {isProfit ? '+' : ''}{roi.toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-baseline gap-3 mb-4">
                <span
                  className={cn(
                    "text-6xl font-black tracking-tight",
                    isProfit ? "text-green-400" : "text-red-400"
                  )}
                >
                  {isProfit ? '+' : ''}{netProfit.toFixed(4)}
                </span>
                <span className="text-3xl font-bold text-muted-foreground/60">SOL</span>
              </div>

              {/* Mini Chart */}
              {chartData.length > 0 && (
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isProfit ? '#22c55e' : '#ef4444'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Right: Mining Animation */}
            <div className="flex items-center justify-center">
              <MiningAnimation
                isActive={isAutomationActive}
                status={miningStatus}
                deployed={undefined}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mining Status */}
        <Card className="border-border/50 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mining Status</p>
                <p className="text-2xl font-bold">
                  {miningEnabled ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-yellow-400">Paused</span>
                  )}
                </p>
              </div>
              <Zap
                className={cn(
                  "h-12 w-12",
                  miningEnabled ? "text-green-400" : "text-yellow-400"
                )}
              />
            </div>
            <Button
              onClick={() => toggleMiningMutation.mutate(!miningEnabled)}
              disabled={toggleMiningMutation.isPending}
              variant={miningEnabled ? "outline" : "default"}
              className={cn(
                "w-full",
                miningEnabled
                  ? "border-yellow-600/40 hover:bg-yellow-950/20"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {miningEnabled ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="border-border/50 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-blue-400">
                  {currentBalance.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">SOL</p>
              </div>
              <Coins className="h-12 w-12 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        {/* Motherlode */}
        <Card className="border-border/50 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Motherlode</p>
                <p className="text-2xl font-bold text-purple-400">
                  {motherlode.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ORB rewards</p>
              </div>
              <Activity className="h-12 w-12 text-purple-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-lg">💡 What's Happening?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-950/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-400">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium">Bot is monitoring profitability</p>
              <p className="text-xs text-muted-foreground">
                The bot only deploys when expected value (EV) is positive
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-950/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-400">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium">Auto-claiming rewards</p>
              <p className="text-xs text-muted-foreground">
                Rewards are claimed automatically when thresholds are met
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-950/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-400">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium">Growing your balance</p>
              <p className="text-xs text-muted-foreground">
                ORB tokens are auto-swapped to SOL for compound growth
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" asChild size="lg">
          <Link href="/profitability">
            <TrendingUp className="h-5 w-5 mr-2" />
            View Detailed Stats
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/settings">
            <Settings className="h-5 w-5 mr-2" />
            Change Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
