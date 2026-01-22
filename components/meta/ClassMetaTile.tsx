'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartGuard } from '@/components/ChartGuard';
import { type ArchetypeStats } from './types';

interface ClassMetaTileProps {
  className: string;
  accentColor: string;
  glowColor: string;
  data: ArchetypeStats[];
  onSelect?: (className: string, data: ArchetypeStats[]) => void;
}

interface ChartSlice extends ArchetypeStats {
  color: string;
  value: number;
  [key: string]: unknown; // Index signature for recharts compatibility
}

function lighten(color: string, amount: number) {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const num = Number.parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

interface RenderTooltipProps {
  active?: boolean;
  payload?: { payload: ChartSlice }[];
}

function renderTooltip({ active, payload }: RenderTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload;

  const trendSymbol = datum.trend === 'up' ? '▲' : datum.trend === 'down' ? '▼' : '→';
  const trendColor = datum.trend === 'up' ? '#4ade80' : datum.trend === 'down' ? '#f87171' : '#fde68a';

  return (
    <div className="rounded-xl border border-white/10 bg-black/80 px-4 py-3 text-xs text-white/80 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">{datum.archetype}</div>
      <div className="mt-1 flex items-center gap-2 text-white/60">
        <span className="tabular-nums">Popularity {datum.popularityPct.toFixed(1)}%</span>
        <span className="tabular-nums">Win Rate {datum.winRatePct.toFixed(1)}%</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-white/70">
        <span className="uppercase tracking-[0.2em] text-white/40">Trend</span>
        <span style={{ color: trendColor }}>{trendSymbol}</span>
      </div>
    </div>
  );
}

export default function ClassMetaTile({ className, accentColor, glowColor, data, onSelect }: ClassMetaTileProps) {
  const chartData = useMemo<ChartSlice[]>(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.popularityPct - a.popularityPct);
    const totalShare = sorted.reduce((sum, item) => sum + item.popularityPct, 0);
    return sorted.map((item, index) => ({
      ...item,
      value: totalShare > 0 ? (item.popularityPct / totalShare) * 100 : 0,
      color: lighten(accentColor, 40 - index * 8),
    }));
  }, [data, accentColor]);

  const totalPopularity = chartData.reduce((sum, item) => sum + item.popularityPct, 0);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(className, data)}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_45px_-35px_rgba(93,214,211,0.55)]"
      style={{ boxShadow: `inset 0 0 18px -12px ${glowColor}` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Class</p>
          <h3 className="mt-1 font-display text-xl text-white">{className}</h3>
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
          {totalPopularity.toFixed(1)}% share
        </div>
      </div>
      <div className="chart-wrapper h-[200px] w-full">
        <ChartGuard minHeight={200}>
          <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="archetype"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.archetype} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                </PieChart>
              </ResponsiveContainer>
        </ChartGuard>
      </div>
      <div className="space-y-2 text-xs text-white/60">
        {chartData.slice(0, 3).map((archetype) => (
          <div key={archetype.archetype} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: archetype.color }} />
              {archetype.archetype}
            </span>
            <span className="tabular-nums text-white/70">{archetype.popularityPct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">
        Hover for archetype breakdown · Click to expand
      </div>
    </button>
  );
}

