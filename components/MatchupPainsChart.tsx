// components/MatchupPainsChart.tsx

"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  Cell,
} from "recharts";

type MatchupData = {
  matchup: string;
  score: number;
};

const defaultData: MatchupData[] = [
  { matchup: "Aggro", score: 3 },
  { matchup: "Control", score: -3 },
  { matchup: "Combo", score: -1 },
  { matchup: "Midrange", score: 1 },
  { matchup: "Ramp", score: 0 },
];

const palette = {
  positive: "#34d399",
  negative: "#f87171",
  neutral: "#a1a1aa",
  grid: "rgba(196, 181, 253, 0.18)",
  textMuted: "#d1cff8",
};

const MatchupTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">{label}</div>
      <div className="mt-1 text-white/70">Score: {value}</div>
      <div
        className="mt-2 font-medium"
        style={{
          color: value > 0 ? palette.positive : value < 0 ? palette.negative : palette.neutral,
        }}
      >
        {value > 0 ? "Favoured" : value < 0 ? "Pain point" : "Even"}
      </div>
    </div>
  );
};

export default function MatchupPainsChart({
  data = defaultData,
  height = 320,
  title = "Matchup Pressure",
}: {
  data?: MatchupData[];
  height?: number;
  title?: string;
}) {
  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        {title && <h4 className="mb-4 font-display text-lg text-white/90">{title}</h4>}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 24, bottom: 16, left: 16 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis
              dataKey="matchup"
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <YAxis
              domain={[-5, 5]}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.4)" />
            <Tooltip content={<MatchupTooltip />} />
            <Legend
              wrapperStyle={{ color: "rgba(244,243,255,0.75)", fontSize: 12 }}
              iconType="circle"
              verticalAlign="top"
              height={32}
            />
            <Bar dataKey="score" name="Matchup score" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.score > 0 ? palette.positive : entry.score < 0 ? palette.negative : palette.neutral}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

