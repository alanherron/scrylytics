// components/DeckCompositionChart.tsx

"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip,
  Legend,
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

const COLORS = ["#c4b5fd", "#22d3ee", "#34d399", "#f97316", "#f472b6", "#fde047", "#5eead4", "#fca5a5"];

const ActiveShape = (props: any) => {
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
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;
  const mx = cx + (outerRadius + 22) * cos;
  const my = cy + (outerRadius + 22) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 14;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={4} textAnchor="middle" fill="rgba(244,243,255,0.9)" className="font-medium">
        {payload.name}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        fill={fill}
        opacity={0.45}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="rgba(244,243,255,0.85)" fontSize={12} fontWeight={600}>
        {value} cards
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={16}
        textAnchor={textAnchor}
        fill="rgba(244,243,255,0.6)"
        fontSize={11}
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

const CompositionTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  const subtypes: CompositionSubtype[] | undefined = data.payload?.subtypes;

  return (
    <div className="min-w-[200px] rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white/85 shadow-lg backdrop-blur">
      <div className="font-semibold text-white">{data.payload.name}</div>
      <div className="mt-1 text-white/70">{data.value} cards · {(data.percent * 100).toFixed(1)}%</div>
      {Array.isArray(subtypes) && subtypes.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-white/50">Subtype breakdown</div>
          <ul className="space-y-1">
            {subtypes.map((sub, idx) => (
              <li key={`${sub.name}-${idx}`} className="flex items-center justify-between gap-3 text-white/75">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: sub.fill || COLORS[idx % COLORS.length] }}
                  />
                  {sub.name}
                </span>
                <span>{sub.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function DeckCompositionChart({
  data,
  height = 400,
}: {
  data: CompositionData[];
  height?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        fill: item.fill ?? COLORS[index % COLORS.length],
      })),
    [data],
  );

  const activeSlice = chartData[activeIndex] ?? null;
  const subtypes = Array.isArray(activeSlice?.subtypes) ? activeSlice!.subtypes : [];
  const subtotal = subtypes.reduce((sum, item) => sum + (item.value || 0), 0) || 1;

  return (
    <div className="h-full w-full" style={{ minHeight: height }}>
      <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/10 bg-black/30 p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg text-white/90">Deck Composition</h4>
            <p className="text-xs text-white/60">Hover a slice to see subtype coverage.</p>
          </div>
          {activeSlice && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              Dominant: <span className="font-semibold text-white">{activeSlice.name}</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),280px]">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  // @ts-expect-error recharts typings do not expose activeIndex
                  activeIndex={activeIndex}
                  activeShape={ActiveShape}
                  data={chartData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill ?? COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CompositionTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ color: "rgba(244,243,255,0.75)", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Subtype mix</div>
            {subtypes.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">No subtype data provided for this slice.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                {subtypes.map((sub, idx) => {
                  const value = sub.value || 0;
                  const percent = Math.max(0, Math.round((value / subtotal) * 100));

                  return (
                    <li key={`${sub.name}-${idx}`} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block size-2.5 rounded-full"
                            style={{ backgroundColor: sub.fill || COLORS[idx % COLORS.length] }}
                          />
                          {sub.name}
                        </span>
                        <span className="text-white/60">{value} cards</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/10">
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${percent}%`,
                            background: sub.fill || COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
