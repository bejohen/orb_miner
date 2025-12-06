'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <Zap className="h-12 w-12 animate-pulse text-primary mx-auto" />
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

  // Show Bloom Dashboard after onboarding is complete
  return <BloomDashboard />;
}
