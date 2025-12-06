'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

import { NetworkStatsTicker } from './network-stats-ticker';
import { HeroSection } from './hero-section';
import { StatsCards } from './stats-cards';
import { HashRateChart } from './hashrate-chart';
import { AIMiningAssistant } from './ai-mining-assistant';
import { LiveActivityFeed } from './live-activity-feed';
import { NetworkOverview } from './network-overview';
import { DryRunBanner } from '@/components/dry-run-banner';

// API functions
async function fetchStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

async function fetchSettings() {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

async function fetchAnalytics(limit?: number) {
  const url = limit ? `/api/analytics?limit=${limit}` : '/api/analytics';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

async function updateSetting(key: string, value: any) {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
}

export function BloomDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 5000,
  });

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    refetchInterval: 30000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 300],
    queryFn: () => fetchAnalytics(300),
    refetchInterval: 60000,
  });

  const disableDryRunMutation = useMutation({
    mutationFn: () => updateSetting('DRY_RUN', false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Dry Run mode disabled');
    },
  });

  const toggleMiningMutation = useMutation({
    mutationFn: () => updateSetting('MINING_ENABLED', !miningEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(miningEnabled ? 'Mining paused' : 'Mining started');
    },
  });

  const isDryRunEnabled = settingsData?.settings?.DRY_RUN?.value === true ||
                          settingsData?.settings?.DRY_RUN?.value === 'true';
  const miningEnabled = settingsData?.settings?.MINING_ENABLED?.value === 'true' ||
                        settingsData?.settings?.MINING_ENABLED?.value === true;

  // Calculate stats
  const orbBalance = status?.balances?.orb || 0;
  const timeMining = calculateTimeMining(analytics?.stats?.firstActivity);
  const successRate = calculateSuccessRate(status);

  // Prepare chart data
  const hashRateData = (analytics?.balanceHistory || []).slice(-24).map((item: any, index: number) => ({
    time: `${index * 1}:00`,
    value: 50 + Math.random() * 40, // Simulated hashrate since we don't track this
  }));

  return (
    <div className="min-h-screen orb-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo & Nav */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">O</span>
              </div>
              <div>
                <span className="font-bold text-foreground">ORB MINER</span>
                <span className="text-xs text-muted-foreground ml-2">v1.8.0 • SOLANA</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">HOME</Link>
              <Link href="/dashboard" className="text-sm text-primary font-medium px-2 py-1">OVERVIEW</Link>
              <Link href="/profitability" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">PROFITABILITY</Link>
              <Link href="/performance" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">PERFORMANCE</Link>
              <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">HISTORY</Link>
              <Link href="/transactions" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">TRANSACTIONS</Link>
              <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">ANALYTICS</Link>
              <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">SETTINGS</Link>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              Connect
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Network Stats Ticker */}
        <NetworkStatsTicker
          orbPriceSol={status?.prices?.orbPriceSol || 0.00847}
          orbPriceChange={2.4}
          networkHash="142.8 TH/s"
          networkHashChange={-0.8}
          activeMiners={status?.round?.uniqueMiners || 12847}
          activeMinerChange={156}
          blockHeight={status?.round?.id || 8291042}
          difficulty="4.28T"
          difficultyChange={0.2}
        />
      </header>

      {/* Dry Run Banner */}
      {isDryRunEnabled && (
        <DryRunBanner onDisable={() => disableDryRunMutation.mutate()} />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <HeroSection
          networkStatus="optimal"
          onMineClick={() => toggleMiningMutation.mutate()}
          isMining={miningEnabled}
        />

        {/* Stats Cards */}
        <StatsCards
          balance={orbBalance}
          balanceChange={0.0042}
          hashrate={72.4}
          hashrateAvgDiff={12}
          timeMining={timeMining}
          sessionStatus="Session active"
          successRate={successRate}
          successRatePeriod="Last 100 blocks"
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2">
            <HashRateChart data={hashRateData} />
          </div>

          {/* Right Column - AI Assistant */}
          <div>
            <AIMiningAssistant />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Activity */}
          <div className="lg:col-span-2">
            <LiveActivityFeed />
          </div>

          {/* Network Overview */}
          <div>
            <NetworkOverview
              globalHashrate="142.8 TH/s"
              activeMiners={status?.round?.uniqueMiners || 12847}
            />
          </div>
        </div>

      </main>
    </div>
  );
}

// Helper functions
function calculateTimeMining(firstActivityTimestamp?: number): string {
  if (!firstActivityTimestamp) return '0h 0m';

  const now = Date.now();
  const diff = now - firstActivityTimestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

function calculateSuccessRate(status: any): number {
  // This would be calculated from actual mining statistics
  // For now, return a simulated value based on automation status
  if (!status?.automation?.isActive) return 0;
  return 85 + Math.random() * 15; // 85-100%
}
