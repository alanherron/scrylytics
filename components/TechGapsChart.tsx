// components/TechGapsChart.tsx

"use client";

import React from "react";

import {

  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,

  CartesianGrid, LabelList

} from "recharts";

// Sketch style for hand-drawn effect
const sketchStyle = {
  strokeWidth: 2,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};



type Row = {

  threat: string;

  metaLevel: number;

  yourAnswers: number;

  gap: number;

};



const defaultData: Row[] = [

  { threat: "Token Swarm",   metaLevel: 8, yourAnswers: 3, gap: 5 },

  { threat: "Big Minions",   metaLevel: 7, yourAnswers: 4, gap: 3 },

  { threat: "Burn / Face",   metaLevel: 6, yourAnswers: 2, gap: 4 },

  { threat: "Graveyard",     metaLevel: 5, yourAnswers: 4, gap: 1 },

  { threat: "Secret Tricks", metaLevel: 4, yourAnswers: 1, gap: 3 },

  { threat: "Weapons",       metaLevel: 3, yourAnswers: 0, gap: 3 },

];



function GapLabel({ x, y, width, value }: any) {

  if (!value || value <= 0) return null;

  const cx = x + width + 8;

  const cy = y + 10;

  return (

    <g>

      <rect

        x={cx - 4}

        y={cy - 10}

        width={38}

        height={16}

        rx={8}

        fill="rgba(239,71,111,0.15)"

        stroke="#EF476F"

      />

      <text

        x={cx + 14}

        y={cy + 2}

        textAnchor="middle"

        fontSize={11}

        fill="#EF476F"

        fontWeight={700}

      >

        GAP {value}

      </text>

    </g>

  );

}



export default function TechGapsChart({

  data = defaultData,

  height = 360,

  title = "Tech Coverage vs. Meta Threats",

}: {

  data?: Row[];

  height?: number;

  title?: string;

}) {

  return (

    <div

      className="w-full flex flex-row items-start gap-4"

      style={{

        background: "#f2ead6",

        border: "1px solid #d9cbb0",

        borderRadius: 12,

        padding: 12,

        minHeight: height,

        position: "relative",

      }}

    >


      {/* Chart container */}

      <div style={{ flex: 3, minWidth: 0 }}>


        <ResponsiveContainer width="100%" height={height - 80}>

          <BarChart

            data={data}

            layout="vertical"

            margin={{ top: 8, right: 30, bottom: 8, left: 90 }}

          >

            <CartesianGrid strokeDasharray="4 4" opacity={0.4} />

            <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} />

            <YAxis

              dataKey="threat"

              type="category"

              tick={{ fontSize: 12 }}

              width={100}

            />

            <Tooltip

              formatter={(v: number, name: string) => [

                v,

                name === "metaLevel"

                  ? "Meta Threat"

                  : name === "yourAnswers"

                  ? "Your Answers"

                  : "Gap",

              ]}

              labelStyle={{ fontWeight: 700 }}

            />



            {/* Gray = Meta Threat, Blue = Your Answers */}

            <Bar

              dataKey="metaLevel"

              name="Meta Threat"

              fill="#6c757d"

              radius={[0, 6, 6, 0]}

              maxBarSize={24}

              {...sketchStyle}

            />

            <Bar

              dataKey="yourAnswers"

              name="Your Answers"

              fill="#3A86FF"

              radius={[0, 6, 6, 0]}

              maxBarSize={24}

              {...sketchStyle}

            >

              <LabelList dataKey="gap" content={<GapLabel />} />

            </Bar>

          </BarChart>

        </ResponsiveContainer>



        <div style={{ fontSize: 12, marginTop: 6, opacity: 0.9 }}>

          <b>Quick Read:</b> Gray = how common the threat is. Blue = how many answers you run.  

          Red "GAP" means your deck isn't ready for that matchup.

        </div>

      </div>



      {/* Legend and summary sidebar */}

      <div

        style={{

          flex: 1,

          display: "flex",

          flexDirection: "column",

          justifyContent: "center",

          alignItems: "flex-start",

          gap: 8,

          fontSize: 13,

        }}

      >

        <div style={{ fontWeight: 700, marginBottom: 4 }}>Legend</div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          <div style={{ width: 14, height: 14, background: "#6c757d", borderRadius: 3 }} />

          Meta Threat

        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          <div style={{ width: 14, height: 14, background: "#3A86FF", borderRadius: 3 }} />

          Your Answers

        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          <div

            style={{

              width: 14,

              height: 14,

              borderRadius: 3,

              background: "rgba(239,71,111,0.3)",

              border: "1px solid #EF476F",

            }}

          />

          Gap Detected

        </div>



        <hr style={{ width: "100%", opacity: 0.4, margin: "8px 0" }} />



        <div style={{ fontSize: 12, lineHeight: 1.3 }}>

          <b>Tip:</b> Add counter cards for top "GAP" rows —  

          <span style={{ color: "#EF476F" }}>like weapon removal</span> for <i>Weapons</i>.

        </div>

      </div>

    </div>

  );

}
