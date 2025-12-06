'use client';

import { Zap, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'success' | 'pending' | 'failed' | 'reward';
  title: string;
  hash?: string;
  timestamp: Date;
  amount?: string;
}

interface LiveActivityFeedProps {
  activities?: ActivityItem[];
}

export function LiveActivityFeed({ activities }: LiveActivityFeedProps) {
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'success',
      title: 'Block mined successfully',
      hash: '0x7f2a...8e91',
      timestamp: new Date(Date.now() - 2000),
    },
    {
      id: '2',
      type: 'reward',
      title: '+0.0042 ORB earned',
      hash: '0x3c1b...4d72',
      timestamp: new Date(Date.now() - 5000),
    },
    {
      id: '3',
      type: 'pending',
      title: 'Transaction pending',
      hash: '0x9e5f...2a33',
      timestamp: new Date(Date.now() - 12000),
    },
    {
      id: '4',
      type: 'success',
      title: 'Block mined successfully',
      hash: '0x1d8c...7b45',
      timestamp: new Date(Date.now() - 18000),
    },
  ];

  const displayActivities = activities || defaultActivities;

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return <Zap className="w-4 h-4 text-primary" />;
      case 'reward':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="stat-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Activity
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-live-pulse" />
          <span className="text-[10px] text-green-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-card/50 transition-colors"
          >
            <div className="mt-0.5">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                {activity.hash && (
                  <span className="font-mono">{activity.hash}</span>
                )}
                <span>•</span>
                <span>
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
