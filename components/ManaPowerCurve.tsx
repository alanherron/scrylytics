// components/ManaPowerCurve.tsx

import React from "react";

import {

  ResponsiveContainer,

  BarChart,

  Bar,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  ReferenceLine,

  Line,

  Legend,

  Customized,

} from "recharts";



/**

 * Data shape:

 *  - mana: number (1..10+)

 *  - value: number (positive = surplus, negative = deficit vs ideal)

 *  - ideal?: number (optional, used to draw a ghost "ideal curve" line)

 */

export type ManaDatum = {

  mana: number;

  value: number;

  ideal?: number;

};



type Props = {

  data: ManaDatum[];

  /**

   * Show ghost ideal curve line if `true` AND `ideal` is provided on data items

   */

  showIdeal?: boolean;

  /**

   * Chart title displayed above

   */

  title?: string;

  /**

   * Short caption displayed below

   */

  caption?: string;

  /**

   * Height of the chart container

   */

  height?: number;

};



/** Parchment-like inline texture */

const parchmentStyle: React.CSSProperties = {

  background:

    "radial-gradient(120% 80% at 50% 10%, rgba(139, 115, 85, 0.08) 0%, rgba(248, 243, 231, 1) 40%)",

  border: "1px solid rgba(120, 90, 60, 0.25)",

  boxShadow:

    "0 1px 0 rgba(0,0,0,0.03) inset, 0 10px 30px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.3) inset",

  borderRadius: 14,

};



const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (

  <div

    style={{

      fontWeight: 700,

      letterSpacing: 0.3,

      fontSize: 18,

      color: "#3c2f25",

      padding: "10px 14px 0 14px",

    }}

  >

    {children}

  </div>

);



const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => (

  <div

    style={{

      fontSize: 12,

      color: "#5a4a3e",

      padding: "6px 14px 12px 14px",

      opacity: 0.9,

    }}

  >

    {children}

  </div>

);



/** Custom tooltip with simple kid-friendly language */

const SimpleTooltip = ({

  active,

  payload,

  label,

}: {

  active?: boolean;

  payload?: any[];

  label?: any;

}) => {

  if (!active || !payload || !payload.length) return null;

  const point = payload.find((p) => p.dataKey === "value");

  const v = typeof point?.value === "number" ? point.value : 0;

  const sign = v > 0 ? "+" : "";

  const verdict = v > 0 ? "Too many" : v < 0 ? "Needs more" : "Just right";

  return (

    <div

      style={{

        background: "rgba(255,255,255,0.95)",

        border: "1px solid rgba(0,0,0,0.1)",

        borderRadius: 8,

        padding: "8px 10px",

        fontSize: 12,

        color: "#2d261e",

      }}

    >

      <div style={{ fontWeight: 700 }}>Mana {label}</div>

      <div>

        Balance: <b>{sign + v}</b>

      </div>

      <div style={{ marginTop: 2, opacity: 0.95 }}>{verdict} cards here</div>

    </div>

  );

};



/**

 * Draws centered blue "gems" (squares) with white numbers at y=0 for each mana step.

 * Uses Customized + chart scales to position shapes precisely.

 */

const CenterGems: React.FC<{ xScale: any; yScale: any; data: ManaDatum[] }> = ({

  xScale,

  yScale,

  data,

}) => {

  if (!xScale || !yScale) return null;



  // y=0 pixel for the midline

  const y0 = yScale(0);

  const size = 28; // square size

  const half = size / 2;



  return (

    <>

      {data.map((d) => {

        // x position is at the center of the category band for this mana

        const xCenter =

          (typeof xScale.bandwidth === "function"

            ? xScale(d.mana) + xScale.bandwidth() / 2

            : xScale(d.mana)) ?? 0;



        return (

          <g key={`gem-${d.mana}`}>

            {/* Drop shadow */}

            <rect

              x={xCenter - half + 2}

              y={y0 - half + 2}

              width={size}

              height={size}

              rx={6}

              fill="rgba(0,0,0,0.15)"

            />

            {/* Gem square */}

            <rect

              x={xCenter - half}

              y={y0 - half}

              width={size}

              height={size}

              rx={6}

              fill="#2E86FF"

              stroke="#1658b8"

              strokeWidth={1.5}

            />

            {/* Number */}

            <text

              x={xCenter}

              y={y0 + 4}

              textAnchor="middle"

              fontSize={14}

              fontWeight={800}

              fill="white"

            >

              {d.mana}

            </text>

          </g>

        );

      })}

    </>

  );

};



