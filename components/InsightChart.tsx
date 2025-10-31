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
  Area,
  ComposedChart,
  ReferenceLine,
  Cell
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
        return "mana_balance"; // Special mana power balance chart
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

  // Ideal mana curve for comparison
  const idealManaCurve = [1, 2, 4, 3, 2, 1, 0, 0].map((count, mana) => ({ mana, count }));

  const renderChart = () => {
    switch (chartType) {
      case "mana_balance": {
        // Create mana balance data: current vs ideal
        const ideal = [7, 9, 8, 8, 6, 5, 3, 2, 1, 1]; // Ideal mana curve
        const manaBalanceData = data.map((item, index) => {
          const current = item.count;
          const idealCount = ideal[index] || 0;
          const difference = current - idealCount;
          return {
            mana: item.mana,
            current,
            ideal: idealCount,
            balance: difference, // Positive = too many, Negative = too few
            status: difference > 0 ? 'too_many' : difference < 0 ? 'too_few' : 'perfect'
          };
        });

        return (
          <div style={{
            backgroundColor: "#fdf7e3",
            padding: "20px",
            borderRadius: "12px",
            position: "relative",
            minHeight: "400px"
          }}>
            <h3 style={{
              textAlign: "center",
              color: "#92400e",
              fontFamily: "cursive",
              fontSize: "18px",
              marginBottom: "20px",
              fontWeight: "bold"
            }}>
              🎯 Your Deck's Magic Power Balance
            </h3>

            <ComposedChart
              data={manaBalanceData}
              margin={{ top: 60, right: 30, left: 30, bottom: 40 }}
              height={300}
            >
              <CartesianGrid strokeDasharray="2 2" stroke="#d97706" opacity={0.3} />

              {/* Horizontal reference line at y=0 */}
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={2} />

              {/* Mana cost labels on X-axis */}
              <XAxis
                dataKey="mana"
                tick={{ fill: "#92400e", fontSize: 14, fontFamily: "cursive", fontWeight: "bold" }}
                axisLine={{ stroke: "#d97706", strokeWidth: 2 }}
              />

              {/* Balance bars (up for too many, down for too few) */}
              <Bar
                dataKey="balance"
                fill="#10b981"
                stroke="#059669"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
              >
                {manaBalanceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.balance > 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>

              {/* Custom tooltip */}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const balance = data.balance;
                    let message = "";
                    if (balance > 0) {
                      message = `Too many cards here (${balance} extra)`;
                    } else if (balance < 0) {
                      message = `Not enough cards here (${Math.abs(balance)} missing)`;
                    } else {
                      message = "Perfect balance!";
                    }

                    return (
                      <div style={{
                        backgroundColor: "#fef3c7",
                        border: "2px solid #f59e0b",
                        borderRadius: "8px",
                        padding: "12px",
                        fontFamily: "cursive",
                        fontSize: "14px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                          Mana Cost {label}
                        </p>
                        <p style={{ margin: "0 0 4px 0" }}>
                          Current: {data.current} cards
                        </p>
                        <p style={{ margin: "0 0 8px 0" }}>
                          Ideal: {data.ideal} cards
                        </p>
                        <p style={{
                          margin: 0,
                          color: balance > 0 ? "#dc2626" : balance < 0 ? "#dc2626" : "#059669",
                          fontWeight: "bold"
                        }}>
                          {message}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </ComposedChart>

            {/* Blue "gems" (circles) at the bottom with numbers */}
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "8px"
            }}>
              {manaBalanceData.map((item, index) => (
                <div key={index} style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6",
                  border: "3px solid #1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "cursive",
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)"
                }}>
                  {item.mana}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "composite":
        // Special composite view for mana curve analysis
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Bar Chart */}
            <div>
              <h4 style={{
                color: "#7c3aed",
                fontFamily: "cursive",
                fontSize: "16px",
                marginBottom: "10px",
                textAlign: "center"
              }}>
                📊 Current Mana Curve (Bar View)
              </h4>
              <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" opacity={0.3} strokeWidth={1} />
                <XAxis dataKey="mana" tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }} />
                <YAxis tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fef3c7", border: "2px solid #f59e0b", fontFamily: "cursive" }} />
                <Bar dataKey="count" fill="#f59e0b" stroke="#d97706" strokeWidth={2} radius={[8, 8, 0, 0]} {...sketchStyle} />
              </BarChart>
            </div>

            {/* Area Chart Comparison */}
            <div>
              <h4 style={{
                color: "#7c3aed",
                fontFamily: "cursive",
                fontSize: "16px",
                marginBottom: "10px",
                textAlign: "center"
              }}>
                🌊 Mana Curve Comparison (Current vs Ideal)
              </h4>
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" opacity={0.3} strokeWidth={1} />
                <XAxis dataKey="mana" tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }} />
                <YAxis tick={{ fill: "#7c3aed", fontSize: 12, fontFamily: "cursive" }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fef3c7", border: "2px solid #f59e0b", fontFamily: "cursive" }} />
                <Legend wrapperStyle={{ fontFamily: "cursive", fontSize: "12px" }} />

                {/* Current mana curve (area) */}
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  fill="#fecaca"
                  fillOpacity={0.6}
                  strokeWidth={3}
                  name="Current Curve"
                  {...sketchStyle}
                />

                {/* Ideal mana curve (area overlay) */}
                <Area
                  type="monotone"
                  data={idealManaCurve}
                  dataKey="count"
                  stroke="#10b981"
                  fill="#d1fae5"
                  fillOpacity={0.4}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Ideal Curve"
                  {...sketchStyle}
                />
              </AreaChart>
            </div>
          </div>
        );

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
      minHeight: chartType === "composite" ? "600px" : "320px",
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

      <ResponsiveContainer width="100%" height={chartType === "composite" ? "100%" : "280px"}>
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
