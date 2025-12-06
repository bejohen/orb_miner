'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NetworkStatsTicker } from './network-stats-ticker';

async function fetchStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

const navItems = [
  { href: '/', label: 'HOME' },
  { href: '/dashboard', label: 'OVERVIEW' },
  { href: '/profitability', label: 'PROFITABILITY' },
  { href: '/performance', label: 'PERFORMANCE' },
  { href: '/history', label: 'HISTORY' },
  { href: '/transactions', label: 'TRANSACTIONS' },
  { href: '/analytics', label: 'ANALYTICS' },
  { href: '/settings', label: 'SETTINGS' },
];

export function BloomHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 5000,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo & Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">O</span>
            </div>
            <div>
              <span className="font-bold text-foreground">ORB MINER</span>
              <span className="text-xs text-muted-foreground ml-2">v1.8.0 • SOLANA</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-md transition-colors",
                  pathname === item.href
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            Connect
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/30 bg-card/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm px-3 py-2 rounded-md transition-colors",
                  pathname === item.href
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Network Stats Ticker */}
      <NetworkStatsTicker
        orbPriceSol={status?.prices?.orbPriceSol || 0.00847}
        orbPriceChange={2.4}
        networkHash="142.8 TH/s"
        networkHashChange={-0.8}
        activeMiners={status?.round?.uniqueMiners || 12847}
        activeMinerChange={156}
        blockHeight={status?.round?.id || 8291042}
        difficulty="4.28T"
        difficultyChange={0.2}
      />
    </header>
  );
}
