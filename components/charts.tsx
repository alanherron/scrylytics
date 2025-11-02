'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export function Sparkline({ color='#f59e0b' }) {
  const data = Array.from({ length: 16 }, (_, i) => ({ x:i+1, y:48 + Math.sin(i/2.3)*6 + (i>8?2:0) }));
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false}/>
        <XAxis dataKey="x" stroke="rgba(255,255,255,0.35)" tick={{ fontSize:12 }}/>
        <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize:12 }}/>
        <Tooltip contentStyle={{ background:'var(--bg)', border:'1px solid rgba(255,255,255,0.1)' }}/>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({ color='#f59e0b' }) {
  const data = [{k:'0-1',v:4},{k:'2',v:6},{k:'3',v:7},{k:'4',v:5},{k:'5',v:3}];
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false}/>
        <XAxis dataKey="k" stroke="rgba(255,255,255,0.35)" tick={{ fontSize:12 }}/>
        <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize:12 }}/>
        <Tooltip contentStyle={{ background:'var(--bg)', border:'1px solid rgba(255,255,255,0.1)' }}/>
        <Bar dataKey="v" fill={color} radius={[8,8,0,0]}/>
      </BarChart>
    </ResponsiveContainer>
  );
}
