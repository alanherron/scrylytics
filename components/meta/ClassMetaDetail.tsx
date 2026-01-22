'use client';

import { useMemo, useEffect, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { X } from 'lucide-react';
import { ChartGuard } from '@/components/ChartGuard';
import { type ArchetypeStats } from './types';

interface ClassMetaDetailProps {
  open: boolean;
  onClose: () => void;
  className: string;
  accentColor: string;
  glowColor: string;
  data: ArchetypeStats[];
}

interface BubbleDatum extends ArchetypeStats {
  sampleSize: number;
  color: string;
}

function computeSampleSize(popularityPct: number) {
  return Math.max(25, Math.round(popularityPct * 40));
}

function lighten(color: string, intensity: number) {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const num = Number.parseInt(hex, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * intensity);
  return `#${(mix(r) << 16 | mix(g) << 8 | mix(b)).toString(16).padStart(6, '0')}`;
}

interface DetailTooltipProps {
  active?: boolean;
  payload?: { payload: BubbleDatum }[];
}

function DetailTooltip({ active, payload }: DetailTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload;
  if (!datum) return null;
  const trendSymbol = datum.trend === 'up' ? '▲' : datum.trend === 'down' ? '▼' : '→';
  const trendColor = datum.trend === 'up' ? '#4ade80' : datum.trend === 'down' ? '#f87171' : '#fde68a';

  return (
    <div className="rounded-xl border border-white/10 bg-black/85 px-5 py-4 text-sm text-white/80 shadow-2xl backdrop-blur">
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">{datum.class}</div>
      <div className="text-lg font-semibold text-white">{datum.archetype}</div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-white/60">
        <span className="flex flex-col">
          <span className="uppercase tracking-[0.3em] text-white/30">Popularity</span>
          <span className="mt-1 text-white/80">{datum.popularityPct.toFixed(1)}%</span>
        </span>
        <span className="flex flex-col">
          <span className="uppercase tracking-[0.3em] text-white/30">Win Rate</span>
          <span className="mt-1 text-white/80">{datum.winRatePct.toFixed(1)}%</span>
        </span>
        <span className="flex flex-col">
          <span className="uppercase tracking-[0.3em] text-white/30">Sample Size</span>
          <span className="mt-1 text-white/80">{datum.sampleSize}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="uppercase tracking-[0.3em] text-white/30">Trend</span>
          <span style={{ color: trendColor }}>{trendSymbol}</span>
        </span>
      </div>
    </div>
  );
}

export default function ClassMetaDetail({
  open,
  onClose,
  className,
  accentColor,
  glowColor,
  data,
}: ClassMetaDetailProps) {
  const chartData = useMemo<BubbleDatum[]>(() => {
    const factorStep = 0.6 / Math.max(1, data.length - 1 || 1);
    return data.map((item, index) => ({
      ...item,
      sampleSize: computeSampleSize(item.popularityPct),
      color: lighten(accentColor, Math.min(0.65, index * factorStep)),
    }));
  }, [data, accentColor]);

  // Fix for rendering timing — ensures chart only mounts after modal visible
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        setVisible(true);
      }, 50);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setVisible(false);
    }, 0);
    return () => clearTimeout(id);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-black/85 p-8 shadow-[0_40px_110px_-60px_rgba(93,214,211,0.55)]"
        style={{
          boxShadow: `0 40px 120px -70px ${glowColor}, inset 0 0 36px -22px ${glowColor}`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/20 hover:text-white"
          aria-label="Close class detail"
        >
          <X className="size-5" />
        </button>

        <header className="mb-6 flex flex-col gap-3 pr-14">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Class Detail</span>
          <h3 className="font-display text-3xl text-white">
            {className} – Archetype Bubble Map
          </h3>
          <p className="text-sm text-white/65">
            Bubble size reflects the sample of published lists. Position indicates how the archetype balances traction versus performance.
          </p>
        </header>

        {/* Fix: add flex container with guaranteed height */}
        <div className="flex w-full min-h-[360px] items-center justify-center">
          {visible && (
            <div className="chart-wrapper flex-1 min-w-0 h-[360px]">
              <ChartGuard minHeight={360}>
                <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <XAxis
                    type="number"
                    dataKey="popularityPct"
                    name="Popularity"
                    unit="%"
                    stroke="rgba(255,255,255,0.45)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    label={{
                      value: 'Popularity %',
                      position: 'insideBottom',
                      dy: 28,
                      fill: 'rgba(255,255,255,0.65)',
                    }}
                    domain={[
                      0,
                      Math.min(
                        40,
                        Math.max(12, Math.ceil(Math.max(0, ...chartData.map((d) => d.popularityPct))) + 4)
                      ),
                    ]}
                  />
                  <YAxis
                    type="number"
                    dataKey="winRatePct"
                    name="Win Rate"
                    unit="%"
                    stroke="rgba(255,255,255,0.45)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    label={{
                      value: 'Win Rate %',
                      angle: -90,
                      position: 'insideLeft',
                      dx: -28,
                      fill: 'rgba(255,255,255,0.65)',
                    }}
                    domain={[40, 65]}
                  />
                  <ZAxis dataKey="sampleSize" range={[120, 360]} />
                  <Tooltip
                    content={<DetailTooltip />}
                    cursor={{
                      strokeDasharray: '3 3',
                      stroke: 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <Scatter data={chartData}>
                    {chartData.map((entry) => (
                      <Cell key={entry.archetype} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              </ChartGuard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}