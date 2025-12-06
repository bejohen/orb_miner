'use client';

import { BloomHeader } from './bloom-header';

interface BloomLayoutProps {
  children: React.ReactNode;
}

export function BloomLayout({ children }: BloomLayoutProps) {
  return (
    <div className="min-h-screen orb-background">
      <BloomHeader />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
