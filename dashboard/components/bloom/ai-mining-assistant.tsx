'use client';

import { Bot, TrendingUp, Lightbulb, Trophy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Tip {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AIMiningAssistantProps {
  tips?: Tip[];
}

export function AIMiningAssistant({ tips }: AIMiningAssistantProps) {
  const [message, setMessage] = useState('');

  const defaultTips: Tip[] = [
    {
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      title: 'Optimal Mining Time',
      description: 'Network difficulty dropping in ~2 hours. Best time to mine for higher rewards.',
      actionLabel: 'Set Reminder',
    },
    {
      icon: <Lightbulb className="w-4 h-4 text-yellow-400" />,
      title: 'Strategy Tip',
      description: 'Your hashrate peaks between 2-4 PM. Consider scheduling sessions then.',
      actionLabel: 'View Details',
    },
    {
      icon: <Trophy className="w-4 h-4 text-purple-400" />,
      title: 'Reward Boost',
      description: 'Complete 5 more blocks today to unlock +10% bonus multiplier.',
      actionLabel: 'Track Progress',
    },
  ];

  const displayTips = tips || defaultTips;

  return (
    <div className="stat-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI Mining Assistant
        </span>
      </div>

      {/* Tips */}
      <div className="flex-1 space-y-3">
        {displayTips.map((tip, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{tip.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">
                  {tip.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
                {tip.actionLabel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
                    onClick={tip.onAction}
                  >
                    {tip.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ask AI Input */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Ask AI for mining tips..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 h-9 text-sm bg-card/50 border-border/30"
          />
        </div>
      </div>
    </div>
  );
}
