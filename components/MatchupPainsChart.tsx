// components/MatchupPainsChart.tsx

"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

// Sketch style for hand-drawn effect
const sketchStyle = {
  strokeWidth: 2,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const score = payload[0]?.value ?? 0;
  const matchup = payload[0]?.payload?.matchup ?? "Unknown";
  const isPositive = score > 0;
  const isNeutral = score === 0;

  let description = "";
  if (isNeutral) {
    description = "Neutral matchup";
  } else if (isPositive) {
    description = `Strong vs ${matchup.toLowerCase()}`;
  } else {
    description = `Struggles against ${matchup.toLowerCase()}`;
  }

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
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        vs {label}: {score > 0 ? "+" : ""}{score}
      </div>
      <div style={{ opacity: 0.9 }}>{description}</div>
    </div>
  );
}

export default function MatchupPainsChart({
  data = defaultData,
  height = 380,
  title = "Matchup Pain Index",
}: {
  data?: MatchupData[];
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
        display: "flex",
        flexDirection: "row",
        gap: 16,
      }}
    >

      {/* Chart container */}
      <div style={{ flex: 3 }}>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 20, right: 40, bottom: 20, left: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(93, 78, 55, 0.2)"
              opacity={0.5}
            />

            <XAxis
              type="number"
              domain={[-5, 5]}
              tick={{ fill: "rgba(93, 78, 55, 0.7)", fontSize: 12, fontFamily: "serif" }}
              tickLine={{ stroke: "rgba(93, 78, 55, 0.3)" }}
              axisLine={{ stroke: "rgba(93, 78, 55, 0.4)" }}
              ticks={[-5, -3, -1, 0, 1, 3, 5]}
            />

            <YAxis
              dataKey="matchup"
              type="category"
              tick={{ fill: "rgba(93, 78, 55, 0.7)", fontSize: 12, fontFamily: "serif" }}
              tickLine={{ stroke: "rgba(93, 78, 55, 0.3)" }}
              axisLine={{ stroke: "rgba(93, 78, 55, 0.4)" }}
              width={70}
            />

            {/* Center reference line at 0 */}
            <ReferenceLine
              x={0}
              stroke="#5d4e37"
              strokeWidth={2}
              strokeDasharray="none"
            />

            {/* Custom bars */}
            <Bar
              dataKey="score"
              radius={[4, 4, 4, 4]}
              isAnimationActive
              animationDuration={600}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.score > 0
                      ? "#27ae60"
                      : entry.score < 0
                      ? "#ef4444"
                      : "#9ca3af"
                  }
                  stroke="rgba(0,0,0,0.1)"
                />
              ))}
            </Bar>

            <Tooltip content={<CustomTooltip />} />
          </BarChart>
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
          Shows where your deck struggles and shines.
        </div>
      </div>

      {/* Legend sidebar */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 12,
          padding: "16px",
          background: "rgba(212, 197, 169, 0.1)",
          borderRadius: 8,
          border: "1px solid rgba(212, 197, 169, 0.3)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#5d4e37",
            marginBottom: 8,
            fontFamily: "serif",
          }}
        >
          Matchup Scale
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#27ae60",
              borderRadius: 3,
              boxShadow: "0 2px 4px rgba(39, 174, 96, 0.3)",
            }}
          />
          <span style={{ fontSize: 12, color: "#5d4e37", fontFamily: "serif" }}>
            Strong (+3 to +5)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#6b7280",
              borderRadius: 3,
              boxShadow: "0 2px 4px rgba(107, 114, 128, 0.3)",
            }}
          />
          <span style={{ fontSize: 12, color: "#5d4e37", fontFamily: "serif" }}>
            Neutral (0)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#ef4444",
              borderRadius: 3,
              boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)",
            }}
          />
          <span style={{ fontSize: 12, color: "#5d4e37", fontFamily: "serif" }}>
            Weak (-5 to -1)
          </span>
        </div>

        <hr style={{ width: "100%", opacity: 0.3, margin: "12px 0" }} />

        <div
          style={{
            fontSize: 11,
            lineHeight: 1.4,
            color: "rgba(93, 78, 55, 0.8)",
            fontStyle: "italic",
            fontFamily: "serif",
          }}
        >
          Higher scores = better matchups. Focus on improving red areas.
        </div>
      </div>
    </div>
  );
}
