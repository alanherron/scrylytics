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
  Legend
} from "recharts";

type Props = { issue: string; data: Array<{ mana: number; count: number }> };

export default function InsightChart({ issue, data }: Props) {
  // Guard for empty/undefined data
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data for chart.</div>;
  }

  // Create a gradient for the bars
  const gradientId = "manaCurveGradient";

  return (
    <div style={{ width: "100%", height: "280px", position: "relative" }}>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="2 2"
            stroke="#f3f4f6"
            opacity={0.8}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="mana"
            tick={{ fill: "#6b7280", fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: "#e5e7eb", strokeWidth: 2 }}
            tickLine={{ stroke: "#e5e7eb" }}
            label={{
              value: "Mana Cost",
              position: "insideBottom",
              offset: -10,
              style: { textAnchor: "middle", fill: "#374151", fontWeight: 500 }
            }}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 13, fontWeight: 500 }}
            allowDecimals={false}
            axisLine={{ stroke: "#e5e7eb", strokeWidth: 2 }}
            tickLine={{ stroke: "#e5e7eb" }}
            label={{
              value: "Card Count",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#374151", fontWeight: 500 }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              padding: "12px",
              fontSize: "14px"
            }}
            labelStyle={{
              color: "#374151",
              fontWeight: 600,
              marginBottom: "4px"
            }}
            itemStyle={{
              color: "#3b82f6",
              fontWeight: 500
            }}
            formatter={(value: any, name: string) => [
              `${value} cards`,
              "Count"
            ]}
            labelFormatter={(label) => `Mana Cost: ${label}`}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "15px",
              fontSize: "14px",
              fontWeight: 500
            }}
            iconType="rect"
          />
          <Bar
            dataKey="count"
            name="Cards"
            fill={`url(#${gradientId})`}
            radius={[6, 6, 0, 0]}
            stroke="#1e40af"
            strokeWidth={1}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
