'use client';

import { useMemo } from 'react';
import { type ArchetypeStats } from './types';

type MetaOverviewProps = {
  stats: ArchetypeStats[];
  accentColor: string;
  glowColor: string;
};

export default function MetaOverview({ stats, accentColor, glowColor }: MetaOverviewProps) {
  const { topFiveShare, topArchetypes } = useMemo(() => {
    const topSorted = [...stats].sort((a, b) => b.popularityPct - a.popularityPct);
    const topFive = topSorted.slice(0, 5);
    const totalTopFive = topFive.reduce((sum, item) => sum + item.popularityPct, 0);
    const topThree = topSorted.slice(0, 3);
    return {
      topFiveShare: totalTopFive,
      topArchetypes: topThree,
    };
  }, [stats]);

  return (
    <section
      className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-glow"
      style={{
        boxShadow: `0 30px 80px -50px ${glowColor}, inset 0 0 20px -14px ${glowColor}`,
        background: 'linear-gradient(140deg, rgba(13,13,17,0.85) 0%, rgba(17,17,23,0.95) 100%)',
      }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/50">
            Meta Overview
          </span>
          <h2 className="font-display text-3xl text-white">Ladder Pulse</h2>
          <p className="text-sm text-white/70">
            The latest scrape surfaces the most-played archetypes across the ladder. Hover any class tile to see how its archetypes split and tap to inspect win rate bubbles.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Meta Diversity</p>
            <p className="mt-1 text-3xl font-semibold text-white">
              Top 5 archetypes = {topFiveShare.toFixed(1)}%
            </p>
            <p className="text-xs text-white/60">Remaining field holds {(100 - topFiveShare).toFixed(1)}% of lists</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Top Archetypes</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {topArchetypes.map((item, idx) => (
                <li key={item.class + item.archetype} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs font-semibold"
                      style={{ color: accentColor }}
                    >
                      #{idx + 1}
                    </span>
                    <span>
                      <span className="text-white/70">{item.class}</span>
                      <span className="mx-1 text-white/30">/</span>
                      <span className="text-white">{item.archetype}</span>
                    </span>
                  </span>
                  <span className="tabular-nums text-white/70">{item.popularityPct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}















