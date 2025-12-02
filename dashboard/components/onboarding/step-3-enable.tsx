'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Step3EnableProps {
  selectedStrategy: string;
  currentBalance: number;
  onFinish: () => void;
  onBack: () => void;
}

const strategyNames: Record<string, string> = {
  ultra_conservative: 'Ultra Conservative',
  balanced: 'Balanced',
  aggressive: 'Aggressive',
  kelly_optimized: 'Kelly Optimized',
};

export function Step3Enable({ selectedStrategy, currentBalance, onFinish, onBack }: Step3EnableProps) {
  const [isEnabling, setIsEnabling] = useState(false);

  const handleStartMining = async () => {
    setIsEnabling(true);
    // Trigger akan dilakukan di parent component
    // Simulasi delay untuk UX
    setTimeout(() => {
      onFinish();
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <Card className="border-border/50 bg-card max-w-2xl w-full">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <Rocket className="h-16 w-16 text-primary" />
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl mb-2">Ready to Start Mining!</CardTitle>
            <p className="text-muted-foreground">
              Everything is set up. Let's start earning ORB tokens automatically
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Step 3 of 3: Start Mining</span>
              <span className="text-muted-foreground">100%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-full transition-all duration-300" />
            </div>
          </div>

          {/* Setup Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Your Setup:</h3>

            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Wallet Balance:</span>
                </div>
                <Badge variant="outline" className="bg-green-950/20 text-green-400 border-green-800/30">
                  {currentBalance.toFixed(2)} SOL
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Strategy:</span>
                </div>
                <Badge variant="outline" className="bg-blue-950/20 text-blue-400 border-blue-800/30">
                  {strategyNames[selectedStrategy] || selectedStrategy}
                </Badge>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              The bot will automatically:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/30 border border-border/50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Monitor Profitability</p>
                  <p className="text-xs text-muted-foreground">
                    Only deploy to rounds when expected value (EV) is positive
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 border border-border/50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Deploy to All 25 Squares</p>
                  <p className="text-xs text-muted-foreground">
                    Maximize winning chances by deploying to every square
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 border border-border/50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Claim Rewards Automatically</p>
                  <p className="text-xs text-muted-foreground">
                    Auto-claim SOL and ORB when thresholds are met
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 border border-border/50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Swap ORB to SOL</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically convert ORB to SOL for compounding growth
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-green-950/20 border border-green-800/30 rounded-lg p-4">
            <p className="text-sm text-green-400">
              <strong>✨ You're all set!</strong> The mining bot runs 24/7 automatically.
              Check back anytime to see your profits growing.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1"
              size="lg"
              disabled={isEnabling}
            >
              Back
            </Button>
            <Button
              onClick={handleStartMining}
              disabled={isEnabling}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isEnabling ? (
                <>
                  Starting...
                  <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                </>
              ) : (
                <>
                  Start Mining Now!
                  <Rocket className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
