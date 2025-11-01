import * as React from "react";

import {

  ResponsiveContainer,

  ComposedChart,

  CartesianGrid,

  XAxis,

  YAxis,

  Tooltip,

  Legend,

  Bar,

  ReferenceLine,

} from "recharts";



/**

 * Data shape:

 * - turn: number (1..N)

 * - hand: number (actual cards in hand at end of turn)

 * - target: number (goal cards in hand at end of turn; commonly 5)

 *

 * You can supply your own `data` prop. A sensible default is provided.

 */

type Point = { turn: number; hand: number; target: number };



export type DrawRhythmChartProps = {

  title?: string;

  data?: Point[];

  /** Goal line color */

  goalColor?: string;

  /** Bar color */

  barColor?: string;

  /** Maximum y-axis (cards in hand). If not set, auto from data. */

  maxY?: number;

  /** Minimum y-axis (cards in hand). Defaults to 0. */

  minY?: number;

};



const DEFAULT_DATA: Point[] = [

  { turn: 1, hand: 3, target: 5 },

  { turn: 2, hand: 2, target: 5 },

  { turn: 3, hand: 4, target: 5 },

  { turn: 4, hand: 3, target: 5 },

  { turn: 5, hand: 6, target: 5 },

  { turn: 6, hand: 2, target: 5 },

  { turn: 7, hand: 4, target: 5 },

  { turn: 8, hand: 3, target: 5 },

];



const SimpleTooltip = ({ active, payload, label }: any) => {

  if (!active || !payload?.length) return null;

  const hand = payload.find((p: any) => p.dataKey === "hand")?.value as number;

  const target = payload[0]?.payload?.target as number;

  const diff = hand - target;



  return (

    <div

      style={{

        background: "rgba(255,255,255,0.95)",

        border: "1px solid #ddd",

        borderRadius: 6,

        padding: "8px 10px",

        fontSize: 12,

      }}

    >

      <div style={{ fontWeight: 700, marginBottom: 4 }}>Turn {label}</div>

      <div>Cards in hand: <b>{hand}</b></div>

      <div>Goal: <b>{target}</b></div>

      <div style={{ color: diff >= 0 ? "#2e7d32" : "#c62828" }}>

        {diff === 0

          ? "On target"

          : diff > 0

          ? `+${diff} (a bit too many)`

          : `${diff} (a bit too few)`}

      </div>

    </div>

  );

};



export default function DrawRhythmChart({

  title = "Draw Rhythm (Cards in Hand by Turn)",

  data = DEFAULT_DATA,

  goalColor = "#555",

  barColor = "#4f8df5",

  maxY,

  minY = 0,

}: DrawRhythmChartProps) {

  // Determine Y bounds if not provided

  const computedMax =

    maxY ??

    Math.max(

      7,

      ...data.map((d) => Math.max(d.hand, d.target))

    );



  // We keep the legend language super simple

  const legendPayload = [

    { value: "Cards in hand", type: "square", color: barColor, id: "hand" },

    { value: "Goal line", type: "line", color: goalColor, id: "target" },

  ];



  return (

    <div

      style={{

        width: "100%",

        height: 340,

        background:

          "linear-gradient(0deg, rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('/parchment-texture.png')",

        backgroundSize: "cover",

        border: "1px solid #e6dfc8",

        borderRadius: 10,

        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",

        padding: 12,

      }}

    >

      <div

        style={{

          fontWeight: 800,

          fontSize: 16,

          margin: "4px 8px 8px",

        }}

      >

        {title}

      </div>



      <ResponsiveContainer width="100%" height="85%">

        <ComposedChart data={data} margin={{ top: 8, right: 18, bottom: 8, left: 12 }}>

          <CartesianGrid stroke="#eae5d6" strokeDasharray="3 3" />

          <XAxis

            dataKey="turn"

            tick={{ fontSize: 12 }}

            label={{ value: "Turn", position: "insideBottom", offset: -2, fontSize: 12 }}

          />

          <YAxis

            domain={[minY, computedMax]}

            allowDecimals={false}

            tick={{ fontSize: 12 }}

            label={{ value: "Cards in hand", angle: -90, position: "insideLeft", fontSize: 12 }}

          />

          <Tooltip content={<SimpleTooltip />} />

          <Legend

            verticalAlign="top"

            align="right"

            payload={legendPayload as any}

            wrapperStyle={{ fontSize: 12 }}

          />

          {/* Bars = actual hand size */}

          <Bar

            dataKey="hand"

            name="Cards in hand"

            fill={barColor}

            radius={[4, 4, 0, 0]}

          />

          {/* Reference line = goal hand size (pulled from the first point) */}

          <ReferenceLine

            y={data[0]?.target ?? 5}

            stroke={goalColor}

            strokeDasharray="6 6"

            label={{

              position: "right",

              value: "Goal",

              fill: goalColor,

              fontSize: 12,

            }}

          />

        </ComposedChart>

      </ResponsiveContainer>



      {/* Simple helper strip with plain language */}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, padding: "0 6px" }}>

        <span

          style={{

            display: "inline-block",

            width: 10,

            height: 10,

            background: barColor,

            borderRadius: 2,

            marginRight: 4,

          }}

        />

        <span style={{ fontSize: 12, color: "#333" }}>Bars = how many cards you actually had.</span>

        <span style={{ marginLeft: 10, borderTop: `2px dashed ${goalColor}`, width: 20 }} />

        <span style={{ fontSize: 12, color: "#333" }}>Dashed line = the goal number of cards.</span>

      </div>

    </div>

  );

}
