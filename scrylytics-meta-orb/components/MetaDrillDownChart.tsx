'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ResponsiveContainer, Treemap, Cell, Tooltip } from 'recharts';

const CLASS_COLOR_MAP: Record<string, string> = {
  'DEATHKNIGHT': '#6e7680',
  'DEMONHUNTER': '#5e8b7e',
  'DRUID': '#c98f44',
  'HUNTER': '#9dc41a',
  'MAGE': '#4aa3ff',
  'PALADIN': '#f2c94c',
  'PRIEST': '#d6dde7',
  'ROGUE': '#b48c73',
  'SHAMAN': '#0090be',
  'WARLOCK': '#7b2c8c',
  'WARRIOR': '#c24c3e',
  'MONK': '#80ed99',
};

export interface ArchetypeData {
  name: string;
  popularityPct: number;
  winRatePct: number;
  popularityDelta: number;
  winRateDelta: number;
  sampleSize: number;
}

export interface MetaDrillDownData {
  class: string;
  popularityPct: number;
  winRatePct: number;
  popularityDelta: number;
  winRateDelta: number;
  sampleSize: number;
  archetypes: ArchetypeData[];
}

interface MetaDrillDownChartProps {
  data: MetaDrillDownData[];
  height?: number;
}

interface ChartNode {
  name: string;
  value: number;
  class?: string;
  archetype?: string;
  popularityPct: number;
  winRatePct: number;
  popularityDelta: number;
  winRateDelta: number;
  sampleSize: number;
  isClass: boolean;
  fill?: string;
  archetypes?: ArchetypeData[];
}

/* ---------------- RULE ENGINE ---------------- */
function useChartContainerGuard(minWidth = 280, minHeight = 320) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setReady(true);
        setSize({ width, height });
      } else {
        setReady(false);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const enforcedStyle = {
    width: '100%',
    height: size.height > 0 ? size.height : minHeight,
    minWidth,
    minHeight,
  };

  return { ref, ready, enforcedStyle };
}
/* ------------------------------------------------ */

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartNode;
  onClick?: (data: ChartNode) => void;
}

const CustomContent = ({ x, y, width, height, payload, onClick }: CustomContentProps) => {
  const data = payload;
  if (!data) return null;
  const renderX = x ?? 0;
  const renderY = y ?? 0;
  const renderWidth = width ?? 0;
  const renderHeight = height ?? 0;
  
  if (renderWidth <= 0 || renderHeight <= 0) return null;
  
  const isClass = data.isClass;
  const minSize = Math.min(renderWidth, renderHeight);
  const canShowLabel = minSize > 50;

  return (
    <g>
      <rect
        x={renderX}
        y={renderY}
        width={renderWidth}
        height={renderHeight}
        fill={data.fill ?? '#4aa3ff'}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={2}
        rx={6}
        style={{ 
          cursor: isClass ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isClass) {
            onClick?.(data);
          }
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.85';
          e.currentTarget.style.strokeWidth = '3';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.strokeWidth = '2';
        }}
      />
      
      {canShowLabel && (
        <text
          x={renderX + renderWidth / 2}
          y={renderY + renderHeight / 2}
          textAnchor="middle"
          fill="rgba(255,255,255,0.98)"
          fontSize={Math.min(14, minSize / 6)}
          fontWeight="600"
          className="pointer-events-none"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {data.name}
        </text>
      )}
      
      {isClass && canShowLabel && (
        <text
          x={renderX + renderWidth / 2}
          y={renderY + renderHeight - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize={Math.min(9, minSize / 12)}
          className="pointer-events-none"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          Click to drill down
        </text>
      )}
    </g>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartNode }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-white/10 bg-black/95 px-4 py-3 text-xs text-white/90 shadow-xl backdrop-blur">
      <div className="font-semibold text-white text-sm mb-2">{data.name}</div>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-white/60">Popularity</span>
          <span className="font-semibold text-white">{data.popularityPct.toFixed(2)}%</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-white/60">Win Rate</span>
          <span className="font-semibold text-white">{data.winRatePct.toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
          <span className="text-white/60">Sample Size</span>
          <span className="font-semibold text-white">{data.sampleSize.toLocaleString()} games</span>
        </div>
      </div>
    </div>
  );
};

