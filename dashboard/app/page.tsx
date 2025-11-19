'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  Coins,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

async function fetchStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

async function fetchPnL() {
  const res = await fetch('/api/pnl');
  if (!res.ok) throw new Error('Failed to fetch PnL');
  return res.json();
}

export default function Home() {
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 10000,
  });

  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ['pnl'],
    queryFn: fetchPnL,
    refetchInterval: 30000,
  });

  if (statusLoading || pnlLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <Zap className="h-12 w-12 animate-pulse text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const netPnL = pnl?.summary?.netProfit || 0;
  const roi = pnl?.summary?.roi || 0;
  const isProfit = netPnL >= 0;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Compact Hero - PnL */}
        <Card className="border-primary/50 neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-muted-foreground">Actual Profit</p>
                  <Badge variant="outline" className={cn(isProfit ? "bg-green-500/20 text-green-500 border-green-500/50" : "bg-red-500/20 text-red-500 border-red-500/50")}>
                    {isProfit ? '+' : ''}{roi.toFixed(2)}% ROI
                  </Badge>
                  {!pnl?.truePnL?.hasBaseline && (
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 text-xs">
                      No Baseline
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className={cn("text-4xl font-bold", isProfit ? "text-green-500 neon-text" : "text-red-500")}>
                    {isProfit ? '+' : ''}{netPnL.toFixed(4)} SOL
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Started: {(pnl?.truePnL?.startingBalance || 0).toFixed(4)} SOL • Now: {(pnl?.truePnL?.currentBalance || 0).toFixed(4)} SOL
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">SOL Claimed</span>
                    <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                      +{(pnl?.breakdown?.income?.solFromMining || 0).toFixed(4)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">ORB Earned</span>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50">
                      {(pnl?.breakdown?.income?.orbFromMining || 0).toFixed(2)} ORB
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Swapped ORB</span>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-500 border-purple-500/50">
                      {(pnl?.breakdown?.income?.orbSwappedCount || 0).toFixed(2)} ORB
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Total Fees</span>
                    <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                      -{(pnl?.summary?.totalExpenses || 0).toFixed(4)}
                    </Badge>
                  </div>
                </div>
              </div>
              {isProfit ? (
                <TrendingUp className="h-12 w-12 text-green-500" />
              ) : (
                <TrendingDown className="h-12 w-12 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compact Balances & Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Balances */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Balances
                </span>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">
                  {((status?.balances?.sol || 0) + (status?.balances?.automationSol || 0)).toFixed(4)} SOL Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Main Wallet</span>
                <div className="text-right">
                  <div className="font-semibold">{status?.balances?.sol?.toFixed(4) || '0'} SOL</div>
                  <div className="text-xs text-muted-foreground">{status?.balances?.orb?.toFixed(2) || '0'} ORB</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Automation Bot</span>
                  <Badge variant="outline" className="bg-cyan-500/20 text-cyan-500 border-cyan-500/50 text-xs">
                    {status?.automation?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="font-semibold">{status?.balances?.automationSol?.toFixed(4) || '0'} SOL</div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">ORB Price</span>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <div className="font-semibold text-primary">${status?.prices?.orbPriceUsd?.toFixed(2) || '0'}</div>
                    <div className="text-xs text-muted-foreground">{status?.prices?.orbPriceSol?.toFixed(6) || '0'} SOL</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Round */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Current Round
                </span>
                <Badge variant="outline" className="font-mono">{status?.round?.id || 'N/A'}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Prize Pool (Motherlode)</span>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50 font-bold">
                  {status?.round?.motherlode?.toFixed(2) || '0'} ORB
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your Staked ORB</span>
                <div className="font-semibold">{status?.staking?.stakedOrb?.toFixed(2) || '0'} ORB</div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                  {((status?.balances?.sol || 0) + (status?.balances?.automationSol || 0) + ((status?.balances?.orb || 0) * (status?.prices?.orbPriceSol || 0))).toFixed(4)} SOL
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claimable Rewards - Compact Tabs */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Claimable Rewards
              </span>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                Ready to Claim
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mining" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mining">
                  Mining Rewards
                </TabsTrigger>
                <TabsTrigger value="staking">
                  Staking Rewards
                </TabsTrigger>
              </TabsList>
              <TabsContent value="mining" className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SOL from Mining</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                    {status?.claimable?.sol?.toFixed(4) || '0'} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ORB from Mining</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                    {status?.claimable?.orb?.toFixed(2) || '0'} ORB
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="font-bold text-green-500">
                      ≈ {((status?.claimable?.sol || 0) + ((status?.claimable?.orb || 0) * (status?.prices?.orbPriceSol || 0))).toFixed(4)} SOL
                    </span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="staking" className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SOL from Staking</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                    {(status?.claimable?.stakingRewardsSol || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ORB from Staking</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                    {(status?.claimable?.stakingRewardsOrb || 0).toFixed(2)} ORB
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="font-bold text-green-500">
                      ≈ {((status?.claimable?.stakingRewardsSol || 0) + ((status?.claimable?.stakingRewardsOrb || 0) * (status?.prices?.orbPriceSol || 0))).toFixed(4)} SOL
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
