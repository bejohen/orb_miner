'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Circle,
  Wallet,
  Settings,
  Zap,
  TrendingUp,
  ArrowRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
  linkText?: string;
  completed: boolean;
}

interface SetupChecklistProps {
  walletBalance: number;
  hasAutomation: boolean;
  miningEnabled: boolean;
  hasDeployed: boolean;
  onDismiss?: () => void;
}

export function SetupChecklist({
  walletBalance,
  hasAutomation,
  miningEnabled,
  hasDeployed,
  onDismiss,
}: SetupChecklistProps) {
  const [dismissed, setDismissed] = useState(false);

  const checklist: ChecklistItem[] = [
    {
      id: 'wallet',
      title: 'Fund Your Wallet',
      description: 'Add at least 1-5 SOL to your wallet for mining',
      icon: <Wallet className="h-4 w-4" />,
      link: '/settings',
      linkText: 'View Wallet',
      completed: walletBalance >= 1,
    },
    {
      id: 'strategy',
      title: 'Configure Strategy',
      description: 'Choose your deployment strategy and thresholds',
      icon: <Settings className="h-4 w-4" />,
      link: '/settings',
      linkText: 'Settings',
      completed: hasAutomation,
    },
    {
      id: 'mining',
      title: 'Enable Mining',
      description: 'Turn on mining to start deploying automatically',
      icon: <Zap className="h-4 w-4" />,
      link: '/settings',
      linkText: 'Enable Now',
      completed: miningEnabled,
    },
    {
      id: 'deployed',
      title: 'First Deployment',
      description: 'Wait for your first successful deployment',
      icon: <TrendingUp className="h-4 w-4" />,
      link: '/transactions',
      linkText: 'View Activity',
      completed: hasDeployed,
    },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;
  const isFullyComplete = completedCount === checklist.length;

  if (dismissed || isFullyComplete) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Setup Checklist
            <Badge variant="outline" className="ml-2">
              {completedCount} / {checklist.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
              item.completed
                ? 'bg-green-950/20 border border-green-800/30'
                : 'bg-muted/30 border border-border/50'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {item.icon}
                <p
                  className={`text-sm font-medium ${
                    item.completed ? 'text-green-500' : 'text-foreground'
                  }`}
                >
                  {item.title}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              {!item.completed && item.link && (
                <Link href={item.link}>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    {item.linkText}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}

        {completedCount > 0 && !isFullyComplete && (
          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground">
              🎉 Great progress! Complete remaining steps to start mining.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
