"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area
} from "recharts";

type Props = { issue: string; data: Array<{ mana: number; count: number }> };

export default function InsightChart({ issue, data }: Props) {
  // Guard for empty/undefined data
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data for chart.</div>;
  }

  // Hand-drawn sketch styling
  const sketchStyle = {
    filter: "url(#sketchFilter)",
    strokeWidth: 2,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  const getChartType = (issue: string) => {
    switch (issue) {
      case "MANA_CURVE_SKEW":
        return "bar";
      case "DRAW_INCONSISTENCY":
        return "line";
      case "ROLE_MISMATCH":
        return "radar";
      case "WEAK_SYNERGY_CHAINS":
        return "area";
      case "TECH_GAPS":
        return "bar";
      case "MATCHUP_PAINS":
        return "radar";
      case "HAND_SIZE_PRESSURE":
        return "line";
      case "BOARD_TEMPO_GAPS":
        return "area";
      default:
        return "bar";
    }
  };

  const chartType = getChartType(issue);

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#8b5cf6"
              opacity={0.3}
              strokeWidth={1}
            />
            <XAxis
              dataKey="mana"
              tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }}
              axisLine={{ stroke: "#a855f7", strokeWidth: 2 }}
              tickLine={{ stroke: "#a855f7" }}
            />
            <YAxis
              tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }}
              allowDecimals={false}
              axisLine={{ stroke: "#a855f7", strokeWidth: 2 }}
              tickLine={{ stroke: "#a855f7" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fef3c7",
                border: "2px solid #f59e0b",
                borderRadius: "8px",
                fontFamily: "cursive"
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: "#d97706" }}
              {...sketchStyle}
            />
          </LineChart>
        );

      case "radar":
        const radarData = data.map(item => ({
          subject: item.role || item.subject || `Item ${data.indexOf(item) + 1}`,
          value: item.value || item.count || 0,
          fullMark: Math.max(...data.map(d => d.value || d.count || 0)) + 2
        }));
        return (
          <RadarChart data={radarData}>
            <PolarGrid stroke="#8b5cf6" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#7c3aed", fontSize: 11, fontFamily: "cursive" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'dataMax + 2']}
              tick={{ fill: "#7c3aed", fontSize: 10, fontFamily: "cursive" }}
            />
            <Radar
              name="Card Count"
              dataKey="value"
              stroke="#f59e0b"
              fill="#fef3c7"
              fillOpacity={0.6}
              strokeWidth={2}
              {...sketchStyle}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fef3c7",
                border: "2px solid #f59e0b",
                borderRadius: "8px",
                fontFamily: "cursive"
              }}
            />
          </RadarChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#8b5cf6"
              opacity={0.3}
              strokeWidth={1}
            />
            <XAxis
              dataKey="mana"
              tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }}
              axisLine={{ stroke: "#a855f7", strokeWidth: 2 }}
              tickLine={{ stroke: "#a855f7" }}
            />
            <YAxis
              tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }}
              allowDecimals={false}
              axisLine={{ stroke: "#a855f7", strokeWidth: 2 }}
              tickLine={{ stroke: "#a855f7" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fef3c7",
                border: "2px solid #f59e0b",
                borderRadius: "8px",
                fontFamily: "cursive"
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#f59e0b"
              fill="#fef3c7"
              fillOpacity={0.8}
              strokeWidth={2}
              {...sketchStyle}
            />
          </AreaChart>
        );

      default: // bar chart
        return (
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#8b5cf6"
              opacity={0.3}
              strokeWidth={1}
            />
            <XAxis
              dataKey="mana"
              tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }}
              axisLine={{ stroke: "#a855f7", strokeWidth: 2 }}
              tickLine={{ stroke: "#a855f7" }}
            />
            <YAxis
              tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }}
              allowDecimals={false}
              axisLine={{ stroke: "#a855f7", strokeWidth: 2 }}
              tickLine={{ stroke: "#a855f7" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fef3c7",
                border: "2px solid #f59e0b",
                borderRadius: "8px",
                fontFamily: "cursive"
              }}
            />
            <Legend />
            <Bar
              dataKey="count"
              name="Cards"
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth={2}
              radius={[8, 8, 0, 0]}
              {...sketchStyle}
            />
          </BarChart>
        );
    }
  };

  return (
    <div style={{
      width: "100%",
      height: "320px",
      position: "relative",
      backgroundColor: "#fefefe",
      borderRadius: "12px",
      padding: "10px",
      boxShadow: "0 4px 12px rgba(139, 92, 246, 0.15)"
    }}>
      {/* Hand-drawn sketch filter */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="sketchFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>

      {/* Hand-drawn border effect */}
      <div style={{
        position: "absolute",
        top: "5px",
        left: "5px",
        right: "5px",
        bottom: "5px",
        border: "2px solid #8b5cf6",
        borderRadius: "8px",
        pointerEvents: "none",
        filter: "url(#sketchFilter)"
      }} />
    </div>
  );
}
