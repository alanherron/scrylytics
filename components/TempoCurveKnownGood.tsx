'use client';



import * as React from 'react';

import {

  ResponsiveContainer,

  ComposedChart,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  Area,

  Line,

  Bar,

  ReferenceLine,

} from 'recharts';



type Point = { mana: number; count: number; value: number; ideal: number };



const SAMPLE: Point[] = [

  { mana: 0, count: 0, value: -1, ideal: 1 },

  { mana: 1, count: 2, value: 0,  ideal: 2 },

  { mana: 2, count: 4, value: 1,  ideal: 3 },

  { mana: 3, count: 5, value: 2,  ideal: 3.5 },

  { mana: 4, count: 4, value: 2.2,ideal: 3.2 },

  { mana: 5, count: 3, value: 2.0,ideal: 3.0 },

  { mana: 6, count: 2, value: 1.6,ideal: 2.6 },

  { mana: 7, count: 1, value: 1.2,ideal: 2.2 },

];



export default function TempoCurveKnownGood({

  data = SAMPLE,

  height = 340,

}: { data?: Point[]; height?: number }) {

  const maxCount = Math.max(1, ...data.map(d => d.count));

  const minPower = Math.min(0, ...data.map(d => Math.min(d.value, d.ideal)));

  const maxPower = Math.max(2, ...data.map(d => Math.max(d.value, d.ideal)));



  return (

    <div style={{ width: '100%', height, border: '1px solid #e5e7eb', borderRadius: 12, padding: 8, background: '#fff' }}>

      <ResponsiveContainer>

        <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 12 }}>

          <CartesianGrid stroke="#eee" vertical={false} />

          <XAxis dataKey="mana" tick={{ fontSize: 12 }} label={{ value: 'Mana (Turn)', position: 'insideBottom', offset: -4 }} />

          <YAxis

            yAxisId="power"

            domain={[Math.floor(minPower - 0.5), Math.ceil(maxPower + 0.5)]}

            tick={{ fontSize: 12 }}

            label={{ value: 'Power', angle: -90, position: 'insideLeft' }}

          />

          <YAxis

            yAxisId="count"

            orientation="right"

            domain={[0, Math.max(5, Math.ceil(maxCount + 1))]}

            tick={{ fontSize: 12 }}

            label={{ value: 'Card Count', angle: 90, position: 'insideRight' }}

          />

          <Tooltip />

          <ReferenceLine y={0} yAxisId="power" stroke="#e5e7eb" />



          {/* Bars: card count */}

          <Bar

            yAxisId="count"

            dataKey="count"

            name="Cards at this mana"

            barSize={16}

            fill="#93c5fd"         // light blue

            radius={[4, 4, 0, 0]}

          />



          {/* Area: ideal power */}

          <Area

            yAxisId="power"

            type="monotone"

            dataKey="ideal"

            name="Ideal power"

            stroke="#9ca3af"        // gray stroke

            fill="#d1d5db"          // gray fill

            fillOpacity={0.45}

            strokeWidth={2}

            dot={{ r: 2 }}

            activeDot={{ r: 4 }}

          />



          {/* Line: your power */}

          <Line

            yAxisId="power"

            type="monotone"

            dataKey="value"

            name="Your power"

            stroke="#2563eb"        // blue line

            strokeWidth={3}

            dot={{ r: 3 }}

            activeDot={{ r: 5 }}

          />

        </ComposedChart>

      </ResponsiveContainer>

    </div>

  );

}
