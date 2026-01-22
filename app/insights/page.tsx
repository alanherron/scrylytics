'use client';

import React, { useMemo, useState } from 'react';
import HeroSigil from '@/components/HeroSigil';
import InsightChart from '@/components/InsightChart';
import { PREBUILT_DECKS, analyzeDeck, type InsightResult } from '@/lib/ai/insightEngine';
import { ELEMENTS } from '@/lib/theme';

const getChartType = (issue: string) => {
  switch (issue) {
    case 'MANA_CURVE_SKEW':
      return 'mana_power_curve';
    case 'DRAW_INCONSISTENCY':
      return 'draw_rhythm';
    case 'ROLE_MISMATCH':
      return 'arcane_balance';
    case 'WEAK_SYNERGY_CHAINS':
      return 'area';
    case 'TECH_GAPS':
      return 'tech_gaps';
    case 'MATCHUP_PAINS':
      return 'matchup_pains';
    case 'HAND_SIZE_PRESSURE':
      return 'hand_size_pressure';
    case 'BOARD_TEMPO_GAPS':
      return 'tempo_curve';
    case 'DECK_COMPOSITION':
      return 'deck_composition';
    default:
      return 'bar';
  }
};

const getDisplayTitle = (issue: string) => {
  switch (issue) {
    case 'DRAW_INCONSISTENCY':
      return 'Draw Rhythm';
    case 'MANA_CURVE_SKEW':
      return 'Mana Curve Analysis';
    case 'ROLE_MISMATCH':
      return 'Arcane Balance';
    case 'WEAK_SYNERGY_CHAINS':
      return 'Synergy Analysis';
    case 'TECH_GAPS':
      return 'Tech Coverage';
    case 'MATCHUP_PAINS':
      return 'Matchup Analysis';
    case 'HAND_SIZE_PRESSURE':
      return 'Hand Size Pressure';
    case 'BOARD_TEMPO_GAPS':
      return 'Tempo Curve Analysis';
    case 'DECK_COMPOSITION':
      return 'Deck Composition';
    default:
      return issue.replace(/_/g, ' ');
  }
};

interface AnalysisState {
  analysis: InsightResult | null;
  error: string | null;
}

export default function InsightsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedDeck = PREBUILT_DECKS[selectedIndex];

  const { analysis, error }: AnalysisState = useMemo(() => {
    try {
      const insight = analyzeDeck(selectedDeck);
      return { analysis: insight, error: null };
    } catch {
      return { analysis: null, error: 'Analysis failed. Please try a different preset.' };
    }
  }, [selectedDeck]);

  const theme = ELEMENTS.aether;
  const chartType = analysis ? getChartType(analysis.issue) : null;

  return (
    <div className="px-6 pb-16 pt-12">
      <section className="mx-auto max-w-6xl text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <HeroSigil color={theme.hue} glow={theme.glow} variant="aether" />
          <div className="text-aether-200/80 text-xs font-semibold uppercase tracking-[0.35em]">Insight Lab</div>
          <h1 className="font-display text-4xl text-aether-200 sm:text-5xl">AI Deck Diagnostics</h1>
          <p className="text-white/70">
            Explore how the oracle evaluates different archetypes. Swap between presets to watch the analysis, grades,
            and charts adapt in real time.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-[340px,1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-glow">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-aether-200/70">Deck preset</div>
                <h2 className="mt-2 font-display text-xl text-white">{selectedDeck.name}</h2>
              </div>
              {selectedDeck.archetype && (
                <span className="rounded-full border border-aether-400/40 bg-aether-400/10 px-3 py-1 text-xs font-medium text-aether-100">
                  {selectedDeck.archetype}
                </span>
              )}
            </div>
            <select
              value={selectedIndex}
              onChange={(event) => setSelectedIndex(Number(event.target.value))}
              className="mt-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90 outline-none ring-0 transition focus:border-aether-400 focus:ring-2 focus:ring-aether-400/40"
            >
              {PREBUILT_DECKS.map((preset, index) => (
                <option key={preset.name} value={index} className="bg-slate-900 text-slate-100">
                  {preset.name} • {preset.chartType}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200 shadow-glow">
              {error}
            </div>
          )}

          {analysis && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-glow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-aether-200/70">Primary issue</div>
                  <h3 className="mt-2 font-display text-2xl text-white">{getDisplayTitle(analysis.issue)}</h3>
                </div>
                {analysis.grade && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold text-white/90">
                    {analysis.grade}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-white/65">{analysis.caption}</p>

              <dl className="mt-6 space-y-3 text-sm text-white/70">
                {selectedDeck.gameType && (
                  <div className="flex items-center justify-between">
                    <dt className="text-white/50">Game</dt>
                    <dd className="text-white/80">{selectedDeck.gameType}</dd>
                  </div>
                )}
                {analysis.score !== undefined && (
                  <div className="flex items-center justify-between">
                    <dt className="text-white/50">Score</dt>
                    <dd className="text-white/80">{analysis.score}/10</dd>
                  </div>
                )}
                {analysis.title && (
                  <div className="flex items-center justify-between">
                    <dt className="text-white/50">Focus</dt>
                    <dd className="text-white/80">{analysis.title}</dd>
                  </div>
                )}
              </dl>

              {(analysis.strengths?.length ?? 0) > 0 && (
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">Strengths</div>
                  <ul className="mt-3 space-y-2 text-sm text-emerald-200/80">
                    {analysis.strengths!.map((item, index) => (
                      <li key={index} className="rounded-lg border border-emerald-400/10 bg-emerald-400/10 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(analysis.weaknesses?.length ?? 0) > 0 && (
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300/80">Exposed gaps</div>
                  <ul className="mt-3 space-y-2 text-sm text-rose-200/80">
                    {analysis.weaknesses!.map((item, index) => (
                      <li key={index} className="rounded-lg border border-rose-400/10 bg-rose-400/10 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-aether-500/15 via-black/40 to-black/80 p-6 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-aether-200/70">Visualization</div>
              <h3 className="mt-2 font-display text-2xl text-white">
                {analysis ? getDisplayTitle(analysis.issue) : 'Choose a deck'}
              </h3>
            </div>
            {chartType && (
              <span className="rounded-full border border-aether-400/40 bg-aether-400/10 px-3 py-1 text-xs font-medium text-aether-100">
                {chartType.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="mt-6 h-[420px]">
            {analysis ? (
              <InsightChart issue={analysis.issue} data={analysis.data ?? []} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10">
                <p className="text-sm text-white/60">Select a preset to render the diagnostic chart.</p>
              </div>
            )}
          </div>

          {analysis && (
            <>
              <p className="mt-5 text-sm text-white/70">
                <span className="font-semibold text-white/85">Key insight:</span> {analysis.caption}
              </p>

              <details className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                <summary className="cursor-pointer text-white/80">Debug: chart data snapshot</summary>
                <div className="mt-4 space-y-3 text-xs text-white/60">
                  <div className="flex items-center justify-between">
                    <span>Chart type</span>
                    <span className="text-white/75">{chartType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data points</span>
                    <span className="text-white/75">
                      {Array.isArray(analysis.data) ? analysis.data.length : 'n/a'}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/70">
                    {JSON.stringify(
                      Array.isArray(analysis.data) ? analysis.data.slice(0, 4) : analysis.data,
                      null,
                      2,
                    )}
                  </div>
                </div>
              </details>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
