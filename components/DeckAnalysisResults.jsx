'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Sparkles,
  Save,
  ImageIcon,
  Layers,
  ListOrdered,
} from 'lucide-react';
import DeckCompositionSunburst from '@/components/DeckCompositionSunburst';
import InsightChart from '@/components/InsightChart';
import { parseMagicDeckList } from '@/lib/magic';
import { parseDeckCode as parseHearthstoneDeck } from '@/lib/hearthstone';

const formatList = (items) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  const cleaned = items.filter((item) => typeof item === 'string' && item.trim().length > 0);
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(', ')}, and ${cleaned[cleaned.length - 1]}`;
};

const buildWeaknessNarrative = (analysis) => {
  if (!analysis) return '';

  const weaknesses = Array.isArray(analysis.weaknesses)
    ? analysis.weaknesses.filter((item) => typeof item === 'string' && item.trim().length > 0)
    : [];
  const suggestions = Array.isArray(analysis.suggestions)
    ? analysis.suggestions.filter((item) => typeof item === 'string' && item.trim().length > 0)
    : [];

  const scoreText =
    typeof analysis.score === 'number'
      ? `Current score ${analysis.score}/10${analysis.grade ? ` (${analysis.grade})` : ''} indicates the list still has headroom.`
      : '';

  const weaknessesText = weaknesses.length
    ? `Pressure keeps surfacing around ${formatList(weaknesses)}.`
    : 'This run did not surface any structural weaknesses.';

  const suggestionsText = suggestions.length
    ? `Focus on ${formatList(suggestions)} to stabilize the plan.`
    : 'Dial in the curve, tech slots, and matchup pivots manually to tighten the list.';

  return [scoreText, weaknessesText, suggestionsText].filter(Boolean).join(' ');
};

const scoreColor = (score) => {
  if (typeof score !== 'number') return 'text-white/70';
  if (score >= 8) return 'text-emerald-300';
  if (score >= 6) return 'text-amber-300';
  return 'text-rose-300';
};

const normalizeCardKey = (card) => {
  if (!card) return '';
  return `${card.name || card.id || 'card'}-${card.count || 1}-${card.cost ?? 'x'}`;
};

const formatMagicCard = (card) => {
  if (!card) return '';
  return `${card.count}× ${card.name}`;
};

const formatHearthstoneCard = (card) => {
  if (!card) return '';
  const chunks = [];
  if (card.count) chunks.push(`${card.count}×`);
  if (card.name) chunks.push(card.name);
  if (typeof card.cost === 'number') chunks.push(`(${card.cost})`);
  return chunks.join(' ');
};

export default function DeckAnalysisResults({
  analysis,
  gameType,
  deckCode,
  onBack,
  onSave,
  canSave,
  insights,
  showInsights,
  onToggleInsights,
}) {
  const [deckDetails, setDeckDetails] = useState(null);
  const [parsingError, setParsingError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const parseDeck = async () => {
      if (!deckCode) {
        if (!cancelled) {
          setDeckDetails(null);
          setParsingError('');
        }
        return;
      }

      try {
        setParsingError('');
        if (gameType === 'magic') {
          const parsed = parseMagicDeckList(deckCode);
          if (!cancelled) {
            setDeckDetails(parsed);
          }
        } else if (gameType === 'hearthstone') {
          const parsed = await parseHearthstoneDeck(deckCode);
          if (!cancelled) {
            setDeckDetails(parsed);
          }
        } else if (!cancelled) {
          setDeckDetails(null);
        }
      } catch (error) {
        console.error('Failed to parse deck:', error);
        if (!cancelled) {
          setDeckDetails(null);
          setParsingError('We could not generate the full card list. Try re-running with a clean deck list or code.');
        }
      }
    };

    parseDeck();
    return () => {
      cancelled = true;
    };
  }, [deckCode, gameType]);

  const deckSections = useMemo(() => {
    if (!deckDetails) return [];

    if (gameType === 'magic') {
      const sections = [
        { key: 'mainDeck', label: 'Main Deck', cards: deckDetails.mainDeck || [] },
        { key: 'sideboard', label: 'Sideboard', cards: deckDetails.sideboard || [] },
        { key: 'commander', label: 'Commander', cards: deckDetails.commander || [] },
      ];
      return sections.filter((section) => Array.isArray(section.cards) && section.cards.length > 0);
    }

    if (gameType === 'hearthstone' && Array.isArray(deckDetails.cards)) {
      const cards = [...deckDetails.cards].sort((a, b) => {
        if (typeof a.cost === 'number' && typeof b.cost === 'number') {
          if (a.cost !== b.cost) return a.cost - b.cost;
        }
        return (b.count || 0) - (a.count || 0);
      });
      return [{ key: 'deck', label: 'Deck List', cards }];
    }

    return [];
  }, [deckDetails, gameType]);

  const weaknessNarrative = useMemo(() => buildWeaknessNarrative(analysis), [analysis]);

  const deckMeta = useMemo(() => {
    if (!deckDetails) return null;

    if (gameType === 'magic') {
      return {
        lines: [
          deckDetails.format ? `Format: ${deckDetails.format}` : null,
          typeof deckDetails.totalCards === 'number' ? `Main deck size: ${deckDetails.totalCards}` : null,
        ].filter(Boolean),
        valid: deckDetails.valid,
      };
    }

    if (gameType === 'hearthstone') {
      return {
        lines: [
          deckDetails.hero ? `Hero: ${deckDetails.hero}` : null,
          typeof deckDetails.totalCards === 'number' ? `Total cards: ${deckDetails.totalCards}` : null,
        ].filter(Boolean),
        valid: deckDetails.valid,
      };
    }

    return null;
  }, [deckDetails, gameType]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ChevronLeft className="size-4" />
          Back to Analyzer
        </button>

        <div className="flex gap-3">
          {insights && (
            <button
              onClick={onToggleInsights}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
            >
              <Layers className="size-4" />
              {showInsights ? 'Hide Insights' : 'Show Insights'}
            </button>
          )}

          {canSave && (
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              <Save className="size-4" />
              Save Deck
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-8 shadow-glow">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-emerald-200/80 text-xs font-semibold uppercase tracking-[0.4em]">Analysis Ready</p>
            <h1 className="mt-3 font-display text-4xl text-emerald-100">Deck Breakdown</h1>
            <p className="mt-3 text-sm text-emerald-100/70">
              We mapped your list into archetype pillars, surfaced tension points, and highlighted quick wins.
              Use the sections below to decide on your next iteration.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 shadow-ember">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 text-emerald-200" />
              {analysis.grade || 'Ungraded'}
            </div>
            <div className="mt-1 text-emerald-100/70">
              Score {typeof analysis.score === 'number' ? `${analysis.score}/10` : '—'}
            </div>
          </div>
        </div>
      </div>

      <section
        className={`rounded-3xl border p-8 shadow-glow transition ${
          analysis.error ? 'border-rose-500/40 bg-rose-950/40' : 'border-white/10 bg-white/5'
        }`}
      >
        {analysis.error ? (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-rose-200">
              <Sparkles className="size-5 rotate-12" />
              Analysis Error
            </h3>
            <p className="text-sm text-rose-100/80">{analysis.error}</p>
            {analysis.grade === 'Basic Analysis' && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                <strong className="font-semibold">Heads up:</strong> Configure an OpenAI API key to unlock AI-powered analysis. Showing basic heuristics for now.
              </div>
            )}
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 text-xs font-semibold text-rose-100/80 transition hover:text-rose-50"
            >
              Troubleshooting guide →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0c101b] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Overall Score</p>
                <div className={`mt-4 text-5xl font-semibold ${scoreColor(analysis.score)}`}>
                  {typeof analysis.score === 'number' ? `${analysis.score}/10` : '—'}
                </div>
                <p className="mt-2 text-sm text-white/60">{analysis.grade || 'No grade available'}</p>
                {weaknessNarrative && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/60">
                    {weaknessNarrative}
                  </div>
                )}
                {deckMeta && deckMeta.lines.length > 0 && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/60">
                    {deckMeta.lines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                    {deckMeta.valid === false && (
                      <div className="mt-2 text-amber-300/80">Deck validation flagged potential issues.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0c101b] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Deck Composition</p>
                <div className="mt-4">
                  <DeckCompositionSunburst analysis={{ ...analysis, gameType }} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-base font-semibold text-white/80">
                    <ListOrdered className="size-4 text-emerald-200" />
                    Card Listing
                  </h4>
                  <p className="text-sm text-white/60">Review every slot to spot curve gaps and redundant effects.</p>
                </div>
                {deckDetails && (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                    {typeof deckDetails.totalCards === 'number' ? `${deckDetails.totalCards} cards detected` : 'Card count unavailable'}
                  </span>
                )}
              </div>

              {deckSections.length > 0 ? (
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  {deckSections.map((section) => (
                    <div key={section.key} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{section.label}</p>
                      <ul className="mt-3 space-y-2">
                        {section.cards.map((card) => (
                          <li key={normalizeCardKey(card)} className="flex justify-between gap-3">
                            <span>
                              {gameType === 'magic' ? formatMagicCard(card) : formatHearthstoneCard(card)}
                            </span>
                            {typeof card.cost === 'number' && (
                              <span className="text-white/40">Cost {card.cost}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/60">
                  {parsingError || 'We could not generate a reliable card list preview for this deck.'}
                </div>
              )}
            </div>

            {analysis.strengths?.length > 0 && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-6">
                <h4 className="flex items-center gap-2 text-base font-semibold text-emerald-100">
                  <Sparkles className="size-4 text-emerald-200" />
                  Competitive Advantages
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-100/80">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.weaknesses?.length > 0 && (
              <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-6">
                <h4 className="flex items-center gap-2 text-base font-semibold text-rose-100">
                  <Sparkles className="size-4 text-rose-200" />
                  Pressure Points
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-rose-100/80">
                  {analysis.weaknesses.map((weakness, idx) => (
                    <li key={idx}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions?.length > 0 && (
              <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-6">
                <h4 className="flex items-center gap-2 text-base font-semibold text-sky-100">
                  <Sparkles className="size-4 text-sky-200" />
                  Optimization Suggestions
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-sky-100/80">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <h4 className="flex items-center gap-2 text-base font-semibold text-white/80">
                  <Sparkles className="size-4 text-purple-200" />
                  Strategic Recommendations
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(analysis.factors) && analysis.factors.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <h4 className="flex items-center gap-2 text-base font-semibold text-white/80">
                  <Layers className="size-4 text-emerald-200" />
                  Key Factors
                </h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {analysis.factors.map((factor, idx) => (
                    <div key={`${factor?.factor || 'factor'}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                      <div className="font-semibold text-white/90">{factor.factor || 'Factor'}</div>
                      {factor.description && <div className="mt-2 text-xs text-white/60">{factor.description}</div>}
                      {typeof factor.impact === 'number' && (
                        <div
                          className={`mt-3 text-xs font-semibold ${
                            factor.impact > 0 ? 'text-emerald-300' : factor.impact < 0 ? 'text-rose-300' : 'text-white/50'
                          }`}
                        >
                          Impact {factor.impact > 0 ? '+' : ''}
                          {factor.impact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.cardImages?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <h4 className="flex items-center gap-2 text-base font-semibold text-white/80">
                  <ImageIcon className="size-4" />
                  Key Cards
                </h4>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {analysis.cardImages.slice(0, 8).map((card, index) => (
                    <div
                      key={`${card.name}-${index}`}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                    >
                      <div className="relative flex justify-center">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className={`h-auto w-32 rounded-lg transition ${
                            card.isPlaceholder ? 'opacity-60 blur-[1px]' : 'opacity-100'
                          }`}
                          loading="lazy"
                        />
                        {card.isPlaceholder && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/50">
                            Loading...
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-sm font-semibold text-white/80">{card.name}</div>
                      {card.count && <div className="text-xs text-white/50">×{card.count}</div>}
                    </div>
                  ))}
                </div>
                {analysis.cardImages.length > 8 && (
                  <p className="mt-4 text-center text-xs text-white/50">
                    And {analysis.cardImages.length - 8} more cards…
                  </p>
                )}
              </div>
            )}

            {analysis.synergies && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <h4 className="flex items-center gap-2 text-base font-semibold text-white/80">
                  <Layers className="size-4 text-emerald-200" />
                  Card Synergies
                </h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(analysis.synergies).map(([type, cards]) => (
                    <div
                      key={type}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{type}</p>
                      <p className="mt-2 leading-relaxed">
                        {Array.isArray(cards) ? cards.join(', ') : cards}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showInsights && insights && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white/90">
                  <Sparkles className="size-5 text-emerald-200" />
                  AI Insights & Visual Analysis
                </h3>
                <InsightChart issue={insights.issue} data={insights.data} caption={insights.caption} title={insights.title} />
                <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  <strong className="font-semibold">Key Insight:</strong> {insights.caption}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-xs text-white/50">
              Need to iterate again? Use the back button above to adjust your list or load another sample.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
