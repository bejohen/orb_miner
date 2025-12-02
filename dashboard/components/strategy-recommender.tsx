'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface Strategy {
  name: string;
  key: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  roi: string;
  sharpe: string;
  description: string;
  bestFor: string;
  minBudget: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const strategies: Strategy[] = [
  {
    name: 'Ultra Conservative',
    key: 'ultra_conservative',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    roi: '+1,554%',
    sharpe: '7.2',
    description: 'Safest strategy with highest Sharpe ratio. Deploys small amounts over many rounds.',
    bestFor: 'New users, risk-averse miners, small budgets',
    minBudget: 1,
    riskLevel: 'Low',
  },
  {
    name: 'Balanced',
    key: 'balanced',
    icon: <Target className="h-5 w-5" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    roi: '+1,130%',
    sharpe: '6.3',
    description: 'Perfect balance of risk and reward. Recommended for most users.',
    bestFor: 'Most users, moderate risk tolerance',
    minBudget: 2,
    riskLevel: 'Medium',
  },
  {
    name: 'Aggressive',
    key: 'aggressive',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    roi: '+683%',
    sharpe: '4.9',
    description: 'Higher deployments for faster returns. Requires larger budget.',
    bestFor: 'Experienced miners, higher risk tolerance',
    minBudget: 5,
    riskLevel: 'High',
  },
  {
    name: 'Kelly Optimized',
    key: 'kelly_optimized',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    roi: '+904%',
    sharpe: '5.6',
    description: 'Kelly Criterion-based optimal bet sizing. Mathematical approach.',
    bestFor: 'Advanced users, mathematical optimization',
    minBudget: 3,
    riskLevel: 'Medium',
  },
];

interface StrategyRecommenderProps {
  currentBalance: number;
  onSelectStrategy?: (strategyKey: string) => void;
}

export function StrategyRecommender({
  currentBalance,
  onSelectStrategy,
}: StrategyRecommenderProps) {
  // Recommend strategy based on balance
  const getRecommendedStrategy = () => {
    if (currentBalance < 2) {
      return strategies[0]; // Ultra Conservative
    } else if (currentBalance < 5) {
      return strategies[1]; // Balanced
    } else if (currentBalance < 10) {
      return strategies[3]; // Kelly Optimized
    } else {
      return strategies[2]; // Aggressive
    }
  };

  const recommended = getRecommendedStrategy();

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Strategy Recommendation
          <Badge variant="outline" className="ml-auto bg-muted text-foreground border-border">
            Based on {currentBalance.toFixed(2)} SOL
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommended Strategy - Highlighted */}
        <div
          className={`p-4 rounded-lg border-2 ${recommended.bgColor} ${recommended.borderColor}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={recommended.color}>{recommended.icon}</div>
              <div>
                <p className={`font-semibold ${recommended.color}`}>
                  {recommended.name}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  Recommended for You
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-500">{recommended.roi}</p>
              <p className="text-xs text-muted-foreground">Avg ROI</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {recommended.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>Risk: {recommended.riskLevel}</span>
            <span>Sharpe: {recommended.sharpe}</span>
            <span>Min: {recommended.minBudget} SOL</span>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            <strong>Best for:</strong> {recommended.bestFor}
          </p>

          <Link href="/settings">
            <Button className="w-full" size="sm">
              Select This Strategy
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Other Strategies - Compact */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Other Options:</p>
          {strategies
            .filter((s) => s.key !== recommended.key)
            .map((strategy) => (
              <div
                key={strategy.key}
                className={`p-3 rounded-lg border ${strategy.bgColor} ${strategy.borderColor} hover:border-primary/50 transition-colors cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={strategy.color}>{strategy.icon}</div>
                    <div>
                      <p className={`text-sm font-medium ${strategy.color}`}>
                        {strategy.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {strategy.roi} ROI • Sharpe {strategy.sharpe}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      strategy.riskLevel === 'Low'
                        ? 'bg-green-500/20 text-green-500 border-green-500/50'
                        : strategy.riskLevel === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                        : 'bg-red-500/20 text-red-500 border-red-500/50'
                    }`}
                  >
                    {strategy.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            ))}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-center text-muted-foreground">
            💡 All ROI numbers based on 10,000-simulation Monte Carlo analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
