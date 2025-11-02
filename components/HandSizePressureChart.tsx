// components/HandSizePressureChart.tsx

"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

type HandData = {
  turn: number;
  hand: number;
};

const defaultData: HandData[] = [
  { turn: 1, hand: 6 },
  { turn: 2, hand: 5 },
  { turn: 3, hand: 4 },
  { turn: 4, hand: 3 },
  { turn: 5, hand: 2 },
  { turn: 6, hand: 3 },
  { turn: 7, hand: 2 },
];

const idealData = [
  { turn: 1, ideal: 5.5 },
  { turn: 2, ideal: 5.5 },
  { turn: 3, ideal: 5.5 },
  { turn: 4, ideal: 5.5 },
  { turn: 5, ideal: 5.5 },
  { turn: 6, ideal: 5.5 },
  { turn: 7, ideal: 5.5 },
];

const palette = {
  line: "#22d3ee",
  ideal: "#c4b5fd",
  grid: "rgba(196, 181, 253, 0.18)",
  healthyFill: "rgba(16, 185, 129, 0.14)",
  dangerDot: "#f87171",
  textMuted: "#d1cff8",
};

const HandTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const handValue = payload.find((item: any) => item.dataKey === "hand")?.value ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">Turn {label}</div>
      <div className="mt-1 text-white/70">Cards in hand: {handValue}</div>
      <div className="text-white/70">Healthy target: 4 – 6</div>
      <div className="mt-2 font-medium" style={{ color: handValue < 3 ? palette.dangerDot : palette.ideal }}>
        {handValue < 3 ? "Pressure rising" : "Within range"}
      </div>
    </div>
  );
};

const DangerDot = ({ cx, cy, payload }: any) => {
  const isDanger = payload?.hand < 3;
  if (!isDanger) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill="rgba(248,113,113,0.28)" />
      <circle cx={cx} cy={cy} r={4} fill={palette.dangerDot} stroke="#ffffff" strokeWidth={1.5} />
    </g>
  );
};

export default function HandSizePressureChart({
  data = defaultData,
  height = 340,
  title = "Hand Pressure",
}: {
  data?: HandData[];
  height?: number;
  title?: string;
}) {
  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">
        {title && <h4 className="mb-4 font-display text-lg text-white/90">{title}</h4>}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, bottom: 16, left: 0 }}>
            <CartesianGrid stroke={palette.grid} />
            <XAxis
              dataKey="turn"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              label={{
                value: "Cards in hand",
                angle: -90,
                offset: 0,
                position: "insideLeft",
                style: { fill: "rgba(244,243,255,0.75)", fontSize: 11 },
              }}
            />

            <ReferenceArea y1={4} y2={6} fill={palette.healthyFill} stroke="transparent" />

            <Tooltip content={<HandTooltip />} />

            <Line
              type="monotone"
              data={idealData}
              dataKey="ideal"
              stroke={palette.ideal}
              strokeDasharray="6 6"
              dot={false}
              name="Ideal retention"
            />
            <Line
              type="monotone"
              dataKey="hand"
              stroke={palette.line}
              strokeWidth={2}
              dot={<DangerDot />}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#0b0b10", fill: palette.line }}
              name="Actual hand size"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

