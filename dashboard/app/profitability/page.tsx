'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

async function fetchPnL() {
  const res = await fetch('/api/pnl');
  if (!res.ok) throw new Error('Failed to fetch PnL');
  return res.json();
}

export default function Profitability() {
  const { data: pnl, isLoading } = useQuery({
    queryKey: ['pnl'],
    queryFn: fetchPnL,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <DollarSign className="h-12 w-12 animate-pulse text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const isProfit = (pnl?.summary?.netProfit || 0) >= 0;
  const solPriceUsd = pnl?.solPriceUsd || 0;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Net PnL Hero */}
        <Card className="border-border/50 bg-card">
          <CardContent className="px-4 py-4 lg:px-6 lg:py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4 lg:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profit & Loss</h3>
                  <Badge variant="outline" className={cn(
                    "text-xs font-bold",
                    isProfit ? "bg-green-950/20 text-green-400 border-green-800/30" : "bg-red-950/20 text-red-400 border-red-800/30"
                  )}>
                    {isProfit ? '+' : ''}{(pnl?.summary?.roi || 0).toFixed(2)}%
                  </Badge>
                  {!pnl?.truePnL?.hasBaseline && (
                    <Badge variant="outline" className="bg-yellow-950/20 text-yellow-400 border-yellow-800/30 text-xs">
                      No Baseline
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-2 lg:gap-3 mb-1">
                  <span className={cn(
                    "text-4xl lg:text-6xl font-black tracking-tight",
                    isProfit ? "text-green-400" : "text-red-400"
                  )}>
                    {isProfit ? '+' : ''}{(pnl?.summary?.netProfit || 0).toFixed(4)}
                  </span>
                  <span className="text-2xl lg:text-3xl font-bold text-muted-foreground/60">SOL</span>
                </div>
                <p className="text-base lg:text-lg font-semibold text-muted-foreground/80 mb-2 lg:mb-3">
                  {isProfit ? '+' : ''}${((pnl?.summary?.netProfit || 0) * solPriceUsd).toFixed(2)} USD
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-950/20 text-blue-400 border-blue-800/30 font-mono text-[10px] px-2 py-0.5">
                    START: {(pnl?.truePnL?.startingBalance || 0).toFixed(4)}
                  </Badge>
                  <svg className="w-3 h-3 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <Badge variant="outline" className={cn(
                    "font-mono text-[10px] px-2 py-0.5",
                    isProfit
                      ? "bg-green-950/20 text-green-400 border-green-800/30"
                      : "bg-red-950/20 text-red-400 border-red-800/30"
                  )}>
                    NOW: {(pnl?.truePnL?.currentBalance || 0).toFixed(4)}
                  </Badge>
                </div>
              </div>
              {isProfit ? (
                <TrendingUp className="h-12 w-12 lg:h-16 lg:w-16 text-green-400 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-12 w-12 lg:h-16 lg:w-16 text-red-400 flex-shrink-0" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Breakdown */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="income" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
              </TabsList>

              {/* Income Tab */}
              <TabsContent value="income" className="mt-4 space-y-3">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-green-400 uppercase tracking-wide">Total Income</span>
                    <span className="text-2xl font-black text-green-400">{(pnl?.breakdown?.income?.totalSolIncome || 0).toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">${((pnl?.breakdown?.income?.totalSolIncome || 0) * solPriceUsd).toFixed(2)} USD</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">SOL from Mining</span>
                  <Badge variant="outline" className="bg-green-950/20 text-green-400 border-green-800/30 font-mono text-xs">
                    {(pnl?.breakdown?.income?.solFromMining || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">ORB from Mining</span>
                  <Badge variant="outline" className="bg-green-950/20 text-green-400 border-green-800/30 font-mono text-xs">
                    {(pnl?.breakdown?.income?.orbFromMining || 0).toFixed(2)} ORB
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">SOL from Swaps</span>
                  <Badge variant="outline" className="bg-green-950/20 text-green-400 border-green-800/30 font-mono text-xs">
                    {(pnl?.breakdown?.income?.solFromSwaps || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                {pnl?.breakdown?.income?.orbSwappedCount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">ORB Sold</span>
                    <Badge variant="outline" className="bg-purple-950/20 text-purple-400 border-purple-800/30 font-mono text-xs">
                      {(pnl.breakdown.income.orbSwappedCount || 0).toFixed(2)} ORB
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Current ORB Value</span>
                  <Badge variant="outline" className="bg-muted text-foreground border-border font-mono text-xs">
                    {(pnl?.truePnL?.holdings?.orbValueSol || 0).toFixed(4)} SOL
                  </Badge>
                </div>
              </TabsContent>

              {/* Expenses Tab */}
              <TabsContent value="expenses" className="mt-4 space-y-3">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">Total Expenses</span>
                    <span className="text-2xl font-black text-red-400">{(pnl?.breakdown?.expenses?.totalExpenses || 0).toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">${((pnl?.breakdown?.expenses?.totalExpenses || 0) * solPriceUsd).toFixed(2)} USD</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Capital Deployed</span>
                  <Badge variant="outline" className="bg-orange-950/20 text-orange-400 border-orange-800/30 font-mono text-xs">
                    {(pnl?.breakdown?.expenses?.deployedSol || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Transaction Fees</span>
                  <Badge variant="outline" className="bg-red-950/20 text-red-400 border-red-800/30 font-mono text-xs">
                    {(pnl?.breakdown?.expenses?.transactionFees || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Protocol Fees (10%)</span>
                  <Badge variant="outline" className="bg-red-950/20 text-red-400 border-red-800/30 font-mono text-xs">
                    {(pnl?.breakdown?.expenses?.protocolFees || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Dev Fees (0.5%)</span>
                  <Badge variant="outline" className="bg-red-950/20 text-red-400 border-red-800/30 font-mono text-xs">
                    {(pnl?.breakdown?.expenses?.devFees || 0).toFixed(4)} SOL
                  </Badge>
                </div>
              </TabsContent>

              {/* Holdings Tab */}
              <TabsContent value="holdings" className="mt-4 space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Wallet SOL</span>
                  <Badge variant="outline" className="bg-blue-950/20 text-blue-400 border-blue-800/30 font-mono text-xs">
                    {(pnl?.truePnL?.holdings?.walletSol || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Automation SOL</span>
                  <Badge variant="outline" className="bg-cyan-950/20 text-cyan-400 border-cyan-800/30 font-mono text-xs">
                    {(pnl?.truePnL?.holdings?.automationSol || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Claimable SOL</span>
                  <Badge variant="outline" className="bg-yellow-950/20 text-yellow-400 border-yellow-800/30 font-mono text-xs">
                    {(pnl?.truePnL?.holdings?.claimableSol || 0).toFixed(4)} SOL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Total ORB</span>
                  <Badge variant="outline" className="bg-purple-950/20 text-purple-400 border-purple-800/30 font-mono text-xs">
                    {(pnl?.truePnL?.holdings?.totalOrb || 0).toFixed(2)} ORB
                  </Badge>
                </div>
                <div className="border-t border-border/50 pt-4 mt-4 space-y-3">
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-foreground">Total SOL</span>
                      <span className="text-xl font-black text-foreground">{(pnl?.truePnL?.holdings?.totalSol || 0).toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">${((pnl?.truePnL?.holdings?.totalSol || 0) * solPriceUsd).toFixed(2)} USD</span>
                    </div>
                  </div>
                  <div className="bg-muted/40 border border-border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-foreground uppercase tracking-wide">Total Value (incl. ORB)</span>
                      <span className="text-xl font-black text-foreground">
                        {((pnl?.truePnL?.holdings?.totalSol || 0) + (pnl?.truePnL?.holdings?.orbValueSol || 0)).toFixed(4)} SOL
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground font-semibold">
                        ${(((pnl?.truePnL?.holdings?.totalSol || 0) + (pnl?.truePnL?.holdings?.orbValueSol || 0)) * solPriceUsd).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 lg:p-4 text-center">
                <p className="text-2xl lg:text-3xl font-black text-blue-400 mb-1">{pnl?.breakdown?.stats?.roundsParticipated || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Rounds</p>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 lg:p-4 text-center">
                <p className="text-2xl lg:text-3xl font-black text-green-400 mb-1">{pnl?.breakdown?.stats?.totalDeployments || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Deployments</p>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 lg:p-4 text-center">
                <p className="text-2xl lg:text-3xl font-black text-purple-400 mb-1">{pnl?.breakdown?.stats?.totalClaims || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Claims</p>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 lg:p-4 text-center">
                <p className="text-2xl lg:text-3xl font-black text-cyan-400 mb-1">{pnl?.breakdown?.stats?.totalSwaps || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Swaps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
