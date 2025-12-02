'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Menu } from 'lucide-react';
import { DryRunBanner } from '@/components/dry-run-banner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

async function fetchSettings() {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

async function updateSetting(key: string, value: any) {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const disableDryRunMutation = useMutation({
    mutationFn: () => updateSetting('DRY_RUN', false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Dry Run mode disabled', {
        description: 'Bot will now send real transactions to the blockchain',
      });
    },
    onError: () => {
      toast.error('Failed to disable Dry Run mode');
    },
  });

  const isDryRunEnabled = settingsData?.settings?.DRY_RUN?.value === true ||
                          settingsData?.settings?.DRY_RUN?.value === 'true';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto">
        {/* Dry Run Banner */}
        {isDryRunEnabled && (
          <DryRunBanner onDisable={() => disableDryRunMutation.mutate()} />
        )}

        {/* Mobile Menu Button */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary neon-text">ORB Miner</span>
          </div>
        </div>
        <div className="container mx-auto p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
