'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { OnboardingContainer } from '@/components/onboarding/onboarding-container';
import { BloomDashboard } from '@/components/bloom/bloom-dashboard';

async function fetchStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

async function fetchOnboardingState() {
  const res = await fetch('/api/onboarding');
  if (!res.ok) throw new Error('Failed to fetch onboarding state');
  return res.json();
}

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Check onboarding state first
  const { data: onboardingData } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
    refetchInterval: 10000,
  });

  const onboardingState = onboardingData?.state;
  const isOnboardingComplete = onboardingState?.completed || onboardingState?.skipped;

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: isOnboardingComplete ? 2500 : 10000,
  });

  // Get wallet address from status
  const walletAddress = status?.walletAddress || '';
  const currentBalance = (status?.balances?.sol || 0) + (status?.balances?.automationSol || 0);

  // Show loading while fetching initial data
  if (statusLoading || !status) {
    return (
      <div className="min-h-screen orb-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Zap className="h-12 w-12 animate-pulse text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If onboarding is not complete, show onboarding flow with Bloom layout
  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen orb-background">
        <div className="container mx-auto px-4 py-8">
          <OnboardingContainer
            walletAddress={walletAddress}
            currentBalance={currentBalance}
            onComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            }}
          />
        </div>
      </div>
    );
  }

  // Show Bloom Dashboard after onboarding is complete
  return <BloomDashboard />;
}