export default function MetaDrillDownChart({ data, height = 600 }: MetaDrillDownChartProps) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'classes' | 'archetypes'>('classes');
  const { ref, ready, enforcedStyle } = useChartContainerGuard(280, height);

  const chartData = useMemo<ChartNode[]>(() => {
    if (data.length === 0) return [];

    if (viewMode === 'archetypes' && selectedClass) {
      const classData = data.find((d) => d.class === selectedClass);
      if (!classData) return [];

      return classData.archetypes
        .filter((arch) => arch.popularityPct > 0)
        .map((arch) => ({
          name: arch.name,
          value: Math.max(0.1, arch.popularityPct),
          class: selectedClass,
          archetype: arch.name,
          popularityPct: arch.popularityPct,
          winRatePct: arch.winRatePct,
          popularityDelta: arch.popularityDelta,
          winRateDelta: arch.winRateDelta,
          sampleSize: arch.sampleSize,
          isClass: false,
          fill: CLASS_COLOR_MAP[selectedClass] ?? '#4aa3ff',
        }));
    }

    return data
      .filter((c) => c.popularityPct > 0)
      .map((c) => ({
        name: c.class,
        value: Math.max(0.1, c.popularityPct),
        class: c.class,
        popularityPct: c.popularityPct,
        winRatePct: c.winRatePct,
        popularityDelta: c.popularityDelta,
        winRateDelta: c.winRateDelta,
        sampleSize: c.sampleSize,
        isClass: true,
        fill: CLASS_COLOR_MAP[c.class] ?? '#4aa3ff',
        archetypes: c.archetypes,
      }));
  }, [data, selectedClass, viewMode]);

  const handleNodeClick = useCallback(
    (node: ChartNode) => {
      if (node.isClass && viewMode === 'classes' && node.class) {
        setSelectedClass(node.class);
        setViewMode('archetypes');
      }
    },
    [viewMode]
  );

  const handleBack = useCallback(() => {
    setSelectedClass(null);
    setViewMode('classes');
  }, []);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="flex h-full items-center justify-center text-white/60">
          No meta data available.
        </div>
      </div>
    );
  }

  const currentClass = selectedClass ? data.find((d) => d.class === selectedClass) : null;

  return (
    <div className="w-full space-y-4">
      {/* Breadcrumb / Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {viewMode === 'archetypes' && selectedClass && (
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Classes
              </button>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CLASS_COLOR_MAP[selectedClass] ?? '#4aa3ff' }} />
                <span className="text-sm font-semibold text-white">{selectedClass}</span>
                <span className="text-sm text-white/60">
                  ({currentClass?.archetypes.length ?? 0} archetypes)
                </span>
              </div>
            </>
          )}
          {viewMode === 'classes' && <div className="text-sm text-white/60">Click a class to view its archetypes</div>}
        </div>
      </div>

      {/* Chart Container (guarded) */}
      <div
        ref={ref}
        className="rounded-2xl border border-white/10 bg-black/30 p-6 flex items-center justify-center"
        style={enforcedStyle}
      >
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={chartData as unknown as Record<string, unknown>[]}
              dataKey="value"
              stroke="#ffffff"
              content={<CustomContent onClick={handleNodeClick} />}
              animationDuration={300}
            >
              <Tooltip content={<CustomTooltip />} />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill ?? '#4aa3ff'} stroke="#ffffff" strokeWidth={1} />
              ))}
            </Treemap>
          </ResponsiveContainer>
        ) : (
          <div className="text-white/40 text-sm animate-pulse">Loading chart container…</div>
        )}
      </div>
    </div>
  );
}

