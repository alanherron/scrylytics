// components/DeckCompositionChart.tsx

"use client";

import React, { useCallback, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip,
  Legend
} from "recharts";

export type CompositionSubtype = {
  name: string;
  value: number;
  fill?: string;
};

export type CompositionData = {
  name: string;
  value: number;
  fill?: string;
  subtypes?: CompositionSubtype[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={12}
        fontWeight={600}
      >{`${value} cards`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
        fontSize={10}
      >
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const renderTooltip = (props: any) => {
  const { active, payload } = props;

  if (active && payload && payload.length) {
    const data = payload[0];
    const subtypes: CompositionSubtype[] | undefined = data.payload?.subtypes;
    return (
      <div
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          {`${data.payload.name}: ${data.value} cards`}
        </p>
        <p style={{ margin: 0, color: "#666" }}>
          {`${(data.percent * 100).toFixed(1)}% of deck`}
        </p>
        {Array.isArray(subtypes) && subtypes.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#4a5568", marginBottom: 4 }}>
              Subtype breakdown
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 11, color: "#4a5568" }}>
              {subtypes.map((sub, idx) => (
                <li key={`${sub.name}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: sub.fill || COLORS[idx % COLORS.length],
                    }}
                  />
                  <span style={{ flex: 1 }}>{sub.name}</span>
                  <span>{sub.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default function DeckCompositionChart({
  data,
  height = 400
}: {
  data: CompositionData[];
  height?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const chartHeight = Math.max(240, height - 160);
  const activeSlice = data[activeIndex] ?? null;
  const activeSubtypesSource = activeSlice?.subtypes;
  const activeSubtypes = Array.isArray(activeSubtypesSource) ? activeSubtypesSource : [];
  const subtypeSum = activeSubtypes.reduce((sum, item) => sum + (item.value || 0), 0);
  const subtypeTotal = activeSlice?.value && activeSlice.value > 0 ? activeSlice.value : subtypeSum || 1;

  return (
    <div style={{
      width: "100%",
      height,
      background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      <div style={{
        textAlign: "center",
        marginBottom: 20,
        fontSize: 18,
        fontWeight: 600,
        color: "#2d3748"
      }}>
        Deck Composition
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
        alignItems: "stretch"
      }}>
        <div style={{ height: chartHeight, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="70%"
                innerRadius="45%"
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onClick={onPieEnter}
                {...({ activeIndex, activeShape: renderActiveShape } as any)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value}: {entry.payload?.value || 0}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 16,
          boxShadow: "inset 0 1px 3px rgba(148, 163, 184, 0.2)"
        }}>
          <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: 8 }}>
            {activeSlice ? `${activeSlice.name} breakdown` : "Subtype breakdown"}
          </div>

          {activeSubtypes.length === 0 ? (
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              No subtype details for this category.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeSubtypes.map((subtype, index) => {
                const percent = Math.round(((subtype.value || 0) / subtypeTotal) * 1000) / 10;
                return (
                  <div key={`${subtype.name}-${index}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: 4,
                            backgroundColor: subtype.fill || COLORS[index % COLORS.length]
                          }}
                        />
                        <span style={{ fontSize: 13, color: "#334155" }}>{subtype.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        {subtype.value} cards • {percent.toFixed(1)}%
                      </div>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 4,
                        backgroundColor: "rgba(148, 163, 184, 0.2)",
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, percent))}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${
                            subtype.fill || COLORS[index % COLORS.length]
                          }, rgba(59,130,246,0.4))`,
                          transition: "width 0.3s ease"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
