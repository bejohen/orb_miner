'use client';

import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroSectionProps {
  networkStatus: 'optimal' | 'moderate' | 'congested';
  onMineClick: () => void;
  isMining: boolean;
}

export function HeroSection({
  networkStatus = 'optimal',
  onMineClick,
  isMining = false,
}: HeroSectionProps) {
  const statusColors = {
    optimal: 'bg-green-500',
    moderate: 'bg-yellow-500',
    congested: 'bg-red-500',
  };

  return (
    <div className="relative text-center py-12 px-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      {/* Network Status Badge */}
      <div className="relative z-10 flex justify-center mb-6">
        <Badge variant="outline" className="px-4 py-1.5 text-xs uppercase tracking-wider border-border/50 bg-card/50">
          <span className={`w-2 h-2 rounded-full ${statusColors[networkStatus]} mr-2 animate-live-pulse`} />
          Network Status: {networkStatus}
        </Badge>
      </div>

      {/* Main Headline */}
      <h1 className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-black mb-4">
        <span className="orb-gradient-text">One-Click Mining</span>
        <br />
        <span className="text-foreground">for Everyone</span>
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-muted-foreground max-w-md mx-auto mb-8 text-sm md:text-base">
        The simplest way to mine ORB on Solana. AI-powered insights.
        Real-time analytics. Zero complexity.
      </p>

      {/* CTA Button */}
      <Button
        onClick={onMineClick}
        disabled={isMining}
        size="lg"
        className="relative z-10 orb-button text-primary-foreground font-bold text-lg px-12 py-6 rounded-full"
      >
        <Zap className="w-5 h-5 mr-2" />
        {isMining ? 'Mining...' : 'MINE ORB'}
      </Button>
    </div>
  );
}
