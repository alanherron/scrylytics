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
  Area,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// Sketch style for hand-drawn effect
const sketchStyle = {
  strokeWidth: 2,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

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

// Ideal curve data (steady 5-6 cards)
const idealData = [
  { turn: 1, ideal: 5.5 },
  { turn: 2, ideal: 5.5 },
  { turn: 3, ideal: 5.5 },
  { turn: 4, ideal: 5.5 },
  { turn: 5, ideal: 5.5 },
  { turn: 6, ideal: 5.5 },
  { turn: 7, ideal: 5.5 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const handValue = payload.find((p: any) => p.dataKey === "hand")?.value ?? 0;

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      Turn {label}: {handValue} cards in hand
    </div>
  );
}

// Custom dot component for danger glow effect
function CustomDot({ cx, cy, payload }: any) {
  const isDanger = payload.hand < 3;
  if (!isDanger) return null;

  return (
    <g>
      {/* Glow effect */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="rgba(239, 71, 111, 0.3)"
        style={{ filter: "blur(2px)" }}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="rgba(239, 71, 111, 0.5)"
        style={{ filter: "blur(1px)" }}
      />
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#EF476F"
        stroke="#ffffff"
        strokeWidth={2}
        style={{ filter: "drop-shadow(0 0 4px rgba(239, 71, 111, 0.8))" }}
      />
    </g>
  );
}

export default function HandSizePressureChart({
  data = defaultData,
  height = 380,
  title = "Hand Size Pressure Tracker",
}: {
  data?: HandData[];
  height?: number;
  title?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height,
        background: "#f8f3e7", // Parchment color
        border: "2px solid #d4c5a9",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >

      {/* Decorative border elements */}
      <div
        style={{
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          border: "1px solid rgba(212, 197, 169, 0.5)",
          borderRadius: 12,
          pointerEvents: "none",
        }}
      />


      <ResponsiveContainer width="100%" height={height - 80}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          {/* Healthy zone background (4-6 cards) */}

          {/* Filled healthy zone (4-6 cards) */}
          <ReferenceArea
            y1={4}
            y2={6}
            fill="#27ae60"
            fillOpacity={0.15}
            stroke="#27ae60"
            strokeOpacity={0.3}
            strokeDasharray="3 3"
          />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(93, 78, 55, 0.2)"
            opacity={0.5}
          />

          <XAxis
            dataKey="turn"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fill: "rgba(93, 78, 55, 0.7)", fontSize: 12, fontFamily: "serif" }}
            tickLine={{ stroke: "rgba(93, 78, 55, 0.3)" }}
            axisLine={{ stroke: "rgba(93, 78, 55, 0.4)" }}
          />

          <YAxis
            domain={[0, 10]}
            tick={{ fill: "rgba(93, 78, 55, 0.7)", fontSize: 12, fontFamily: "serif" }}
            tickLine={{ stroke: "rgba(93, 78, 55, 0.3)" }}
            axisLine={{ stroke: "rgba(93, 78, 55, 0.4)" }}
            label={{
              value: "Cards in Hand",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "rgba(93, 78, 55, 0.7)", fontFamily: "serif" }
            }}
          />

          {/* Ideal curve (faint gray line) */}
          <Line
            type="monotone"
            dataKey="ideal"
            data={idealData}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            {...sketchStyle}
          />

          {/* Main hand size line */}
          <Line
            type="monotone"
            dataKey="hand"
            stroke="#EF476F"
            dot={<CustomDot />}
            activeDot={{
              r: 6,
              fill: "#EF476F",
              stroke: "#ffffff",
              strokeWidth: 2,
              style: { filter: "drop-shadow(0 0 6px rgba(239, 71, 111, 0.6))" }
            }}
            isAnimationActive
            {...sketchStyle}
            animationBegin={200}
            animationDuration={1500}
            animationEasing="ease-out"
          />

          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>

      <div
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "rgba(93, 78, 55, 0.8)",
          marginTop: 8,
          fontStyle: "italic",
          fontFamily: "serif",
        }}
      >
        Low hand count reduces your ability to respond to threats.
      </div>

      {/* Healthy zone indicator */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 20,
          background: "rgba(39, 174, 96, 0.1)",
          border: "1px solid rgba(39, 174, 96, 0.3)",
          borderRadius: 6,
          padding: "4px 8px",
          fontSize: 11,
          color: "#27ae60",
          fontFamily: "serif",
          fontWeight: 500,
        }}
      >
        Healthy Zone (4-6 cards)
      </div>
    </div>
  );
}
