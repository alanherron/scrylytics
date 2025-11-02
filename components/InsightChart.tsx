"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const DrawRhythmChart = dynamic(() => import("./DrawRhythmChart"), { ssr: false });
const ArcaneBalanceChart = dynamic(
  () => import("./ArcaneBalanceChart").then((mod) => ({ default: mod.ArcaneBalanceChart })),
  { ssr: false },
);
const TechGapsChart = dynamic(() => import("./TechGapsChart"), { ssr: false });
const MatchupPainsChart = dynamic(() => import("./MatchupPainsChart"), { ssr: false });
const ManaPowerCurve = dynamic(
  () => import("./ManaPowerCurve").then((mod) => ({ default: mod.ManaPowerCurve })),
  { ssr: false },
);
const TempoGapsChart = dynamic(() => import("./TempoGapsChart"), { ssr: false });
const HandSizePressureChart = dynamic(() => import("./HandSizePressureChart"), { ssr: false });
const DeckCompositionChart = dynamic(() => import("./DeckCompositionChart"), { ssr: false });

type GenericDatum =
  | { mana: number; count?: number; value?: number; ideal?: number }
  | { turn: number; actual?: number; target?: number; hand?: number }
  | { metric: string; ideal: number; current: number; value?: number }
  | { threat: string; metaLevel: number; yourAnswers: number; gap: number }
  | { matchup: string; score: number; value?: number }
  | { name: string; value: number; fill?: string; subtypes?: Array<{ name: string; value: number; fill?: string }> }
  | Record<string, unknown>;

type Props = {
  issue: string;
  data: GenericDatum[];
};

const palette = {
  grid: "rgba(196, 181, 253, 0.18)",
  text: "#d1cff8",
  bar: "#22d3ee",
  barAlt: "#34d399",
  area: "#c4b5fd",
};

const ChartShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 shadow-glow">{children}</div>
);

const EmptyState = () => (
  <ChartShell>
    <div className="flex h-full items-center justify-center text-sm text-white/60">No data available for this chart.</div>
  </ChartShell>
);

const GenericBar = ({ data }: { data: GenericDatum[] }) => {
  const simplified = data.map((item, index) => ({
    label:
      (item as any).mana ??
      (item as any).turn ??
      (item as any).metric ??
      (item as any).matchup ??
      (item as any).name ??
      `#${index + 1}`,
    value:
      (item as any).count ??
      (item as any).value ??
      (item as any).score ??
      (item as any).hand ??
      (item as any).gap ??
      0,
  }));

  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={simplified}>
          <CartesianGrid stroke={palette.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: palette.text, fontSize: 12 }}
            tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <YAxis
            tick={{ fill: palette.text, fontSize: 12 }}
            tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const value = payload[0]?.value ?? 0;
              return (
                <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
                  <div className="font-semibold text-white">{label}</div>
                  <div className="mt-1 text-white/70">Value: {value}</div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ color: "rgba(244,243,255,0.75)", fontSize: 12 }} />
          <Bar dataKey="value" name="Value" radius={[8, 8, 0, 0]} fill={palette.bar} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
};

const GenericArea = ({ data }: { data: GenericDatum[] }) => {
  const simplified = data.map((item, index) => ({
    label:
      (item as any).mana ??
      (item as any).turn ??
      (item as any).metric ??
      (item as any).name ??
      `#${index + 1}`,
    value:
      (item as any).count ??
      (item as any).value ??
      (item as any).hand ??
      (item as any).gap ??
      0,
  }));

  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={simplified}>
          <defs>
            <linearGradient id="insightArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette.area} stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgba(196, 181, 253, 0)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.grid} />
          <XAxis
            dataKey="label"
            tick={{ fill: palette.text, fontSize: 12 }}
            tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <YAxis
            tick={{ fill: palette.text, fontSize: 12 }}
            tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const value = payload[0]?.value ?? 0;
              return (
                <div className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
                  <div className="font-semibold text-white">{label}</div>
                  <div className="mt-1 text-white/70">Value: {value}</div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={palette.area}
            fill="url(#insightArea)"
            strokeWidth={2}
            dot={{ r: 3, stroke: "#fff", strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
};

const getChartType = (issue: string) => {
  switch (issue) {
    case "MANA_CURVE_SKEW":
      return "mana_power_curve";
    case "DRAW_INCONSISTENCY":
      return "draw_rhythm";
    case "ROLE_MISMATCH":
      return "arcane_balance";
    case "WEAK_SYNERGY_CHAINS":
      return "area";
    case "TECH_GAPS":
      return "tech_gaps";
    case "MATCHUP_PAINS":
      return "matchup_pains";
    case "HAND_SIZE_PRESSURE":
      return "hand_size_pressure";
    case "BOARD_TEMPO_GAPS":
      return "tempo_curve";
    case "DECK_COMPOSITION":
      return "deck_composition";
    default:
      return "bar";
  }
};

export default function InsightChart({ issue, data }: Props) {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState />;
  }

  const chartType = getChartType(issue);

  switch (chartType) {
    case "mana_power_curve": {
      return (
        <ManaPowerCurve
          data={data as any}
          showIdeal
          title="Mana Power Curve"
          caption="Positive bars show mana surpluses; negatives highlight holes in the curve."
          height={400}
        />
      );
    }
    case "draw_rhythm":
      return <DrawRhythmChart data={data as any} height={320} />;
    case "arcane_balance": {
      const balanceData = (data as any[]).map((item) => ({
        metric: item.metric || item.role || "Unknown",
        ideal: typeof item.ideal === "number" ? (item.ideal > 1 ? Math.round(item.ideal) : Math.round(item.ideal * 100)) : 0,
        current:
          typeof item.current === "number"
            ? item.current > 1
              ? Math.round(item.current)
              : Math.round(item.current * 100)
            : 0,
      }));
      return <ArcaneBalanceChart data={balanceData} height={360} />;
    }
    case "tech_gaps":
      return <TechGapsChart data={data as any} height={360} title="Tech Coverage vs. Meta Threats" />;
    case "matchup_pains":
      return <MatchupPainsChart data={data as any} height={320} title="Matchup Pain Index" />;
    case "hand_size_pressure":
      return <HandSizePressureChart data={data as any} height={340} title="Hand Size Pressure" />;
    case "tempo_curve":
      return <TempoGapsChart data={data as any} height={360} />;
    case "deck_composition":
      return <DeckCompositionChart data={data as any} height={400} />;
    case "area":
      return <GenericArea data={data} />;
    default:
      return <GenericBar data={data} />;
  }
}
