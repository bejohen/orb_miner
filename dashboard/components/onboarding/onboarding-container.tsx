'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Step1Fund } from './step-1-fund';
import { Step2Strategy } from './step-2-strategy';
import { Step3Enable } from './step-3-enable';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingContainerProps {
  walletAddress: string;
  currentBalance: number;
  onComplete: () => void;
}

async function fetchOnboardingState() {
  const res = await fetch('/api/onboarding');
  if (!res.ok) throw new Error('Failed to fetch onboarding state');
  return res.json();
}

async function updateOnboardingState(updates: any) {
  const res = await fetch('/api/onboarding', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update onboarding state');
  return res.json();
}

async function updateSettings(key: string, value: any) {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export function OnboardingContainer({ walletAddress, currentBalance, onComplete }: OnboardingContainerProps) {
  const queryClient = useQueryClient();
  const MIN_BALANCE = 0.15; // 0.15 SOL minimum (90% = 0.135 SOL for automation)

  const { data: onboardingData } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingState,
    refetchInterval: 5000, // Check every 5 seconds
  });

  const updateStateMutation = useMutation({
    mutationFn: updateOnboardingState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  const state = onboardingData?.state;
  const currentStep = state?.current_step || 1;
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(state?.strategy_selected);

  // Auto-update wallet_funded status when balance changes
  useEffect(() => {
    if (currentBalance >= MIN_BALANCE && state && !state.wallet_funded) {
      updateStateMutation.mutate({ wallet_funded: true });
    }
  }, [currentBalance, state]);

  const handleSkip = async () => {
    try {
      await updateStateMutation.mutateAsync({
        completed: true,
        skipped: true,
      });
      toast.success('Onboarding skipped');
      onComplete();
    } catch (error: any) {
      toast.error('Failed to skip onboarding', { description: error.message });
    }
  };

  const handleStep1Next = async () => {
    try {
      await updateStateMutation.mutateAsync({
        current_step: 2,
        wallet_funded: true,
      });
    } catch (error: any) {
      toast.error('Failed to proceed', { description: error.message });
    }
  };

  const handleStep2Next = async (strategyKey: string) => {
    try {
      setSelectedStrategy(strategyKey);

      // Update deployment strategy in settings
      await updateSettings('DEPLOYMENT_AMOUNT_STRATEGY', strategyKey);

      await updateStateMutation.mutateAsync({
        current_step: 3,
        strategy_selected: strategyKey,
      });
    } catch (error: any) {
      toast.error('Failed to save strategy', { description: error.message });
    }
  };

  const handleStep2Back = async () => {
    try {
      await updateStateMutation.mutateAsync({
        current_step: 1,
      });
    } catch (error: any) {
      toast.error('Failed to go back', { description: error.message });
    }
  };

  const handleStep3Back = async () => {
    try {
      await updateStateMutation.mutateAsync({
        current_step: 2,
      });
    } catch (error: any) {
      toast.error('Failed to go back', { description: error.message });
    }
  };

  const handleStep3Finish = async () => {
    try {
      // Enable mining
      await updateSettings('MINING_ENABLED', 'true');

      // Mark onboarding as completed
      await updateStateMutation.mutateAsync({
        completed: true,
        mining_enabled: true,
      });

      toast.success('Mining started!', {
        description: 'Your bot is now running automatically',
      });

      onComplete();
    } catch (error: any) {
      toast.error('Failed to start mining', { description: error.message });
    }
  };

  return (
    <div className="relative">
      {/* Skip Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Skip Setup
        </Button>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <Step1Fund
          walletAddress={walletAddress}
          currentBalance={currentBalance}
          minBalance={MIN_BALANCE}
          onNext={handleStep1Next}
        />
      )}

      {currentStep === 2 && (
        <Step2Strategy
          currentBalance={currentBalance}
          onNext={handleStep2Next}
          onBack={handleStep2Back}
        />
      )}

      {currentStep === 3 && selectedStrategy && (
        <Step3Enable
          selectedStrategy={selectedStrategy}
          currentBalance={currentBalance}
          onFinish={handleStep3Finish}
          onBack={handleStep3Back}
        />
      )}
    </div>
  );
}
