"use client";

import React from "react";
import dynamic from "next/dynamic";

// lazy-load the entire chart component on the client
const ManaCurveChart = dynamic(
  () => import("./ManaCurveChartClient"),
  {
    ssr: false,
    loading: () => <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading chart…</div>
  }
);

type Props = { issue: string; data: Array<{ mana: number; count: number }> };

export default function InsightChart({ issue, data }: Props) {
  // Guard for empty/undefined data
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data for chart.</div>;
  }

  return (
    <div style={{ width: "100%", minHeight: 300 }}>
      <ManaCurveChart data={data} />
    </div>
  );
}
