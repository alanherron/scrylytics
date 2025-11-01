// components/TechGapsChart.tsx

"use client";

import {

  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList

} from "recharts";

import React from "react";



type Row = {

  threat: string;         // meta archetype / tactic

  metaLevel: number;      // 0–10 how common/pressing it is in current meta

  yourAnswers: number;    // 0–10 how many answers the deck packs

  gap: number;            // metaLevel - yourAnswers (clamped >= 0)

};



// super-simple defaults (tweak to your meta)

const defaultData: Row[] = [

  { threat: "Token Swarm",    metaLevel: 8, yourAnswers: 3, gap: 5 },

  { threat: "Big Minions",    metaLevel: 7, yourAnswers: 4, gap: 3 },

  { threat: "Burn/Face",      metaLevel: 6, yourAnswers: 2, gap: 4 },

  { threat: "Graveyard/Res",  metaLevel: 5, yourAnswers: 4, gap: 1 },

  { threat: "Secret/Tricks",  metaLevel: 4, yourAnswers: 1, gap: 3 },

  { threat: "Weapons",        metaLevel: 3, yourAnswers: 0, gap: 3 },

];



function GapLabel(props: any) {

  const { x, y, width, value } = props;

  if (!value || value <= 0) return null;

  const cx = x + width + 8;

  const cy = y + 10;

  return (

    <g>

      <rect x={cx - 4} y={cy - 10} width={36} height={16} rx={8} fill="rgba(239,71,111,0.15)" stroke="#EF476F" />

      <text x={cx + 14} y={cy + 2} textAnchor="middle" fontSize={11} fill="#EF476F" fontWeight={700}>

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

      className="w-full"

      style={{

        height,

        background: "#f2ead6",               // parchment-like base

        border: "1px solid #d9cbb0",

        borderRadius: 12,

        padding: 12,

      }}

    >

      <div style={{ fontWeight: 800, margin: "4px 0 8px 4px" }}>{title}</div>

      <ResponsiveContainer width="100%" height="85%">

        <BarChart

          data={data}

          layout="vertical"

          margin={{ top: 8, right: 24, bottom: 8, left: 120 }}

        >

          <CartesianGrid strokeDasharray="4 4" opacity={0.4} />

          <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} />

          <YAxis dataKey="threat" type="category" tick={{ fontSize: 12 }} width={110} />

          <Tooltip

            formatter={(v: number, name: string) => [v, name === "metaLevel" ? "Meta Threat" : name === "yourAnswers" ? "Your Answers" : "Gap"]}

            labelStyle={{ fontWeight: 700 }}

          />

          <Legend

            verticalAlign="top"

            align="right"

            wrapperStyle={{ fontSize: 12 }}

            payload={[

              { id: "Meta Threat",   type: "square", value: "Meta Threat",   color: "#6c757d" },

              { id: "Your Answers",  type: "square", value: "Your Answers",  color: "#3A86FF" },

            ]}

          />



          {/* Threat level (how common/powerful in meta) */}

          <Bar dataKey="metaLevel" name="Meta Threat" fill="#6c757d" radius={[0, 6, 6, 0]} maxBarSize={18} />



          {/* Your answers (how many tech cards you run) */}

          <Bar dataKey="yourAnswers" name="Your Answers" fill="#3A86FF" radius={[0, 6, 6, 0]} maxBarSize={18}>

            <LabelList dataKey="gap" content={<GapLabel />} />

          </Bar>

        </BarChart>

      </ResponsiveContainer>



      {/* Tiny caption with plain words */}

      <div style={{ fontSize: 12, marginTop: 6, opacity: 0.9 }}>

        <b>Read it fast:</b> Gray = how common the problem is. Blue = how many answers you have.

        If you see a red "GAP", add a tech card for that row.

      </div>

    </div>

  );

}
