'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
} from 'recharts';

type Point = {
  turn: number;          // Turn number (1..10)
  actual: number;        // Cards drawn this turn (or total hand gain this turn)
  target: number;        // What we wanted to draw this turn
  delta?: number;        // actual - target (computed)
};

export type DrawRhythmChartProps = {
  title?: string;
  blurb?: string;
  data: Point[];
  maxY?: number;         // y-axis max (auto if not set)
};

/**
 * DrawRhythmChart
 *
 * Shows per-turn draw vs target, with a simple green/red "good/bad" bar.
 * - Bars: Surplus/deficit each turn (green up/red down from 0 line)
 * - Line: Target draw per turn (baseline goal)
 * - Dots: Actual draw per turn
 * - Words are simple on purpose.
 */
export default function DrawRhythmChart({
  title = 'Draw Rhythm',
  blurb = 'Green = drew enough, Red = not enough. Keep your draw steady so your plan works.',
  data,
  maxY,
}: DrawRhythmChartProps) {
  // Normalize and compute deltas
  const rows = React.useMemo(() => {
    return data.map(d => ({
      ...d,
      delta: (d.actual ?? 0) - (d.target ?? 0),
    }));
  }, [data]);

  // Auto y-domain: make room for the biggest absolute delta + target/actual
  const absMax = React.useMemo(() => {
    const values = rows.flatMap(r => [r.actual, r.target, Math.abs(r.delta ?? 0)]);
    return Math.max(2, Math.ceil(Math.max(...values.filter(v => Number.isFinite(v)) as number[])));
  }, [rows]);

  const yMax = maxY ?? absMax;

  // Color the delta bars (green = surplus, red = deficit)
  const barColor = (value: number) => (value >= 0 ? '#27ae60' : '#e74c3c');

  // Plain-language tooltip
  const SimpleTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // We pushed multiple series; pick out what we need:
    const p = payload.reduce(
      (acc: any, cur: any) => {
        if (cur.dataKey === 'delta') acc.delta = cur.value;
        if (cur.dataKey === 'actual') acc.actual = cur.value;
        if (cur.dataKey === 'target') acc.target = cur.value;
        return acc;
      },
      { delta: 0, actual: 0, target: 0 }
    );

    const verdict =
      p.delta > 0 ? 'You drew more than needed.' :
      p.delta < 0 ? 'You drew less than needed.' :
      'You hit the goal.';

    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        aria-live="polite"
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Turn {label}</div>
        <div>Actual draw: <strong>{p.actual}</strong></div>
        <div>Target draw: <strong>{p.target}</strong></div>
        <div>Diff: <strong style={{ color: barColor(p.delta) }}>{p.delta}</strong></div>
        <div style={{ marginTop: 4, opacity: 0.8 }}>{verdict}</div>
      </div>
    );
  };

  // A very simple headline + subheader
  function Header() {
    return (
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-neutral-600">{blurb}</p>
      </div>
    );
  }

  return (
    <div
      role="figure"
      aria-label="Chart showing card draw vs goal each turn"
      className="w-full rounded-2xl border border-neutral-200 bg-[url('data:image/svg+xml;utf8,\
%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2748%27 height=%2748%27 viewBox=%270 0 48 48%27%3E%3Crect width=%2748%27 height=%2748%27 fill=%27%23f8f3e7%27/%3E%3Cpath d=%27M0 47.5 H48%27 stroke=%27%23e7dfcc%27 stroke-width=%271%27/%3E%3Cpath d=%27M47.5 0 V48%27 stroke=%27%23e7dfcc%27 stroke-width=%271%27/%3E%3C/svg%3E')] p-4"
      style={{
        boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
      }}
    >
      <Header />

      <div className="mt-3 w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <CartesianGrid stroke="#eee" vertical={false} />

            <XAxis
              dataKey="turn"
              tick={{ fontSize: 12 }}
              label={{ value: 'Turn', position: 'insideBottom', offset: -4 }}
            />

            <YAxis
              domain={[-yMax, yMax]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Cards Drawn (per turn)', angle: -90, position: 'insideLeft' }}
            />

            {/* Zero line to split surplus vs deficit */}
            <ReferenceLine y={0} stroke="#bbb" strokeDasharray="4 4" />

            {/* Surplus / Deficit bars (delta) */}
            <Bar dataKey="delta" name="Diff (Actual - Target)" isAnimationActive={false}>
              {
                rows.map((r, idx) => (
                  <rect key={`bar-c-${idx}`} /> // placeholder; color handled by shape prop below
                ))
              }
              <LabelList
                dataKey="delta"
                position="top"
                formatter={(v: number) => (v === 0 ? '' : v)}
                style={{ fontSize: 11, fontWeight: 600 }}
              />
            </Bar>

            {/* Custom shape to color bars green/red and extend up/down from 0 */}
            {/* We override Bar's shape render via a function component */}
            <Bar
              dataKey="delta"
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                const value: number = payload.delta ?? 0;
                const c = barColor(value);
                // Recharts draws bars from the top by default; we want to straddle the zero line:
                const zeroY = props.yAxis?.scale(0) ?? y;
                const top = value >= 0 ? y : zeroY;
                const h = Math.abs((zeroY - y) || height);
                return (
                  <g>
                    <rect
                      x={x}
                      y={top}
                      width={Math.max(1, width)}
                      height={Math.max(0, h)}
                      fill={c}
                      rx={4}
                      ry={4}
                    />
                  </g>
                );
              }}
            />

            {/* Target line (goal) */}
            <Line
              type="monotone"
              dataKey="target"
              name="Goal"
              stroke="#2d7ff9"
              strokeWidth={2}
              dot={{ r: 0 }}
              isAnimationActive={false}
            />

            {/* Actual points (dots) */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#111"
              strokeWidth={2}
              dot={{ r: 4 }}
              isAnimationActive={false}
            />

            <Tooltip content={<SimpleTooltip />} />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Simple legend with "kid words" */}
      <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        <LegendPill color="#2d7ff9" label="Goal line" explain="How much you wanted to draw." />
        <LegendPill color="#111" label="Actual dots" explain="How much you really drew." />
        <LegendPill color="#27ae60" label="Green bar" explain="Drew enough (good)." extraRight={
          <LegendPill color="#e74c3c" label="Red bar" explain="Drew too little (bad)." />
        } />
      </div>

    </div>
  );
}

function LegendPill({
  color,
  label,
  explain,
  extraRight,
}: {
  color: string;
  label: string;
  explain: string;
  extraRight?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-1 inline-block h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-neutral-600">{explain}</div>
      </div>
      {extraRight ? <div className="ml-auto">{extraRight}</div> : null}
    </div>
  );
}
