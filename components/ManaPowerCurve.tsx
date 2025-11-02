// components/ManaPowerCurve.tsx

"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend,
  Bar,
  Area,
  Cell,
} from "recharts";

export type ManaDatum = {
  mana: number;
  value?: number;
  count?: number;
  ideal?: number;
};

type Props = {
  data: ManaDatum[];
  showIdeal?: boolean;
  title?: string;
  caption?: string;
  height?: number;
};

const palette = {
  positive: "#34d399",
  negative: "#f87171",
  neutral: "#a1a1aa",
  ideal: "rgba(196, 181, 253, 0.25)",
  idealStroke: "#c4b5fd",
  grid: "rgba(196, 181, 253, 0.18)",
  textMuted: "#d1cff8",
};

const ManaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const status = data.delta > 0 ? "Surplus" : data.delta < 0 ? "Needs more" : "Balanced";
  const tone =
    data.delta > 0 ? palette.positive : data.delta < 0 ? palette.negative : "rgba(244,243,255,0.8)";

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">Mana {label}</div>
      <div className="mt-1 text-white/70">Current: {data.current}</div>
      <div className="text-white/70">Ideal: {data.ideal}</div>
      <div className="mt-2 font-medium" style={{ color: tone }}>
        {status} ({data.delta > 0 ? "+" : ""}
        {data.delta})
      </div>
    </div>
  );
};

export function ManaPowerCurve({
  data,
  showIdeal = true,
  title,
  caption,
  height = 360,
}: Props) {
  const chartData = data.map((item) => {
    const ideal = item.ideal ?? 0;
    const current = item.count ?? (item.value ?? 0) + ideal;
    const delta = item.value ?? current - ideal;
    return {
      mana: item.mana,
      current,
      ideal,
      delta,
    };
  });

  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        {(title || caption) && (
          <div className="mb-4 flex flex-col gap-2">
            {title && <h4 className="font-display text-lg text-white/90">{title}</h4>}
            {caption && <p className="text-xs text-white/60">{caption}</p>}
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 24, bottom: 24, left: 16 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis
              dataKey="mana"
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              label={{ value: "Mana Cost", position: "insideBottom", dy: 16, fill: "rgba(244,243,255,0.75)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <YAxis
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.4)" />

            <Tooltip content={<ManaTooltip />} />
            {showIdeal && (
              <Legend
                wrapperStyle={{ color: "rgba(244,243,255,0.75)", fontSize: 12 }}
                iconType="circle"
                verticalAlign="top"
                height={32}
              />
            )}

            <Bar dataKey="delta" name="Surplus / deficit" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.delta >= 0 ? palette.positive : palette.negative} />
              ))}
            </Bar>

            {showIdeal && (
              <Area
                type="monotone"
                dataKey="ideal"
                name="Ideal curve"
                stroke={palette.idealStroke}
                fill={palette.ideal}
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

