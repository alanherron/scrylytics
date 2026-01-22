'use client';

import { useState, useEffect } from 'react';
import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CLASS_COLOR_MAP } from '@/data/meta/topdecks';

export interface MetaDrillDownChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  height?: number;
}

export default function MetaDrillDownChart({ data, height = 600 }: MetaDrillDownChartProps) {
  // 🛑 Prevent Recharts from mounting before hydration (fixes width(-1) warning)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  // Debug log (safe to remove)
  // eslint-disable-next-line no-console
  console.log('MetaDrillDownChart Debug:', {
    dataLength: data.length,
    chartDataLength: data.length,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    firstItem: data[0],
    height,
  });

  // Handle empty dataset
  if (data.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center text-white/60">
        No data available
      </div>
    );
  }

  // Example mapping; adapt to your own schema
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  const chartData = data.map((d: any) => ({
    name: d.class,
    value: d.popularityPct,
    fill: CLASS_COLOR_MAP[d.class as string] ?? '#4aa3ff',
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

  return (
    <div style={{ width: '100%', height }}>
      {/* ✅ Fixed-size wrapper ensures ResponsiveContainer can measure */}
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={chartData}
          dataKey="value"
          stroke="#ffffff"
          animationDuration={300}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          {chartData.map((entry, i) => (
            <Cell key={`cell-${String(i)}`} fill={entry.fill} />
          ))}
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
