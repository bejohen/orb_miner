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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Net PnL Hero */}
        <Card className="border-primary/50 neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold">Profit & Loss</h2>
                  {!pnl?.truePnL?.hasBaseline && (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">No Baseline</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className={cn("text-4xl font-bold", isProfit ? "text-green-500 neon-text" : "text-red-500")}>
                    {isProfit ? '+' : ''}{(pnl?.summary?.netProfit || 0).toFixed(4)} SOL
                  </span>
                  <span className={cn("text-xl font-semibold", isProfit ? "text-green-500" : "text-red-500")}>
                    {isProfit ? '+' : ''}{(pnl?.summary?.roi || 0).toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {(pnl?.truePnL?.startingBalance || 0).toFixed(4)} SOL → {(pnl?.truePnL?.currentBalance || 0).toFixed(4)} SOL
                </p>
              </div>
              {isProfit ? (
                <TrendingUp className="h-12 w-12 text-green-500" />
              ) : (
                <TrendingDown className="h-12 w-12 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Breakdown */}
        <Card className="border-primary/30">
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
                <div className="flex justify-between pb-2 border-b">
                  <span className="font-semibold text-green-500">Total Income</span>
                  <span className="font-bold text-green-500">{(pnl?.breakdown?.income?.totalSolIncome || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SOL from Mining</span>
                  <span className="font-semibold">{(pnl?.breakdown?.income?.solFromMining || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ORB from Mining</span>
                  <span className="font-semibold">{(pnl?.breakdown?.income?.orbFromMining || 0).toFixed(2)} ORB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SOL from Swaps</span>
                  <span className="font-semibold">{(pnl?.breakdown?.income?.solFromSwaps || 0).toFixed(4)} SOL</span>
                </div>
                {pnl?.breakdown?.income?.orbSwappedCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ORB Sold</span>
                    <span className="text-sm">{(pnl.breakdown.income.orbSwappedCount || 0).toFixed(2)} ORB</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Current ORB Value</span>
                  <span className="font-semibold text-primary">{(pnl?.truePnL?.holdings?.orbValueSol || 0).toFixed(4)} SOL</span>
                </div>
              </TabsContent>

              {/* Expenses Tab */}
              <TabsContent value="expenses" className="mt-4 space-y-3">
                <div className="flex justify-between pb-2 border-b">
                  <span className="font-semibold text-red-500">Total Expenses</span>
                  <span className="font-bold text-red-500">{(pnl?.breakdown?.expenses?.totalExpenses || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capital Deployed</span>
                  <span className="font-semibold">{(pnl?.breakdown?.expenses?.deployedSol || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction Fees</span>
                  <span className="font-semibold">{(pnl?.breakdown?.expenses?.transactionFees || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Protocol Fees (10%)</span>
                  <span className="font-semibold">{(pnl?.breakdown?.expenses?.protocolFees || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dev Fees (0.5%)</span>
                  <span className="font-semibold">{(pnl?.breakdown?.expenses?.devFees || 0).toFixed(4)} SOL</span>
                </div>
              </TabsContent>

              {/* Holdings Tab */}
              <TabsContent value="holdings" className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Wallet SOL</span>
                  <span className="font-semibold">{(pnl?.truePnL?.holdings?.walletSol || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Automation SOL</span>
                  <span className="font-semibold">{(pnl?.truePnL?.holdings?.automationSol || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Claimable SOL</span>
                  <span className="font-semibold">{(pnl?.truePnL?.holdings?.claimableSol || 0).toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total ORB</span>
                  <span className="font-semibold">{(pnl?.truePnL?.holdings?.totalOrb || 0).toFixed(2)} ORB</span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total SOL</span>
                    <span className="font-bold text-primary">{(pnl?.truePnL?.holdings?.totalSol || 0).toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Value (incl. ORB)</span>
                    <span className="font-bold text-primary">{(pnl?.truePnL?.currentBalance || 0).toFixed(4)} SOL</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{pnl?.breakdown?.stats?.roundsParticipated || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Rounds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{pnl?.breakdown?.stats?.totalDeployments || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Deployments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{pnl?.breakdown?.stats?.totalClaims || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Claims</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{pnl?.breakdown?.stats?.totalSwaps || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Swaps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
