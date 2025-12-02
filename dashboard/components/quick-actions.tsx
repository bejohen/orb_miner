'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  RefreshCw,
  Pause,
  Play,
  Settings,
  DollarSign,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface QuickActionsProps {
  miningEnabled: boolean;
  claimableSol: number;
  claimableOrb: number;
  walletOrb: number;
  autoSwapThreshold: number;
}

async function triggerClaim() {
  const res = await fetch('/api/claim', { method: 'POST' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to trigger claim');
  }
  return res.json();
}

async function triggerSwap() {
  const res = await fetch('/api/swap', { method: 'POST' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to trigger swap');
  }
  return res.json();
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

export function QuickActions({
  miningEnabled,
  claimableSol,
  claimableOrb,
  walletOrb,
  autoSwapThreshold,
}: QuickActionsProps) {
  const queryClient = useQueryClient();

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

  const swapMutation = useMutation({
    mutationFn: triggerSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
      toast.success('Swap successful!', {
        description: 'ORB has been swapped to SOL.',
      });
    },
    onError: (error: any) => {
      toast.error('Swap failed', {
        description: error.message,
      });
    },
  });

  const toggleMiningMutation = useMutation({
    mutationFn: toggleMining,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['status'] });
      const enabled = data.value;
      toast.success(enabled ? 'Mining enabled' : 'Mining paused', {
        description: enabled
          ? 'Bot will mine on next round'
          : 'Mining paused - claims still active',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to toggle mining', {
        description: error.message,
      });
    },
  });

  const hasClaimableRewards = claimableSol > 0.01 || claimableOrb > 0.1;
  const shouldSwap = walletOrb >= autoSwapThreshold;

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mining Control */}
        <div className="grid grid-cols-2 gap-2">
          {miningEnabled ? (
            <Button
              variant="outline"
              onClick={() => toggleMiningMutation.mutate(false)}
              disabled={toggleMiningMutation.isPending}
              className="w-full border-yellow-500/50 hover:bg-yellow-500/10"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause Mining
            </Button>
          ) : (
            <Button
              onClick={() => toggleMiningMutation.mutate(true)}
              disabled={toggleMiningMutation.isPending}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Mining
            </Button>
          )}

          <Button variant="outline" asChild>
            <a href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </a>
          </Button>
        </div>

        {/* Claim Rewards */}
        <Button
          variant="outline"
          onClick={() => claimMutation.mutate()}
          disabled={claimMutation.isPending || !hasClaimableRewards}
          className={`w-full ${
            hasClaimableRewards
              ? 'border-green-500/50 hover:bg-green-500/10'
              : ''
          }`}
        >
          <Download className="h-4 w-4 mr-2" />
          {claimMutation.isPending ? 'Claiming...' : 'Claim Rewards'}
          {hasClaimableRewards && (
            <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-500 border-green-500/50">
              {claimableSol.toFixed(2)} SOL
            </Badge>
          )}
        </Button>

        {/* Swap ORB to SOL */}
        <Button
          variant="outline"
          onClick={() => swapMutation.mutate()}
          disabled={swapMutation.isPending || !shouldSwap}
          className={`w-full ${
            shouldSwap
              ? 'border-purple-500/50 hover:bg-purple-500/10'
              : ''
          }`}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {swapMutation.isPending ? 'Swapping...' : 'Swap ORB → SOL'}
          {shouldSwap && (
            <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-500 border-purple-500/50">
              {walletOrb.toFixed(2)} ORB
            </Badge>
          )}
        </Button>

        {/* View Profitability */}
        <Button variant="outline" asChild className="w-full">
          <a href="/profitability">
            <DollarSign className="h-4 w-4 mr-2" />
            Check Profitability
          </a>
        </Button>

        {/* Status Info */}
        <div className="pt-2 border-t space-y-2">
          {!miningEnabled && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-500">
                Mining is paused. Click "Start Mining" to resume.
              </p>
            </div>
          )}
          {!hasClaimableRewards && (
            <p className="text-xs text-center text-muted-foreground">
              No rewards available to claim yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
