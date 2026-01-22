'use client';

import { useMemo } from 'react';
import MetaDrillDownChart from './MetaDrillDownChart';
import { transformToDrillDownData } from './transformMetaData';
import { type ArchetypeStats } from './types';

interface ClassMetaDashboardProps {
  stats: ArchetypeStats[];
  totalDecks?: number;
}

export default function ClassMetaDashboard({ stats, totalDecks = 0 }: ClassMetaDashboardProps) {
  const drillDownData = useMemo(() => {
    const result = transformToDrillDownData(stats, totalDecks);
    if (typeof window !== 'undefined') {
      console.log('ClassMetaDashboard Debug:', {
        statsLength: stats.length,
        totalDecks,
        drillDownDataLength: result.length,
        firstClass: result[0],
      });
    }
    return result;
  }, [stats, totalDecks]);


  return (
    <section
      className="space-y-8 rounded-3xl border border-white/10 p-8"
      style={{
        background: 'linear-gradient(160deg, #0d0d11 0%, #111117 55%, rgba(9,11,17,0.92) 100%)',
      }}
    >
      <div className="mb-8">
        <header className="mb-6 flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/50">
            Interactive Meta Explorer
          </span>
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Ladder Pulse
          </h2>
          <p className="max-w-2xl text-sm text-white/70">
            Explore the competitive meta with interactive drill-down. Click any hero class to see its archetype breakdown.
            Each node shows weekly trend changes in popularity and win-rate, plus sample sizes for statistical relevance.
          </p>
        </header>
        <MetaDrillDownChart data={drillDownData} height={600} />
      </div>
    </section>
  );
}










