// components/TempoGapsChart.tsx

"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  Bar,
} from "recharts";

type TempoPoint = {
  mana: number;
  count: number;
  ideal?: number;
  value?: number;
};

type Props = {
  data: TempoPoint[];
  height?: number;
};

const strokeStyle = {
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

function TempoTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const current = payload.find((item: any) => item.dataKey === "count")?.value ?? 0;
  const ideal = payload.find((item: any) => item.dataKey === "idealLine")?.value ?? 0;
  const gap = current - ideal;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        border: "1px solid rgba(148,163,184,0.4)",
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 12,
        color: "#1f2937",
        boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Turn {label}</div>
      <div>
        <span style={{ color: "#2563eb", fontWeight: 600 }}>Board</span>: {current}
      </div>
      <div>
        <span style={{ color: "#ef4444", fontWeight: 600 }}>Ideal</span>: {ideal}
      </div>
      <div style={{ marginTop: 4, fontWeight: 600, color: gap >= 0 ? "#16a34a" : "#ef4444" }}>
        {gap >= 0 ? `+${gap} tempo` : `${gap} tempo`}
      </div>
    </div>
  );
}

export default function TempoGapsChart({ data, height = 360 }: Props) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      idealLine: point.ideal ?? point.count,
      gap: (point.count ?? 0) - (point.ideal ?? 0),
    }));
  }, [data]);

  const maxValue = Math.max(
    6,
    ...chartData.map((d) => Math.max(d.count ?? 0, d.idealLine ?? 0))
  );

  return (
    <div
      style={{
        width: "100%",
        height,
        background: "#f9fafb",
        borderRadius: 16,
        border: "1px solid rgba(148,163,184,0.25)",
        padding: 16,
        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 16, right: 24, bottom: 16, left: 16 }}>
          <defs>
            <linearGradient id="tempoArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.75} />
              <stop offset="95%" stopColor="#bfdbfe" stopOpacity={0.15} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.3)" />

          <XAxis
            dataKey="mana"
            tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: "rgba(148,163,184,0.6)" }}
            tickLine={{ stroke: "rgba(148,163,184,0.6)" }}
          />

          <YAxis
            domain={[0, Math.ceil(maxValue + 1)]}
            tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: "rgba(148,163,184,0.6)" }}
            tickLine={{ stroke: "rgba(148,163,184,0.6)" }}
            allowDecimals={false}
          />

          <ReferenceLine
            y={0}
            stroke="rgba(148,163,184,0.6)"
            strokeDasharray="2 2"
            strokeWidth={1}
          />

          <Bar dataKey="gap" barSize={10} radius={[4, 4, 4, 4]}>
            {chartData.map((entry, idx) => (
              <Cell
                key={`gap-${idx}`}
                fill={entry.gap >= 0 ? "rgba(34,197,94,0.35)" : "rgba(248,113,113,0.35)"}
                stroke={entry.gap >= 0 ? "rgba(34,197,94,0.7)" : "rgba(248,113,113,0.7)"}
              />
            ))}
          </Bar>

          <Area
            type="monotone"
            dataKey="count"
            fill="url(#tempoArea)"
            stroke="#2563eb"
            strokeWidth={3}
            name="Board"
            {...strokeStyle}
          />

          <Line
            type="monotone"
            dataKey="idealLine"
            stroke="#ef4444"
            strokeDasharray="6 4"
            strokeWidth={2}
            dot={{ r: 3, fill: "#ef4444" }}
            name="Ideal"
            {...strokeStyle}
          />

          <Tooltip content={<TempoTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
