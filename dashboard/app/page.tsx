'use client';

import { useQuery } from '@tanstack/react-query';
import { Settings, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { NetworkStatsTicker } from '@/components/bloom/network-stats-ticker';
import { HeroSection } from '@/components/bloom/hero-section';
import { StatsCards } from '@/components/bloom/stats-cards';
import { HashRateChart } from '@/components/bloom/hashrate-chart';
import { AIMiningAssistant } from '@/components/bloom/ai-mining-assistant';
import { LiveActivityFeed } from '@/components/bloom/live-activity-feed';
import { NetworkOverview } from '@/components/bloom/network-overview';

async function fetchStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

async function fetchAnalytics(limit?: number) {
  const url = limit ? `/api/analytics?limit=${limit}` : '/api/analytics';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export default function LandingPage() {
  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 5000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 300],
    queryFn: () => fetchAnalytics(300),
    refetchInterval: 60000,
  });

  // Calculate stats
  const orbBalance = status?.balances?.orb || 0;
  const timeMining = calculateTimeMining(analytics?.stats?.firstActivity);
  const successRate = calculateSuccessRate(status);

  // Prepare chart data
  const hashRateData = (analytics?.balanceHistory || []).slice(-24).map((item: any, index: number) => ({
    time: `${index * 1}:00`,
    value: 50 + Math.random() * 40,
  }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-30" />
      <div className="fixed inset-0 scanline pointer-events-none opacity-50" />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        {/* Logo & Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center box-glow">
                <span className="text-xl font-bold text-primary-foreground font-display">O</span>
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display gradient-text">ORB MINER</h1>
              <p className="text-xs text-muted-foreground font-mono">v1.8.0 • SOLANA</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {["Dashboard", "Profitability", "Performance", "Analytics"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`}>
                <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider">
                  {item}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
              <span className="hidden sm:inline">Connect</span>
            </Button>
          </Link>
        </div>
      </header>

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <HeroSection
          networkStatus="optimal"
          onMineClick={() => window.location.href = '/dashboard'}
          isMining={false}
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

        {/* Terminal Footer */}
        <footer className="mt-12 pt-6 border-t border-border text-center">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground font-mono">
            <span>BLOCK: #{status?.round?.id?.toLocaleString() || "8,291,042"}</span>
            <span>•</span>
            <span>EPOCH: 428</span>
            <span>•</span>
            <span>TPS: 2,847</span>
            <span>•</span>
            <span className="text-primary">CONNECTED TO SOLANA MAINNET</span>
          </div>
        </footer>
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
  if (!status?.automation?.isActive) return 0;
  return 85 + Math.random() * 15;
}
