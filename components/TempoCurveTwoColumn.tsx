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



type Point = {

  mana: number;

  count: number;

  value: number;

  ideal: number;

};



export interface TempoCurveTwoColumnProps {

  data: Point[];

  height?: number;

  powerDomain?: [number, number];

  countDomain?: [number, number];

}



const fmt = (n: number) => (Math.round(n * 10) / 10).toString();



function gapSummary(value: number, ideal: number) {

  const gap = value - ideal;

  if (gap >= 1) return `You’re ahead here. Nice!`;

  if (gap >= 0.25) return `Slightly ahead—keep it up.`;

  if (gap > -0.25) return `About right for this turn.`;

  if (gap > -1) return `A bit behind—consider a play here.`;

  return `Behind—add a card that helps at this cost.`;

}



const TooltipContent: React.FC<{ active?: boolean; payload?: any[]; label?: any }> = ({

  active,

  payload,

  label,

}) => {

  if (!active || !payload || payload.length === 0) return null;

  const pCount = payload.find((p) => p.dataKey === 'count');

  const pValue = payload.find((p) => p.dataKey === 'value');

  const pIdeal = payload.find((p) => p.dataKey === 'ideal');



  const mana = label;

  const count = pCount?.value ?? 0;

  const value = typeof pValue?.value === 'number' ? pValue.value : undefined;

  const ideal = typeof pIdeal?.value === 'number' ? pIdeal.value : undefined;

  const gap = value !== undefined && ideal !== undefined ? value - ideal : 0;



  return (

    <div style={{

      background: 'rgba(255,255,255,0.96)',

      border: '1px solid #e5e7eb',

      borderRadius: 8,

      padding: '10px 12px',

      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',

      maxWidth: 260,

    }}>

      <div style={{ fontWeight: 700, marginBottom: 6 }}>Turn {mana}</div>

      <div style={{ display: 'grid', gap: 4 }}>

        <div><span style={{ color: '#6b7280' }}>Cards here: </span><strong>{count}</strong></div>

        {value !== undefined && (

          <div><span style={{ color: '#6b7280' }}>Your power: </span><strong>{fmt(value)}</strong></div>

        )}

        {ideal !== undefined && (

          <div><span style={{ color: '#6b7280' }}>Ideal power: </span><strong>{fmt(ideal)}</strong></div>

        )}

        {value !== undefined && ideal !== undefined && (

          <div><span style={{ color: '#6b7280' }}>Gap: </span><strong>{fmt(gap)}</strong></div>

        )}

      </div>

      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e5e7eb', fontSize: 13 }}>

        <div style={{ fontWeight: 600, marginBottom: 2 }}>What this means</div>

        <div>{value !== undefined && ideal !== undefined ? gapSummary(value, ideal) : '—'}</div>

      </div>

    </div>

  );

};



