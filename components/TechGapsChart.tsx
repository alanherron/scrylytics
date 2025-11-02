// components/TechGapsChart.tsx

"use client";

import React from "react";
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
} from "recharts";

type Row = {
  threat: string;
  metaLevel: number;
  yourAnswers: number;
  gap: number;
};

const defaultData: Row[] = [
  { threat: "Token Swarm", metaLevel: 0.8, yourAnswers: 0.3, gap: 0.5 },
  { threat: "Big Minions", metaLevel: 0.7, yourAnswers: 0.4, gap: 0.3 },
  { threat: "Burn/Face", metaLevel: 0.6, yourAnswers: 0.2, gap: 0.4 },
  { threat: "Graveyard/Res", metaLevel: 0.5, yourAnswers: 0.4, gap: 0.1 },
  { threat: "Secret/Tricks", metaLevel: 0.4, yourAnswers: 0.1, gap: 0.3 },
  { threat: "Weapons", metaLevel: 0.3, yourAnswers: 0.0, gap: 0.3 },
];

const palette = {
  meta: "#f97316",
  answers: "#22d3ee",
  gap: "#f43f5e",
  grid: "rgba(196, 181, 253, 0.18)",
  textMuted: "#d1cff8",
};

const TechTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const meta = payload.find((item: any) => item.dataKey === "metaLevel")?.value ?? 0;
  const answers = payload.find((item: any) => item.dataKey === "yourAnswers")?.value ?? 0;
  const gap = payload.find((item: any) => item.dataKey === "gap")?.value ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">{label}</div>
      <div className="mt-1 text-orange-200/80">Meta pressure: {(meta * 10).toFixed(1)}</div>
      <div className="text-cyan-200/80">Your answers: {(answers * 10).toFixed(1)}</div>
      <div className="mt-2 font-medium text-rose-200/80">Gap: {(gap * 10).toFixed(1)}</div>
    </div>
  );
};

export default function TechGapsChart({
  data = defaultData,
  height = 360,
  title = "Tech Coverage vs. Meta Threats",
}: {
  data?: Row[];
  height?: number;
  title?: string;
}) {
  const chartData = data.map((item) => ({
    ...item,
    metaLevel: Number(item.metaLevel ?? 0),
    yourAnswers: Number(item.yourAnswers ?? 0),
    gap: Number(item.gap ?? 0),
  }));

  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        {title && <h4 className="mb-4 font-display text-lg text-white/90">{title}</h4>}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            data={chartData}
            margin={{ top: 16, right: 24, bottom: 16, left: 16 }}
          >
            <CartesianGrid stroke={palette.grid} />
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={(value) => `${Math.round(value * 10)}`}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <YAxis
              dataKey="threat"
              type="category"
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              width={120}
            />

            <Tooltip content={<TechTooltip />} />
            <Legend
              wrapperStyle={{ color: "rgba(244,243,255,0.75)", fontSize: 12 }}
              iconType="circle"
              verticalAlign="top"
              height={32}
            />

            <Bar
              dataKey="metaLevel"
              name="Meta pressure (x10)"
              barSize={14}
              radius={[7, 7, 7, 7]}
              fill={palette.meta}
            />
            <Bar
              dataKey="yourAnswers"
              name="Your coverage (x10)"
              barSize={14}
              radius={[7, 7, 7, 7]}
              fill={palette.answers}
            />
            <Line
              type="monotone"
              dataKey="gap"
              name="Gap size (x10)"
              stroke={palette.gap}
              strokeWidth={2}
              dot={{ r: 4, stroke: "#fff", strokeWidth: 1 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

