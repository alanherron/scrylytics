'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

const data = [
  { mana: 1, ideal: 2, actual: 1.5 },
  { mana: 2, ideal: 3, actual: 3.8 },
  { mana: 3, ideal: 3, actual: 2.4 },
  { mana: 4, ideal: 2, actual: 1.2 },
  { mana: 5, ideal: 1.5, actual: 1.0 },
  { mana: 6, ideal: 1.0, actual: 1.6 },
  { mana: 7, ideal: 0.8, actual: 1.2 },
  { mana: 8, ideal: 0.6, actual: 1.1 },
  { mana: 9, ideal: 0.4, actual: 0.9 },
  { mana: 10, ideal: 0.2, actual: 0.5 },
];

export default function ManaPowerCurve() {
  return (
    <div className="w-full h-[400px] bg-[#0d0d11] p-4 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-2">Mana Power Curve</h2>
      <p className="text-sm text-gray-400 mb-4">
        Compare your deck's mana distribution (cyan) against the ideal curve (violet).
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            dataKey="mana"
            label={{ value: 'Mana Cost', position: 'insideBottom', dy: 10, fill: '#aaa' }}
            tick={{ fill: '#aaa' }}
          />
          <YAxis
            label={{ value: 'Card Count', angle: -90, position: 'insideLeft', fill: '#aaa' }}
            tick={{ fill: '#aaa' }}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{ background: '#14141a', border: '1px solid #333' }}
            labelStyle={{ color: '#aaa' }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#ccc' }} />
          <Area
            type="monotone"
            dataKey={(d) => d.actual - d.ideal}
            stroke="none"
            fillOpacity={0.3}
            fill="url(#colorDeviation)"
            baseValue={0}
          />
          <defs>
            <linearGradient id="colorDeviation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFFF" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FF4E50" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#b48bff"
            strokeWidth={3}
            dot={false}
            name="Ideal Curve"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#00e0ff"
            strokeWidth={3}
            dot={{ r: 4, fill: '#00e0ff', stroke: '#0d0d11', strokeWidth: 2 }}
            name="Your Deck"
          />
          <ReferenceLine y={0} stroke="#333" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
