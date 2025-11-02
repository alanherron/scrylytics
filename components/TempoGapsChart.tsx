// components/TempoGapsChart.tsx

"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  Bar,
} from "recharts";

type TempoPoint = {
  mana: number;
  count: number;
  ideal?: number;
  value?: number;
};

type Props = {
  data: TempoPoint[];
  height?: number;
};

const palette = {
  areaStart: "#7dd3fc",
  areaEnd: "rgba(125, 211, 252, 0)",
  ideal: "#c4b5fd",
  grid: "rgba(196, 181, 253, 0.18)",
  positive: "#34d399",
  negative: "#f87171",
  textMuted: "#d1cff8",
};

const TempoTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const board = payload.find((item: any) => item.dataKey === "count")?.value ?? 0;
  const ideal = payload.find((item: any) => item.dataKey === "idealLine")?.value ?? 0;
  const gap = board - ideal;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">Mana {label}</div>
      <div className="mt-1 text-white/70">Board presence: {board.toFixed(1)}</div>
      <div className="text-white/70">Ideal curve: {ideal.toFixed(1)}</div>
      <div className="mt-2 font-medium" style={{ color: gap >= 0 ? palette.positive : palette.negative }}>
        {gap >= 0 ? `+${gap.toFixed(1)} tempo` : `${gap.toFixed(1)} tempo`}
      </div>
    </div>
  );
};

export default function TempoGapsChart({ data, height = 360 }: Props) {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        idealLine: point.ideal ?? point.count ?? 0,
        gap: (point.count ?? 0) - (point.ideal ?? point.count ?? 0),
      })),
    [data],
  );

  const maxValue = Math.max(
    6,
    ...chartData.map((d) => Math.max(d.count ?? 0, d.idealLine ?? 0)),
  );

  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 24, bottom: 16, left: 16 }}>
            <defs>
              <linearGradient id="tempoArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={palette.areaStart} stopOpacity={0.8} />
                <stop offset="95%" stopColor={palette.areaEnd} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={palette.grid} />

            <XAxis
              dataKey="mana"
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />

            <YAxis
              domain={[0, Math.ceil(maxValue + 1)]}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              allowDecimals={false}
            />

            <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.4)" />

            <Bar dataKey="gap" barSize={10} radius={[6, 6, 6, 6]}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={`gap-${idx}`}
                  fill={entry.gap >= 0 ? "rgba(52, 211, 153, 0.3)" : "rgba(248, 113, 113, 0.3)"}
                  stroke={entry.gap >= 0 ? palette.positive : palette.negative}
                />
              ))}
            </Bar>

            <Area
              type="monotone"
              dataKey="count"
              fill="url(#tempoArea)"
              stroke="#38bdf8"
              strokeWidth={3}
              name="Board strength"
            />

            <Line
              type="monotone"
              dataKey="idealLine"
              stroke={palette.ideal}
              strokeDasharray="6 4"
              strokeWidth={2}
              dot={{ r: 3, stroke: "#fff", strokeWidth: 1 }}
              name="Ideal curve"
            />

            <Tooltip content={<TempoTooltip />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

