'use client';

import { Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface HashRateChartProps {
  data: Array<{
    time: string;
    value: number;
  }>;
  title?: string;
}

export function HashRateChart({ data, title = 'HASHRATE (24H)' }: HashRateChartProps) {
  // Generate sample data if none provided
  const chartData = data.length > 0 ? data : generateSampleData();

  return (
    <div className="stat-card p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        <span className="text-xs text-muted-foreground/60">KH/s</span>
      </div>

      <div className="h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="hashGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              formatter={(value: any) => [`${Number(value).toFixed(1)} KH/s`, 'Hashrate']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#hashGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function generateSampleData() {
  const data = [];
  const hours = ['04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];

  for (let i = 0; i < hours.length; i++) {
    data.push({
      time: hours[i],
      value: 60 + Math.random() * 30,
    });
  }

  return data;
}
