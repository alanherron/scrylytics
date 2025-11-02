// components/ArcaneBalanceChart.tsx

"use client";

import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type BalanceDatum = {
  metric: string;
  ideal: number;
  current: number;
};

const palette = {
  ideal: "#22d3ee",
  current: "#f970a6",
  grid: "rgba(196, 181, 253, 0.18)",
  text: "#f4f3ff",
};

const verdict = (ideal: number, current: number) => {
  const diff = current - ideal;
  const abs = Math.abs(diff);
  if (abs <= 5) return "In balance";
  return diff < 0 ? "Needs more focus" : "Over-indexed";
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const ideal = payload.find((p: any) => p.dataKey === "ideal")?.value ?? 0;
  const current = payload.find((p: any) => p.dataKey === "current")?.value ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">{label}</div>
      <div className="mt-1 text-white/70">Ideal: {ideal}</div>
      <div className="text-white/70">Current: {current}</div>
      <div className="mt-2 font-medium italic text-aether-200">{verdict(ideal, current)}</div>
    </div>
  );
}

export function ArcaneBalanceChart({
  data = defaultData,
  height = 420,
}: {
  data?: BalanceDatum[];
  height?: number;
}) {
  const isNarrow = useMemo(() => typeof window !== "undefined" && window.innerWidth < 720, []);

  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="h-full rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            cx={isNarrow ? "50%" : "44%"}
            cy="50%"
            outerRadius={isNarrow ? "70%" : "78%"}
            margin={{ top: 8, right: isNarrow ? 16 : 140, bottom: 12, left: 8 }}
          >
            <PolarGrid stroke={palette.grid} strokeDasharray="4 4" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: palette.text }} />
            <PolarRadiusAxis tick={false} axisLine={false} />

            <Radar
              name="Ideal"
              dataKey="ideal"
              stroke={palette.ideal}
              fill="rgba(34, 211, 238, 0.25)"
              strokeWidth={2}
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke={palette.current}
              fill="rgba(249, 112, 166, 0.35)"
              strokeWidth={2}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout={isNarrow ? "horizontal" : "vertical"}
              verticalAlign={isNarrow ? "bottom" : "middle"}
              align={isNarrow ? "center" : "right"}
              wrapperStyle={{
                color: "rgba(244,243,255,0.75)",
                fontSize: 12,
                lineHeight: 1.2,
                paddingTop: isNarrow ? 6 : 0,
                paddingRight: isNarrow ? 0 : 12,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Example data
const defaultData: BalanceDatum[] = [
  { metric: "Ramp", ideal: 60, current: 35 },
  { metric: "Removal", ideal: 60, current: 50 },
  { metric: "Win Cons", ideal: 55, current: 70 },
  { metric: "Draw", ideal: 65, current: 30 },
  { metric: "Protection", ideal: 50, current: 45 },
];

