// components/ArcaneBalanceChart.tsx

"use client";

import React from "react";

import {

  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,

  Legend, ResponsiveContainer, Tooltip

} from "recharts";

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

const legendStyle: React.CSSProperties = {

  fontSize: 12,

  lineHeight: 1.2,

  paddingTop: 4,

};

export function ArcaneBalanceChart({

  data = defaultData,

  height = 380,

  showLegend = true,

}: {

  data?: BalanceDatum[];

  height?: number;

  showLegend?: boolean;

}) {

  return (

    <div className="w-full" style={{ height }}>

      <ResponsiveContainer width="100%" height="100%">

        <RadarChart data={data} outerRadius="75%">

          <PolarGrid strokeDasharray="4 4" />

          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />

          <PolarRadiusAxis tick={false} axisLine={false} />



          {/* Draw Ideal first (lighter), then Current on top (heavier) for clear overlay */}

          <Radar

            name="Ideal"

            dataKey="ideal"

            stroke="#3A86FF"

            fill="#3A86FF"

            fillOpacity={0.18}          // transparent

            isAnimationActive

            animationBegin={0}

            animationDuration={700}

          />

          <Radar

            name="Current"

            dataKey="current"

            stroke="#EF476F"

            fill="#EF476F"

            fillOpacity={0.38}          // transparent, sits above Ideal

            isAnimationActive

            animationBegin={100}

            animationDuration={800}

          />



          <Tooltip content={<CustomTooltip />} />

          {showLegend && (

            <Legend

              verticalAlign="bottom"

              align="center"

              wrapperStyle={legendStyle}

              payload={[

                { id: "Ideal",   value: "Ideal",   type: "line", color: "#3A86FF" },

                { id: "Current", value: "Current", type: "line", color: "#EF476F" },

              ]}

            />

          )}

        </RadarChart>

      </ResponsiveContainer>

    </div>

  );

}

// Example data (0–100). Map your analyzer outputs to this scale.

const defaultData: BalanceDatum[] = [

  { metric: "Ramp",       ideal: 60, current: 35 },

  { metric: "Removal",    ideal: 60, current: 50 },

  { metric: "Win Cons",   ideal: 55, current: 70 },

  { metric: "Draw",       ideal: 65, current: 30 },

  { metric: "Protection", ideal: 50, current: 45 },

];
