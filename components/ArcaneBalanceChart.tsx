// components/ArcaneBalanceChart.tsx

"use client";

import React, { useMemo } from "react";

import {

  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,

  Legend, ResponsiveContainer, Tooltip

} from "recharts";

// Sketch style for hand-drawn effect
const sketchStyle = {
  strokeWidth: 2,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

type Metric = "Ramp" | "Removal" | "Win Cons" | "Draw" | "Protection";

export type BalanceDatum = {

  metric: Metric;

  ideal: number;   // 0–100

  current: number; // 0–100

};

const verdict = (ideal: number, current: number) => {

  const diff = current - ideal;

  const abs = Math.abs(diff);

  if (abs <= 5) return "Just Right";

  return diff < 0 ? "Too Low" : "Too High";

};

function CustomTooltip({ active, payload, label }: any) {

  if (!active || !payload?.length) return null;

  const ideal = payload.find((p: any) => p.dataKey === "ideal")?.value ?? 0;

  const current = payload.find((p: any) => p.dataKey === "current")?.value ?? 0;



  return (

    <div

      style={{

        background: "rgba(0,0,0,0.75)",

        color: "white",

        padding: "8px 10px",

        borderRadius: 8,

        fontSize: 12,

        lineHeight: 1.25,

      }}

    >

      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>

      <div>Ideal: {ideal}</div>

      <div>Current: {current}</div>

      <div style={{ marginTop: 4, fontStyle: "italic" }}>{verdict(ideal, current)}</div>

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

  // On very small widths, fall back to bottom legend to avoid squish

  const isNarrow = useMemo(() => typeof window !== "undefined" && window.innerWidth < 720, []);



  return (

    <div className="w-full" style={{ height, position: "relative" }}>


      <ResponsiveContainer width="100%" height={height}>

        <RadarChart

          data={data}

          // Shift the chart left to make room for the side legend

          cx={isNarrow ? "50%" : "42%"}

          cy="50%"

          // Grow radius since we reclaimed space

          outerRadius={isNarrow ? "70%" : "80%"}

          margin={{ top: 8, right: isNarrow ? 12 : 140, bottom: 12, left: 8 }}

        >

          <PolarGrid strokeDasharray="4 4" />

          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />

          <PolarRadiusAxis tick={false} axisLine={false} />



          {/* Underlay: Ideal (blue), Overlay: Current (red) */}

          <Radar

            name="Ideal"

            dataKey="ideal"

            stroke="#3A86FF"

            fill="#3A86FF"

            fillOpacity={0.18}

            isAnimationActive

            animationBegin={0}

            animationDuration={700}

            {...sketchStyle}

          />

          <Radar

            name="Current"

            dataKey="current"

            stroke="#EF476F"

            fill="#EF476F"

            fillOpacity={0.38}

            isAnimationActive

            animationBegin={100}

            animationDuration={800}

            {...sketchStyle}

          />



          <Tooltip content={<CustomTooltip />} />



          <Legend

            // Side legend on wide screens; bottom on narrow

            layout={isNarrow ? "horizontal" : "vertical"}

            verticalAlign={isNarrow ? "bottom" : "middle"}

            align={isNarrow ? "center" : "right"}

            wrapperStyle={{

              fontSize: 12,

              lineHeight: 1.2,

              paddingTop: isNarrow ? 6 : 0,

              paddingRight: isNarrow ? 0 : 8,

            }}

          />

        </RadarChart>

      </ResponsiveContainer>

    </div>

  );

}

// Example data

const defaultData: BalanceDatum[] = [

  { metric: "Ramp",       ideal: 60, current: 35 },

  { metric: "Removal",    ideal: 60, current: 50 },

  { metric: "Win Cons",   ideal: 55, current: 70 },

  { metric: "Draw",       ideal: 65, current: 30 },

  { metric: "Protection", ideal: 50, current: 45 },

];
