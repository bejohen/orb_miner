'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Copy, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Step1FundProps {
  walletAddress: string;
  currentBalance: number;
  minBalance: number;
  onNext: () => void;
}

export function Step1Fund({ walletAddress, currentBalance, minBalance, onNext }: Step1FundProps) {
  const [copied, setCopied] = useState(false);
  const isFunded = currentBalance >= minBalance;

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success('Wallet address copied!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or SSR
        const textArea = document.createElement('textarea');
        textArea.value = walletAddress;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success('Wallet address copied!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy wallet address');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <Card className="border-border/50 bg-card max-w-2xl w-full">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <Wallet className="h-16 w-16 text-primary" />
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl mb-2">Welcome to ORB Miner!</CardTitle>
            <p className="text-muted-foreground">
              Let's get you started with automated mining in just 3 simple steps
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Step 1 of 3: Fund Your Wallet</span>
              <span className="text-muted-foreground">33%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/3 transition-all duration-300" />
            </div>
          </div>

          {/* Balance Status */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-3xl font-bold">
                  {currentBalance.toFixed(4)} <span className="text-xl text-muted-foreground">SOL</span>
                </p>
              </div>
              {isFunded ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500/50" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Required:</span>
              <Badge variant="outline" className={isFunded ? "bg-green-950/20 text-green-400 border-green-800/30" : "bg-yellow-950/20 text-yellow-400 border-yellow-800/30"}>
                {minBalance.toFixed(1)} SOL minimum
              </Badge>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How to fund your wallet:</h3>
            <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
              <li>Copy your wallet address below</li>
              <li>Send at least {minBalance} SOL from your exchange or another wallet</li>
              <li>Wait for the transaction to confirm (usually 1-2 minutes)</li>
              <li>This page will auto-detect your balance</li>
            </ol>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Wallet Address:</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted/50 border border-border rounded-lg p-3 font-mono text-sm break-all">
                {walletAddress}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Auto-refresh indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking balance every 5 seconds...</span>
          </div>

          {/* Next Button */}
          <div className="pt-4">
            <Button
              onClick={onNext}
              disabled={!isFunded}
              className="w-full"
              size="lg"
            >
              {isFunded ? (
                <>
                  Continue to Step 2
                  <CheckCircle className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Waiting for funds...
                  <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>💡 Tip:</strong> Make sure to send SOL to the <strong>Solana network</strong>, not another blockchain.
              Minimum {minBalance} SOL is required to cover mining costs and transaction fees.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