export const ManaPowerCurve: React.FC<Props> = ({

  data,

  showIdeal = true,

  title = "Mana Power Curve",

  caption = "Blue squares mark each mana cost. Bars show where you have too many (up) or need more (down).",

  height = 380,

}) => {

  // Build nice domain padding so bars have room above/below

  const maxAbs = Math.max(

    2,

    ...data.map((d) => Math.abs(d.value ?? 0)),

    ...data.map((d) => Math.abs(d.ideal ?? 0))

  );

  const yDomain = [-maxAbs - 1, maxAbs + 1];



  // Build a distinct color scheme with gradients for up/down

  // (Placed in an SVG defs block so <Bar fill="url(#id)"> can use it)

  const gradientDefs = (

    <defs>

      <linearGradient id="surplusGradient" x1="0" y1="1" x2="0" y2="0">

        <stop offset="0%" stopColor="#6ac36a" stopOpacity={0.75} />

        <stop offset="100%" stopColor="#2e7d32" stopOpacity={0.95} />

      </linearGradient>

      <linearGradient id="deficitGradient" x1="0" y1="0" x2="0" y2="1">

        <stop offset="0%" stopColor="#e57373" stopOpacity={0.9} />

        <stop offset="100%" stopColor="#b71c1c" stopOpacity={0.75} />

      </linearGradient>

    </defs>

  );



  // Split positive/negative into two series so each can have its own gradient

  const posSeries = data.map((d) => ({

    mana: d.mana,

    pos: d.value > 0 ? d.value : 0,

  }));

  const negSeries = data.map((d) => ({

    mana: d.mana,

    neg: d.value < 0 ? d.value : 0,

  }));



  // Legend config (simple, keeps text minimal)

  const legendPayload = [

    { id: "surplus", type: "square", value: "Too many", color: "#2e7d32" },

    { id: "deficit", type: "square", value: "Needs more", color: "#b71c1c" },

    ...(showIdeal

      ? [{ id: "ideal", type: "line", value: "Ideal curve", color: "#6d5b47" }]

      : []),

  ];



  return (

    <div style={{ ...parchmentStyle, padding: 8 }}>

      <Title>{title}</Title>

      <div style={{ width: "100%", height }}>

        <ResponsiveContainer>

          <BarChart

            data={data}

            margin={{ top: 20, right: 24, bottom: 24, left: 16 }}

          >

            {gradientDefs}

            <CartesianGrid

              stroke="rgba(60, 47, 37, 0.15)"

              vertical={false}

              strokeDasharray="3 3"

            />

            <XAxis

              dataKey="mana"

              tick={{ fill: "#4a3d33", fontSize: 12, fontWeight: 700 }}

              axisLine={{ stroke: "rgba(60,47,37,0.35)" }}

              tickLine={{ stroke: "rgba(60,47,37,0.35)" }}

              label={{

                value: "Mana",

                position: "insideBottom",

                offset: -6,

                style: { fill: "#4a3d33", fontWeight: 700 },

              }}

            />

            <YAxis

              domain={yDomain as any}

              ticks={[-6, -4, -2, 0, 2, 4, 6]}

              tick={{ fill: "#4a3d33", fontSize: 12 }}

              axisLine={{ stroke: "rgba(60,47,37,0.35)" }}

              tickLine={{ stroke: "rgba(60,47,37,0.35)" }}

            />

            {/* Midline */}

            <ReferenceLine y={0} stroke="#6d5b47" strokeOpacity={0.7} />



            {/* Subtle labels at edges */}

            <ReferenceLine

              y={yDomain[1]}

              label={{

                value: "Surplus",

                position: "insideTop",

                fill: "#2e7d32",

                fontWeight: 700,

              }}

              strokeOpacity={0}

            />

            <ReferenceLine

              y={yDomain[0]}

              label={{

                value: "Deficit",

                position: "insideBottom",

                fill: "#b71c1c",

                fontWeight: 700,

              }}

              strokeOpacity={0}

            />



            {/* Centered blue gem squares */}

            <Customized

              component={({ xAxisMap, yAxisMap }: any) => {

                const xScale = xAxisMap?.["0"]?.scale;

                const yScale = yAxisMap?.["0"]?.scale;

                return <CenterGems xScale={xScale} yScale={yScale} data={data} />;

              }}

            />



            {/* Positive (surplus) bars */}

            <Bar

              data={posSeries}

              dataKey="pos"

              isAnimationActive

              animationDuration={600}

              animationEasing="ease-out"

              radius={[6, 6, 0, 0]}

              fill="url(#surplusGradient)"

            />



            {/* Negative (deficit) bars */}

            <Bar

              data={negSeries}

              dataKey="neg"

              isAnimationActive

              animationDuration={600}

              animationEasing="ease-out"

              radius={[0, 0, 6, 6]}

              fill="url(#deficitGradient)"

            />



            {/* Optional "ideal curve" ghost line */}

            {showIdeal && (

              <Line

                type="monotone"

                dataKey="ideal"

                stroke="#6d5b47"

                strokeDasharray="5 5"

                dot={{ r: 2, stroke: "#6d5b47", fill: "#6d5b47" }}

                strokeWidth={2}

                opacity={0.9}

                activeDot={false}

              />

            )}



            <Tooltip content={<SimpleTooltip />} />



            <Legend

              verticalAlign="middle"

              align="right"

              layout="vertical"

              payload={legendPayload as any}

              wrapperStyle={{

                background: "rgba(255,255,255,0.65)",

                border: "1px solid rgba(0,0,0,0.08)",

                borderRadius: 8,

                padding: "6px 8px",

              }}

            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      <Caption>{caption}</Caption>

    </div>

  );

};



// ---------- Example usage (you can delete below this line in your app) ----------

export const ExampleManaPowerCurve: React.FC = () => {

  const data: ManaDatum[] = [

    { mana: 1, value: -1, ideal: 0 },

    { mana: 2, value: -1, ideal: 1 },

    { mana: 3, value: 2, ideal: 1 },

    { mana: 4, value: 3, ideal: 1 },

    { mana: 5, value: -2, ideal: 1 },

    { mana: 6, value: -3, ideal: 0 },

    { mana: 7, value: 0, ideal: 0 },

    { mana: 8, value: 1, ideal: 0 },

    { mana: 9, value: -1, ideal: 0 },

    { mana: 10, value: 0, ideal: 0 },

  ];



  return (

    <div style={{ padding: 16 }}>

      <ManaPowerCurve

        data={data}

        showIdeal

        title="Mana Power Curve"

        caption="Blue squares are the mana costs. Green bars = too many; red bars = needs more."

        height={420}

      />

    </div>

  );

};
