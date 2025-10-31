"use client";

import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, AreaChart, Area, LabelList
} from "recharts";

export type DeckIssueType =
  | "MANA_CURVE_SKEW"
  | "DRAW_INCONSISTENCY"
  | "ROLE_MISMATCH"
  | "WEAK_SYNERGY_CHAINS"
  | "TECH_GAPS"
  | "MATCHUP_PAINS"
  | "HAND_SIZE_PRESSURE"
  | "BOARD_TEMPO_GAPS";

export interface InsightChartProps {
  issue: DeckIssueType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  caption?: string;
  title?: string;
}

/* ---------- Parchment Frame ---------- */

const ParchmentFrame: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="relative p-6 rounded-2xl" style={{
    background:
      `radial-gradient(1200px 800px at 20% 0%, rgba(255,255,240,0.96), rgba(245,236,210,0.96)),
       radial-gradient(900px 600px at 80% 100%, rgba(250,244,225,0.96), rgba(233,219,186,0.99))`,
    boxShadow: "inset 0 0 0 1px rgba(115,74,18,0.25), 0 10px 30px rgba(0,0,0,0.15)",
    borderRadius: "1.25rem"
  }}>
    {/* Hand-drawn jitter + grain */}
    <svg width="0" height="0" className="absolute">
      <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.6"/>
      </filter>
    </svg>
    {title && (
      <div className="mb-3">
        <h3 className="text-lg font-bold" style={{ color: "#5c4320", filter: "url(#rough)" }}>{title}</h3>
        <div className="h-1 w-24 bg-[#c7a96f] rounded-full" />
      </div>
    )}
    <div style={{ filter: "url(#rough)" }}>{children}</div>
  </div>
);

/* ---------- Chart Renderers ---------- */

const ManaCurveChart = ({ data }: { data: { mana:number; count:number }[] }) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#b08b4a" opacity={0.45}/>
      <XAxis dataKey="mana" tick={{ fill: "#5c4320" }} />
      <YAxis tick={{ fill: "#5c4320" }} />
      <Tooltip contentStyle={{ background:"#fff8e6", border:"1px solid #c7a96f" }} />
      <Bar dataKey="count" fill="#8c6d2f" radius={[6,6,0,0]}>
        <LabelList dataKey="count" position="top" fill="#5c4320" />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const LineMetric = ({
  data, xKey, yKey, label
}: { data: any[]; xKey: string; yKey: string; label?: string }) => (
  <ResponsiveContainer width="100%" height={280}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#b08b4a" opacity={0.45}/>
      <XAxis dataKey={xKey} tick={{ fill: "#5c4320" }} />
      <YAxis tick={{ fill: "#5c4320" }} />
      <Tooltip contentStyle={{ background:"#fff8e6", border:"1px solid #c7a96f" }} />
      <Legend />
      <Line type="monotone" name={label || yKey} dataKey={yKey} stroke="#8c6d2f" strokeWidth={2} dot={{ r:2 }}/>
    </LineChart>
  </ResponsiveContainer>
);

const RoleRadar = ({ data }: { data: { role:string; value:number }[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RadarChart data={data}>
      <PolarGrid stroke="#b08b4a" opacity={0.45}/>
      <PolarAngleAxis dataKey="role" tick={{ fill:"#5c4320" }}/>
      <PolarRadiusAxis tick={{ fill:"#5c4320" }}/>
      <Radar dataKey="value" stroke="#8c6d2f" fill="#8c6d2f" fillOpacity={0.4}/>
    </RadarChart>
  </ResponsiveContainer>
);

const AreaInsight = ({ data, xKey, yKey, label }: { data:any[]; xKey:string; yKey:string; label?:string }) => (
  <ResponsiveContainer width="100%" height={280}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#b08b4a" opacity={0.45}/>
      <XAxis dataKey={xKey} tick={{ fill:"#5c4320" }}/>
      <YAxis tick={{ fill:"#5c4320" }}/>
      <Tooltip contentStyle={{ background:"#fff8e6", border:"1px solid #c7a96f" }}/>
      <Legend />
      <Area type="monotone" name={label || yKey} dataKey={yKey} stroke="#8c6d2f" fill="#8c6d2f" fillOpacity={0.35}/>
    </AreaChart>
  </ResponsiveContainer>
);

/* ---------- Main Switch ---------- */

const titleMap: Record<DeckIssueType,string> = {
  MANA_CURVE_SKEW: "Mana Curve Distribution",
  DRAW_INCONSISTENCY: "Card Draw Over Time",
  ROLE_MISMATCH: "Role Distribution",
  WEAK_SYNERGY_CHAINS: "Synergy Flow Strength",
  TECH_GAPS: "Tech Coverage (Counters/Removal)",
  MATCHUP_PAINS: "Matchup Winrate by Archetype",
  HAND_SIZE_PRESSURE: "Average Hand Size by Turn",
  BOARD_TEMPO_GAPS: "Board Tempo/Presence by Turn"
};

export const InsightChart: React.FC<InsightChartProps> = ({ issue, data, caption, title }) => {
  const renderChart = () => {
    switch (issue) {
      case "MANA_CURVE_SKEW":       return <ManaCurveChart data={data as any} />;
      case "DRAW_INCONSISTENCY":    return <LineMetric data={data} xKey="turn" yKey="cards" label="Cards Drawn" />;
      case "ROLE_MISMATCH":         return <RoleRadar data={data as any} />;
      case "WEAK_SYNERGY_CHAINS":   return <AreaInsight data={data} xKey="turn" yKey="chainStrength" label="Chain Strength" />;
      case "TECH_GAPS":             return <ManaCurveChart data={data as any} />;
      case "MATCHUP_PAINS":         return <LineMetric data={data} xKey="archetype" yKey="winrate" label="Winrate %" />;
      case "HAND_SIZE_PRESSURE":    return <AreaInsight data={data} xKey="turn" yKey="handSize" label="Avg Hand Size" />;
      case "BOARD_TEMPO_GAPS":      return <RoleRadar data={data as any} />;
      default:                      return <p style={{ color:"#5c4320" }}>No data available.</p>;
    }
  };

  return (
    <ParchmentFrame title={title || titleMap[issue]}>
      {renderChart()}
      {caption && (
        <p className="mt-3 text-sm italic text-[#5c4320]" style={{ filter:"url(#rough)" }}>
          {caption}
        </p>
      )}
    </ParchmentFrame>
  );
};

export default InsightChart;