export default function TempoCurveTwoColumn({

  data,

  height = 360,

  powerDomain,

  countDomain,

}: TempoCurveTwoColumnProps) {

  const maxCount = Math.max(1, ...data.map((d) => d.count ?? 0));

  const minPower = Math.min(0, ...data.map((d) => Math.min(d.value ?? 0, d.ideal ?? 0)));

  const maxPower = Math.max(2, ...data.map((d) => Math.max(d.value ?? 0, d.ideal ?? 0)));



  const _powerDomain = powerDomain ?? [Math.floor(minPower - 0.5), Math.ceil(maxPower + 0.5)];

  const _countDomain = countDomain ?? [0, Math.max(5, Math.ceil(maxCount + 1))];


  // Legend toggles

  const [showCount, setShowCount] = React.useState(true);

  const [showIdeal, setShowIdeal] = React.useState(true);

  const [showValue, setShowValue] = React.useState(true);



  const Swatch: React.FC<{ color: string; label: string; on?: boolean; onToggle: () => void }> = ({

    color, label, on, onToggle,

  }) => (

    <button

      type="button"

      onClick={onToggle}

      style={{

        display: 'flex',

        alignItems: 'center',

        gap: 8,

        width: '100%',

        textAlign: 'left',

        padding: '6px 8px',

        borderRadius: 8,

        border: '1px solid #e5e7eb',

        background: on ? '#ffffff' : '#f9fafb',

        cursor: 'pointer',

      }}

      aria-pressed={on}

    >

      <span

        aria-hidden

        style={{

          width: 14, height: 14, borderRadius: 3,

          background: color, opacity: on ? 1 : 0.35, flex: '0 0 auto',

        }}

      />

      <span style={{ fontSize: 13, color: on ? '#111827' : '#6b7280' }}>{label}</span>

    </button>

  );



  return (

    <div

      style={{

        display: 'grid',

        gridTemplateColumns: '1fr 280px',

        gap: 16,

        alignItems: 'start',

      }}

    >

      {/* Left: Chart (fills horizontally) */}

      <div style={{

        width: '100%',

        height,

        minWidth: 0, // important so ResponsiveContainer can shrink

        border: '1px solid #e5e7eb',

        borderRadius: 12,

        padding: 8,

        background: 'linear-gradient(0deg, #ffffff, #ffffff)',

      }}>

        <ResponsiveContainer>

          <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 16 }}>

            <CartesianGrid stroke="#eee" vertical={false} />

            <XAxis

              dataKey="mana"

              tick={{ fontSize: 12 }}

              label={{ value: 'Mana (Turn)', position: 'insideBottom', offset: -4 }}

            />

            <YAxis

              yAxisId="power"

              domain={_powerDomain}

              tick={{ fontSize: 12 }}

              label={{ value: 'Power', angle: -90, position: 'insideLeft' }}

            />

            <YAxis

              yAxisId="count"

              orientation="right"

              domain={_countDomain}

              tick={{ fontSize: 12 }}

              label={{ value: 'Card Count', angle: 90, position: 'insideRight' }}

            />

            <Tooltip content={<TooltipContent />} />

            <ReferenceLine y={0} yAxisId="power" stroke="#e5e7eb" />



            {showCount && (

              <Bar

                yAxisId="count"

                dataKey="count"

                name="Cards at this cost"

                barSize={16}

                fill="#93c5fd"

                radius={[4, 4, 0, 0]}

              />

            )}



            {showIdeal && (

              <Area

                yAxisId="power"

                type="monotone"

                dataKey="ideal"

                name="Ideal power"

                stroke="#9ca3af"

                fill="#d1d5db"

                fillOpacity={0.45}

                strokeWidth={2}

                dot={{ r: 2 }}

                activeDot={{ r: 4 }}

              />

            )}



            {showValue && (

              <Line

                yAxisId="power"

                type="monotone"

                dataKey="value"

                name="Your power"

                stroke="#2563eb"

                strokeWidth={3}

                dot={{ r: 3 }}

                activeDot={{ r: 5 }}

              />

            )}

          </ComposedChart>

        </ResponsiveContainer>

      </div>



      {/* Right: Sidebar legend & quick summary */}

      <aside style={{

        border: '1px solid #e5e7eb',

        borderRadius: 12,

        padding: 12,

        background: '#ffffff',

        position: 'sticky',

        top: 8,

      }}>

        <div style={{ fontWeight: 700, marginBottom: 8 }}>Chart Legend</div>

        <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>

          <Swatch color="#93c5fd" label="Cards at this cost (bars)" on={showCount} onToggle={() => setShowCount(v => !v)} />

          <Swatch color="#d1d5db" label="Ideal power (shaded)" on={showIdeal} onToggle={() => setShowIdeal(v => !v)} />

          <Swatch color="#2563eb" label="Your power (line)" on={showValue} onToggle={() => setShowValue(v => !v)} />

        </div>



        <div style={{ fontWeight: 700, marginBottom: 6 }}>How to read</div>

        <ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 6, fontSize: 13, color: '#374151' }}>

          <li><strong>Bars</strong>: how many cards cost that much.</li>

          <li><strong>Gray area</strong>: the "ideal" power shape.</li>

          <li><strong>Blue line</strong>: your deck's power at each turn.</li>

          <li>Blue below gray? Add help at that mana.</li>

          <li>Blue above gray? You're strong there.</li>

        </ul>

      </aside>



      {/* Responsive: stack columns on small screens */}

      <style>{`

        @media (max-width: 900px) {

          div[style*="grid-template-columns"] {

            grid-template-columns: 1fr;

          }

          aside {

            position: static;

          }

        }

      `}</style>

    </div>

  );

}



/* Example usage:



<TempoCurveTwoColumn

  data={[

    { mana: 0, count: 0, value: -1, ideal: 1 },

    { mana: 1, count: 2, value: 0,  ideal: 2 },

    { mana: 2, count: 4, value: 1,  ideal: 3 },

    { mana: 3, count: 5, value: 2,  ideal: 3.5 },

    { mana: 4, count: 4, value: 2.2,ideal: 3.2 },

    { mana: 5, count: 3, value: 2.4,ideal: 3.0 },

    { mana: 6, count: 2, value: 2.6,ideal: 2.8 },

    { mana: 7, count: 1, value: 2.7,ideal: 2.6 },

  ]}

/>



*/
