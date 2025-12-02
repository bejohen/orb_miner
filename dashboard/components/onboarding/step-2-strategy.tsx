'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, Shield, Zap, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Strategy {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  roi: string;
  sharpe: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const strategies: Strategy[] = [
  {
    key: 'ultra_conservative',
    name: 'Ultra Conservative',
    icon: <Shield className="h-6 w-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/20',
    borderColor: 'border-blue-800/30',
    roi: '+1,554%',
    sharpe: '7.2',
    description: 'Safest option with small deployments. Best for beginners and small budgets.',
    riskLevel: 'Low',
  },
  {
    key: 'balanced',
    name: 'Balanced',
    icon: <Target className="h-6 w-6" />,
    color: 'text-green-400',
    bgColor: 'bg-green-950/20',
    borderColor: 'border-green-800/30',
    roi: '+1,130%',
    sharpe: '6.3',
    description: 'Perfect balance of risk and reward. Recommended for most users.',
    riskLevel: 'Medium',
  },
  {
    key: 'aggressive',
    name: 'Aggressive',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950/20',
    borderColor: 'border-yellow-800/30',
    roi: '+683%',
    sharpe: '4.9',
    description: 'Higher deployments for faster returns. Requires larger budget.',
    riskLevel: 'High',
  },
  {
    key: 'kelly_optimized',
    name: 'Kelly Optimized',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/20',
    borderColor: 'border-purple-800/30',
    roi: '+904%',
    sharpe: '5.6',
    description: 'Mathematical approach using Kelly Criterion. For advanced users.',
    riskLevel: 'Medium',
  },
];

interface Step2StrategyProps {
  currentBalance: number;
  onNext: (strategyKey: string) => void;
  onBack: () => void;
}

export function Step2Strategy({ currentBalance, onNext, onBack }: Step2StrategyProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Recommend strategy based on balance
  const getRecommendedKey = (): string => {
    if (currentBalance < 2) return 'ultra_conservative';
    if (currentBalance < 5) return 'balanced';
    if (currentBalance < 10) return 'kelly_optimized';
    return 'aggressive';
  };

  const recommendedKey = getRecommendedKey();

  const handleSelect = (strategyKey: string) => {
    setSelectedStrategy(strategyKey);
  };

  const handleContinue = () => {
    if (selectedStrategy) {
      onNext(selectedStrategy);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[600px] py-8">
      <Card className="border-border/50 bg-card max-w-4xl w-full">
        <CardHeader className="space-y-4">
          <div className="text-center">
            <CardTitle className="text-3xl mb-2">Choose Your Strategy</CardTitle>
            <p className="text-muted-foreground">
              Select a mining strategy that matches your risk tolerance
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Step 2 of 3: Choose Strategy</span>
              <span className="text-muted-foreground">66%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-2/3 transition-all duration-300" />
            </div>
          </div>

          {/* Balance Info */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Wallet Funded:</span>
              </div>
              <Badge variant="outline" className="bg-green-950/20 text-green-400 border-green-800/30">
                {currentBalance.toFixed(2)} SOL
              </Badge>
            </div>
          </div>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy) => {
              const isRecommended = strategy.key === recommendedKey;
              const isSelected = strategy.key === selectedStrategy;

              return (
                <div
                  key={strategy.key}
                  onClick={() => handleSelect(strategy.key)}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}
                    ${strategy.bgColor}
                  `}
                >
                  {isRecommended && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                      Recommended
                    </Badge>
                  )}
                  {isSelected && (
                    <CheckCircle className="absolute top-4 right-4 h-6 w-6 text-primary" />
                  )}

                  <div className="flex items-start gap-3 mb-3">
                    <div className={strategy.color}>
                      {strategy.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${strategy.color}`}>
                        {strategy.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          ROI: {strategy.roi}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Sharpe: {strategy.sharpe}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {strategy.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        strategy.riskLevel === 'Low'
                          ? 'bg-green-950/20 text-green-400 border-green-800/30'
                          : strategy.riskLevel === 'Medium'
                          ? 'bg-yellow-950/20 text-yellow-400 border-yellow-800/30'
                          : 'bg-red-950/20 text-red-400 border-red-800/30'
                      }`}
                    >
                      {strategy.riskLevel} Risk
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>💡 Tip:</strong> All ROI numbers are based on 10,000-simulation Monte Carlo analysis.
              You can change your strategy later in Settings.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedStrategy}
              className="flex-1"
              size="lg"
            >
              {selectedStrategy ? (
                <>
                  Continue to Step 3
                  <CheckCircle className="h-5 w-5 ml-2" />
                </>
              ) : (
                'Select a strategy'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
