'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DryRunBannerProps {
  onDisable?: () => void;
}

export function DryRunBanner({ onDisable }: DryRunBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-yellow-600 dark:bg-yellow-700 text-white px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">DRY RUN MODE ACTIVE</p>
            <p className="text-sm text-yellow-100">
              Bot is simulating transactions without sending them to the blockchain.
              No real mining is happening.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onDisable && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDisable}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              Disable Dry Run
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
