import * as React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ReferenceArea,
} from 'recharts';

type Point = { turn: number; hand: number; target: number };

export type DrawRhythmChartProps = {
  data?: Point[];
  goalColor?: string;
  barColor?: string;
  maxY?: number;
  minY?: number;
  height?: number;
};

const DEFAULT_DATA: Point[] = [
  { turn: 1, hand: 3, target: 5 },
  { turn: 2, hand: 2, target: 5 },
  { turn: 3, hand: 4, target: 5 },
  { turn: 4, hand: 3, target: 5 },
  { turn: 5, hand: 6, target: 5 },
  { turn: 6, hand: 2, target: 5 },
  { turn: 7, hand: 4, target: 5 },
  { turn: 8, hand: 3, target: 5 },
];

const palette = {
  accent: '#c4b5fd',
  accentSoft: 'rgba(196, 181, 253, 0.1)',
  bar: '#5dd6d3',
  barStroke: '#22d3ee',
  grid: 'rgba(196, 181, 253, 0.18)',
  text: '#f4f3ff',
  textMuted: '#c7c3ff',
  healthyFill: 'rgba(16, 185, 129, 0.12)',
  danger: '#f87171',
};

const RhythmTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const hand = payload.find((item: any) => item.dataKey === 'hand')?.value as number;
  const target = payload[0]?.payload?.target ?? 0;
  const diff = hand - target;
  const tone = diff === 0 ? 'On tempo' : diff > 0 ? `+${diff} cards` : `${diff} cards`;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/90 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">Turn {label}</div>
      <div className="mt-1 text-white/80">Hand size: {hand}</div>
      <div className="text-white/70">Target: {target}</div>
      <div className="mt-2 font-medium" style={{ color: diff >= 0 ? palette.accent : palette.danger }}>
        {tone}
      </div>
    </div>
  );
};

export default function DrawRhythmChart({
  data = DEFAULT_DATA,
  goalColor = palette.accent,
  barColor = palette.bar,
  maxY,
  minY = 0,
  height = 320,
}: DrawRhythmChartProps) {
  const computedMax =
    maxY ??
    Math.max(
      7,
      ...data.map((d) => Math.max(d.hand ?? 0, d.target ?? 0)),
    );
  const computedMin =
    minY ??
    Math.min(
      0,
      ...data.map((d) => Math.min(d.hand ?? 0, d.target ?? 0)),
    );

  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis
              dataKey="turn"
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />
            <YAxis
              domain={[computedMin, computedMax]}
              allowDecimals={false}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />

            <ReferenceArea y1={4} y2={6} fill={palette.healthyFill} stroke="#10b981" strokeOpacity={0.25} />

            <Tooltip content={<RhythmTooltip />} />
            <Legend
              wrapperStyle={{ color: palette.textMuted, fontSize: 12 }}
              iconType="circle"
              verticalAlign="top"
              height={32}
            />

            <Bar dataKey="hand" name="Actual hand size" fill={barColor} stroke={palette.barStroke} radius={[8, 8, 0, 0]} />
            <Line
              type="monotone"
              dataKey="target"
              name="Target rhythm"
              stroke={goalColor}
              strokeWidth={2}
              dot={{ stroke: goalColor, fill: '#0b0b10', r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, fill: '#0b0b10', stroke: goalColor }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

