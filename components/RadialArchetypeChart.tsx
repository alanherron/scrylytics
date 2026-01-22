'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartGuard } from '@/components/ChartGuard';

type ArchetypeSlice = {
  label: string;
  count: number;
  percent: number;
  color: string;
};

export type RadialClassSlice = {
  name: string;
  label: string;
  color: string;
  total: number;
  globalPercent: number;
  segments: ArchetypeSlice[];
};

type RadialArchetypeChartProps = {
  data: RadialClassSlice[];
  archetypeKeys: string[];
  colorMap: Record<string, string>;
};

type TooltipDatum = RadialClassSlice & Record<string, number>;

type SimpleTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: TooltipDatum }>;
};

function ChartTooltip({ active, payload }: SimpleTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload;
  if (!datum) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/85 px-4 py-3 text-sm text-white/90 shadow-xl backdrop-blur">
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">Class</div>
      <div className="font-semibold" style={{ color: datum.color }}>
        {datum.label}
      </div>
      <div className="mt-1 text-xs text-white/60">
        {datum.total} decks • {datum.globalPercent.toFixed(1)}% of spotlight lists
      </div>
      <div className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">Archetype mix</div>
      <ul className="mt-2 space-y-1 text-xs text-white/80">
        {datum.segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: segment.color }} />
              {segment.label}
            </span>
            <span>
              {segment.count} · {segment.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AngleTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  if (!payload) return null;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#e2e8f0"
      className="text-[11px] font-semibold uppercase tracking-[0.25em]"
    >
      {payload.value}
    </text>
  );
}

export default function RadialArchetypeChart({ data, archetypeKeys, colorMap }: RadialArchetypeChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasDimensions, setHasDimensions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !mounted) return;

    const element = containerRef.current;
    let frame: number | null = null;

    const handleResize = (entry: ResizeObserverEntry) => {
      const { width, height } = entry.contentRect;
      if (frame != null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (width > 0 && height > 0) {
          setHasDimensions(true);
        } else {
          setHasDimensions(false);
        }
      });
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) handleResize(entry);
    });

    observer.observe(element);

    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setHasDimensions(true);
    } else {
      setHasDimensions(false);
    }

    return () => {
      if (frame != null) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [mounted]);

  const chartData: TooltipDatum[] = useMemo(() => {
    return data.map((item) => {
      const record: TooltipDatum = {
        ...item,
      } as TooltipDatum;

      archetypeKeys.forEach((key) => {
        const segment = item.segments.find((seg) => seg.label === key);
        record[key] = segment ? segment.percent : 0;
      });

      return record;
    });
  }, [data, archetypeKeys]);

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <div ref={containerRef} className="chart-wrapper w-full min-w-0" style={{ height: 520 }}>
        {mounted && hasDimensions ? (
          <ChartGuard minHeight={520}>
            <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="35%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              cx="50%"
              cy="50%"
              data={chartData as TooltipDatum[]}
            >
              <PolarAngleAxis dataKey="name" tick={<AngleTick />} tickLine={false} axisLine={false} />
              <PolarRadiusAxis type="number" angle={90} axisLine={false} tick={false} tickLine={false} domain={[0, 100]} />
              {archetypeKeys.map((key) => (
                <RadialBar
                  key={key}
                  dataKey={key}
                  stackId="meta"
                  fill={colorMap[key]}
                  fillOpacity={0.88}
                  isAnimationActive={false}
                  barSize={18}
                  cornerRadius={6}
                />
              ))}
              <Tooltip cursor={false} content={<ChartTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          </ChartGuard>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
            Loading chart…
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-white/70">
        {archetypeKeys.map((key) => (
          <span key={key} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1">
            <span className="h-2 w-2 rounded-full" style={{ background: colorMap[key] }} />
            {key}
          </span>
        ))}
      </div>
    </div>
  );
}
