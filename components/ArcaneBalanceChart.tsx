// components/ArcaneBalanceChart.tsx

"use client";

import React from "react";

import {

  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer

} from "recharts";

type Metric = "Ramp" | "Removal" | "Win Cons" | "Draw" | "Protection";

export type BalanceDatum = {

  metric: Metric;

  ideal: number;   // 0–100

  current: number; // 0–100

};

export function ArcaneBalanceChart({

  data = defaultData,

  height = 360,

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

          {/* Ideal (blue outline, light fill) */}

          <Radar

            name="Ideal"

            dataKey="ideal"

            stroke="#4cc9f0"

            fill="#4cc9f0"

            fillOpacity={0.12}

            isAnimationActive

            animationBegin={0}

            animationDuration={800}

          />

          {/* Current (red outline, stronger fill) */}

          <Radar

            name="Current"

            dataKey="current"

            stroke="#f94144"

            fill="#f94144"

            fillOpacity={0.38}

            isAnimationActive

            animationBegin={100}

            animationDuration={900}

          />

          {showLegend && (

            <Legend

              verticalAlign="bottom"

              align="center"

              wrapperStyle={{ fontSize: 12, marginTop: 8 }}

            />

          )}

        </RadarChart>

      </ResponsiveContainer>

    </div>

  );

}

// Example default data — adjust to your analyzer output (0–100 scale)

const defaultData: BalanceDatum[] = [

  { metric: "Ramp",       ideal: 60, current: 35 },

  { metric: "Removal",    ideal: 60, current: 50 },

  { metric: "Win Cons",   ideal: 55, current: 70 },

  { metric: "Draw",       ideal: 65, current: 30 },

  { metric: "Protection", ideal: 50, current: 45 },

];
