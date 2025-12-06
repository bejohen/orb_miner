'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  Coins,
  Zap,
  Activity,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { MiningAnimation } from '@/components/mining-animation';
import { CelebrationAnimations } from '@/components/celebration-animations';
import { WelcomeModal } from '@/components/welcome-modal';
import { SetupChecklist } from '@/components/setup-checklist';
import { StrategyRecommender } from '@/components/strategy-recommender';
import { QuickActions } from '@/components/quick-actions';
import { InfoTooltip, TOOLTIPS } from '@/components/info-tooltip';
import { OnboardingContainer } from '@/components/onboarding/onboarding-container';
import { SimplifiedDashboard } from '@/components/onboarding/simplified-dashboard';
import { BloomDashboard } from '@/components/bloom/bloom-dashboard';
import { useState, useEffect } from 'react';

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

async function fetchAnalytics(limit?: number) {
  const url = limit ? `/api/analytics?limit=${limit}` : '/api/analytics';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

async function fetchSettings() {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

async function fetchOnboardingState() {
  const res = await fetch('/api/onboarding');
  if (!res.ok) throw new Error('Failed to fetch onboarding state');
  return res.json();
}

async function triggerClaim() {
  const res = await fetch('/api/claim', { method: 'POST' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to trigger claim');
  }
  return res.json();
}

type TimeRange = '1d' | '7d' | '1m' | 'all';

// Calculate required data points for each time range
// Balance snapshots are taken every 5 minutes
const getDataLimitForTimeRange = (range: TimeRange): number => {
  switch (range) {
    case '1d':
      return 300;  // 25 hours (24h + buffer)
    case '7d':
      return 2100; // 7.3 days (7d + buffer)
    case '1m':
      return 9000; // 31 days (1 month + buffer)
    case 'all':
      return 50000; // Fetch all available data (very large limit)
    default:
      return 300;
  }
};

export default function Home() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  const [useBloomDashboard, setUseBloomDashboard] = useState(true); // New Bloom UI by default
  const queryClient = useQueryClient();

  // Check onboarding state first (less frequently to reduce RPC load)
  const { data: onboardingData } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
    refetchInterval: 10000, // Check every 10 seconds during onboarding
  });

  const onboardingState = onboardingData?.state;
  const isOnboardingComplete = onboardingState?.completed || onboardingState?.skipped;

  // Reduce query frequency during onboarding to prevent RPC rate limiting
  const statusRefetchInterval = isOnboardingComplete ? 2500 : 10000; // 2.5s after onboarding, 10s during
  const pnlRefetchInterval = isOnboardingComplete ? 30000 : false; // Only fetch after onboarding
  const analyticsRefetchInterval = isOnboardingComplete ? 60000 : false; // Only fetch after onboarding

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: statusRefetchInterval,
  });

  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ['pnl'],
    queryFn: fetchPnL,
    refetchInterval: pnlRefetchInterval,
    enabled: isOnboardingComplete, // Only fetch after onboarding
  });

  // Calculate limit based on current time range
  const dataLimit = getDataLimitForTimeRange(timeRange);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', dataLimit],
    queryFn: () => fetchAnalytics(dataLimit),
    refetchInterval: analyticsRefetchInterval,
    enabled: isOnboardingComplete, // Only fetch after onboarding
  });

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  const claimMutation = useMutation({
    mutationFn: triggerClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
      queryClient.invalidateQueries({ queryKey: ['pnl'] });
      toast.success('Claim successful!', {
        description: 'Your rewards have been claimed.',
      });
    },
    onError: (error: any) => {
      toast.error('Claim failed', {
        description: error.message,
      });
    },
  });

  if (statusLoading || pnlLoading || analyticsLoading) {
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
  const solPriceUsd = pnl?.solPriceUsd || 0;
  const orbPriceUsd = status?.prices?.orbPriceUsd || 0;

  // Prepare chart data - only show data from baseline onwards
  const baseline = pnl?.truePnL?.startingBalance || 0;
  const now = new Date();

  // Get time cutoff based on selected range
  const getTimeCutoff = () => {
    switch (timeRange) {
      case '1d':
        return subDays(now, 1);
      case '7d':
        return subDays(now, 7);
      case '1m':
        return subMonths(now, 1);
      case 'all':
      default:
        return null;
    }
  };

  const timeCutoff = getTimeCutoff();

  const allChartData = (analytics?.balanceHistory || []).map((item: any) => ({
    time: format(new Date(item.timestamp), 'MMM dd HH:mm'),
    value: item.totalValue || 0,
    isProfit: (item.totalValue || 0) >= baseline,
    timestamp: new Date(item.timestamp),
  }));

  // Filter by time range only - show all data points including losses
  const chartData = allChartData.filter((item: any) => {
    // Filter by time range
    const isInTimeRange = timeCutoff === null || item.timestamp >= timeCutoff;

    return isInTimeRange;
  });

  // Calculate dynamic Y-axis range based on actual data
  const getYAxisDomain = () => {
    if (chartData.length === 0) return ['auto', 'auto'];

    const values = chartData.map((d: any) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;

    // Add 10% padding above and below for better visualization
    const padding = range * 0.1 || 0.001; // Minimum padding if range is 0

    return [
      minValue - padding, // Show full range including losses
      maxValue + padding
    ];
  };

  const miningEnabled = settingsData?.settings?.MINING_ENABLED?.value === 'true' || settingsData?.settings?.MINING_ENABLED?.value === true;
  const hasDeployed = (status?.miner?.totalDeployed || 0) > 0;

  // Onboarding display logic (state already defined above)
  const shouldShowSimplified = isOnboardingComplete && !onboardingState?.skipped && !showFullDashboard;

  // Get wallet address from status
  const walletAddress = status?.walletAddress || '';
  const currentBalance = (status?.balances?.sol || 0) + (status?.balances?.automationSol || 0);

  // Show loading while fetching initial data
  if (statusLoading || !status) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If onboarding is not complete, show onboarding flow
  if (!isOnboardingComplete) {
    return (
      <DashboardLayout>
        <OnboardingContainer
          walletAddress={walletAddress}
          currentBalance={currentBalance}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
          }}
        />
      </DashboardLayout>
    );
  }

  // If just completed onboarding (not skipped) and hasn't clicked "View Full Dashboard"
  if (shouldShowSimplified && !showFullDashboard) {
    return (
      <DashboardLayout>
        <SimplifiedDashboard
          netProfit={netPnL}
          roi={roi}
          currentBalance={currentBalance}
          motherlode={status?.round?.motherlode || 0}
          miningEnabled={miningEnabled}
          miningStatus={(status?.botStatus as 'mining' | 'waiting' | 'idle') || 'idle'}
          isAutomationActive={status?.automation?.isActive || false}
          chartData={chartData}
          onViewFullDashboard={() => setShowFullDashboard(true)}
        />
      </DashboardLayout>
    );
  }

  // Show Bloom Dashboard after user clicks "View Full Dashboard" or skipped onboarding
  return (
    <BloomDashboard
      onViewLegacy={() => setUseBloomDashboard(false)}
    />
  );
}
