'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Line,
  Bar,
  ReferenceLine,
} from 'recharts';

type Point = { mana: number; count: number; value: number; ideal: number };

const SAMPLE: Point[] = [
  { mana: 0, count: 0, value: -1, ideal: 1 },
  { mana: 1, count: 2, value: 0, ideal: 2 },
  { mana: 2, count: 4, value: 1, ideal: 3 },
  { mana: 3, count: 5, value: 2, ideal: 3.5 },
  { mana: 4, count: 4, value: 2.2, ideal: 3.2 },
  { mana: 5, count: 3, value: 2.0, ideal: 3.0 },
  { mana: 6, count: 2, value: 1.6, ideal: 2.6 },
  { mana: 7, count: 1, value: 1.2, ideal: 2.2 },
];

const palette = {
  grid: 'rgba(196, 181, 253, 0.18)',
  textMuted: '#d1cff8',
  count: '#34d399',
  idealStroke: '#c4b5fd',
  idealFill: 'rgba(196, 181, 253, 0.2)',
  value: '#38bdf8',
};

const PowerTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const cardCount = payload.find((item: any) => item.dataKey === 'count')?.value ?? 0;
  const value = payload.find((item: any) => item.dataKey === 'value')?.value ?? 0;
  const ideal = payload.find((item: any) => item.dataKey === 'ideal')?.value ?? 0;
  const gap = value - ideal;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">Mana {label}</div>
      <div className="mt-1 text-white/70">Cards: {cardCount}</div>
      <div className="text-white/70">Power: {value.toFixed(1)}</div>
      <div className="text-white/70">Ideal: {ideal.toFixed(1)}</div>
      <div className="mt-2 font-medium" style={{ color: gap >= 0 ? '#34d399' : '#f87171' }}>
        {gap >= 0 ? `+${gap.toFixed(1)} over ideal` : `${gap.toFixed(1)} below ideal`}
      </div>
    </div>
  );
};

export default function TempoCurveKnownGood({
  data = SAMPLE,
  height = 340,
}: { data?: Point[]; height?: number }) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const minPower = Math.min(0, ...data.map((d) => Math.min(d.value, d.ideal)));
  const maxPower = Math.max(2, ...data.map((d) => Math.max(d.value, d.ideal)));

  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 16 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis
              dataKey="mana"
              tick={{ fontSize: 12, fill: palette.textMuted }}
              label={{
                value: 'Mana (Turn)',
                position: 'insideBottom',
                offset: -4,
                fill: 'rgba(244,243,255,0.75)',
              }}
              tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />
            <YAxis
              yAxisId="power"
              domain={[Math.floor(minPower - 0.5), Math.ceil(maxPower + 0.5)]}
              tick={{ fontSize: 12, fill: palette.textMuted }}
              label={{
                value: 'Power',
                angle: -90,
                position: 'insideLeft',
                fill: 'rgba(244,243,255,0.75)',
              }}
              tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              domain={[0, Math.max(5, Math.ceil(maxCount + 1))]}
              tick={{ fontSize: 12, fill: palette.textMuted }}
              label={{
                value: 'Card count',
                angle: 90,
                position: 'insideRight',
                fill: 'rgba(244,243,255,0.75)',
              }}
              tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />
            <Tooltip content={<PowerTooltip />} />
            <ReferenceLine y={0} yAxisId="power" stroke="rgba(148,163,184,0.4)" />

            <Bar
              yAxisId="count"
              dataKey="count"
              name="Cards at this mana"
              barSize={16}
              fill="rgba(52, 211, 153, 0.35)"
              stroke={palette.count}
              radius={[6, 6, 0, 0]}
            />

            <Area
              yAxisId="power"
              type="monotone"
              dataKey="ideal"
              name="Ideal power"
              stroke={palette.idealStroke}
              fill={palette.idealFill}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />

            <Line
              yAxisId="power"
              type="monotone"
              dataKey="value"
              name="Your power"
              stroke={palette.value}
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

