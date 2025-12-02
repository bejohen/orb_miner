'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function InfoTooltip({ content, title, side = 'top' }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-accent transition-colors">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Pre-defined tooltips for common metrics
export const TOOLTIPS = {
  motherload: {
    title: 'Motherload',
    content: 'The global prize pool of ORB tokens. Winners share this pool based on their deployment. Higher motherload = more profitable mining.',
  },
  miningPremium: {
    title: 'Mining Premium/Discount',
    content: 'Compares cost of mining ORB vs buying it. Negative = discount (cheaper to mine). Positive = premium (cheaper to buy).',
  },
  expectedValue: {
    title: 'Expected Value (EV)',
    content: 'Estimated profit per round based on current competition and ORB price. Bot only mines when EV > 0.',
  },
  productionCost: {
    title: 'Production Cost',
    content: 'How much it costs to produce 1 ORB through mining, considering your deployment and competition.',
  },
  roi: {
    title: 'Return on Investment',
    content: 'Your total profit percentage. Calculated as: (Current Value - Starting Value) / Starting Value × 100%',
  },
  competition: {
    title: 'Competition',
    content: 'Total number of unique miners deploying this round. Lower competition = better odds and profitability.',
  },
  automation: {
    title: 'Automation Account',
    content: 'A program-controlled wallet that holds your mining budget and deploys automatically each round.',
  },
  strategy: {
    title: 'Deployment Strategy',
    content: 'Determines how much SOL to deploy per round based on motherload size. Choose based on your risk tolerance.',
  },
  threshold: {
    title: 'Motherload Threshold',
    content: 'Minimum motherload required to start mining. Default: 150 ORB. Lower = mine more often. Higher = only mine when very profitable.',
  },
  claimThreshold: {
    title: 'Auto-Claim Threshold',
    content: 'Bot automatically claims rewards when they exceed this amount. Set higher to reduce transaction fees.',
  },
  swapThreshold: {
    title: 'Auto-Swap Threshold',
    content: 'Bot automatically swaps ORB to SOL when wallet ORB exceeds this amount. Helps compound your mining budget.',
  },
  priorityFee: {
    title: 'Priority Fee',
    content: 'Extra fee paid to validators for faster transaction processing. Higher = faster confirmation but more expensive.',
  },
  winRate: {
    title: 'Win Rate',
    content: 'Percentage of rounds you\'ve won. Expected: ~4% (1 in 25 squares). Variance is normal over short periods.',
  },
  sharpe: {
    title: 'Sharpe Ratio',
    content: 'Risk-adjusted return metric. Higher is better. Above 2.0 is excellent. Measures return per unit of risk taken.',
  },
  inFlight: {
    title: 'In-Flight Deployments',
    content: 'Deployments that haven\'t been claimed yet. Rewards typically available 1-2 rounds after deployment.',
  },
};
