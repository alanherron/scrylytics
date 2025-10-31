"use client";

import React from "react";
import dynamic from "next/dynamic";

// lazy-load Recharts only on the client
const ReBarChart = dynamic(
  async () => {
    const r = await import("recharts");
    return function BarChartWrapped(props: any) {
      const { data } = props;
      return (
        <r.ResponsiveContainer width="100%" height={280}>
          <r.BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <r.CartesianGrid strokeDasharray="3 3" />
            <r.XAxis dataKey="mana" />
            <r.YAxis allowDecimals={false} />
            <r.Tooltip />
            <r.Legend />
            <r.Bar dataKey="count" name="Cards" />
          </r.BarChart>
        </r.ResponsiveContainer>
      );
    };
  },
  { ssr: false, loading: () => <div style={{ height: 280 }}>Loading chart…</div> }
);

type Props = { issue: string; data: Array<{ mana: number; count: number }> };

export default function InsightChart({ issue, data }: Props) {
  // Guard for empty/undefined data
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data for chart.</div>;
  }

  return (
    <div style={{ width: "100%", minHeight: 300 }}>
      <ReBarChart data={data} />
    </div>
  );
}
