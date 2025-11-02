'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArchiveRestore,
  DownloadCloud,
  GitBranchPlus,
  Minus,
  Plus,
  Save,
  Send,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ListOrdered,
  X,
  Clock3,
  ChevronRight,
} from 'lucide-react';
import type { DeckRecord, MetaDeck } from '@/data/deck-editor';
import { META_DECKS, SAVED_DECKS } from '@/data/deck-editor';
import { useGame } from '@/context/GameContext';
import { formatToGameType, GAME_OPTIONS, getGameLabel, type GameType } from '@/lib/game';

type DeckEditorWorkspaceProps = {
  onApplyToAnalyzer?: (deckCode: string, format?: DeckRecord['format']) => void;
};

type ToastState = { title: string; description?: string } | null;

const formatBadgeStyles: Record<DeckRecord['format'], string> = {
  Standard: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30',
  Pioneer: 'bg-orange-500/10 text-amber-200 border border-amber-400/30',
  Modern: 'bg-sky-500/10 text-sky-200 border border-sky-400/30',
  Wild: 'bg-fuchsia-500/10 text-fuchsia-200 border border-fuchsia-400/30',
  'Standard (HS)': 'bg-cyan-500/10 text-cyan-200 border border-cyan-400/30',
};

const colorMap: Record<string, { label: string; className: string }> = {
  W: { label: 'White', className: 'bg-yellow-200/10 text-yellow-200 border border-yellow-500/20' },
  U: { label: 'Blue', className: 'bg-sky-400/10 text-sky-200 border border-sky-500/30' },
  B: { label: 'Black', className: 'bg-slate-900 text-slate-200 border border-slate-500/30' },
  R: { label: 'Red', className: 'bg-rose-500/10 text-rose-200 border border-rose-500/30' },
  G: { label: 'Green', className: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' },
  N: { label: 'Neutral', className: 'bg-white/5 text-white/60 border border-white/15' },
};

const DEFAULT_CURVE_BUCKETS = ['0', '1', '2', '3', '4', '5', '6+'];

const ensureCurveBuckets = (labels: string[]) => {
  if (labels.length === 0) return DEFAULT_CURVE_BUCKETS;
  return labels;
};

const getCurveBucket = (labels: string[], manaValue: number) => {
  if (labels.length === 0) return 'mid';

  const numericLabels = labels.filter((label) => !label.includes('+'));
  if (numericLabels.includes(String(manaValue))) {
    return String(manaValue);
  }

  const plusLabel = labels.find((label) => label.includes('+'));
  if (plusLabel) {
    const base = parseInt(plusLabel, 10);
    if (!Number.isNaN(base) && manaValue >= base) {
      return plusLabel;
    }
  }

  const highestNumeric = numericLabels
    .map(Number)
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b)
    .pop();

  if (highestNumeric && manaValue > highestNumeric) {
    return `${highestNumeric}+`;
  }

  return labels[labels.length - 1] ?? String(manaValue);
};

const impactBadge: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
  low: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
};

function createDeckFromMeta(meta: MetaDeck): DeckRecord {
  const prototype = meta.prototype;
  const now = new Date();
  return {
    id: `${meta.id}-import-${now.getTime()}`,
    name: `${meta.name}`,
    format: meta.format,
    archetype: meta.archetype,
    colors: meta.colors,
    lastUpdated: 'Imported now',
    author: meta.source,
    deckCode: meta.deckCode,
    sections:
      prototype?.sections ??
      [
        {
          key: 'main',
          label: 'Main Deck',
          cards: meta.deckCode
            .split('\n')
            .filter((line) => line.trim().length > 0 && !line.startsWith('Sideboard') && !line.toLowerCase().includes('sideboard'))
            .slice(0, 12)
            .map((line) => {
              const parts = line.trim().split(' ');
              const maybeCount = Number(parts[0]);
              const count = Number.isNaN(maybeCount) ? 1 : maybeCount;
              const name = Number.isNaN(maybeCount) ? line.trim() : parts.slice(1).join(' ');
              return {
                name,
                count,
                manaValue: Math.min(5, Math.max(1, name.length % 5)) || 2,
                role: 'Imported list slot',
                tags: ['meta import'],
              };
            }),
        },
      ],
    snapshot:
      prototype?.snapshot ?? {
        curve: [
          { label: '1', value: 12 },
          { label: '2', value: 12 },
          { label: '3', value: 10 },
          { label: '4+', value: 6 },
        ],
        colorWeight: meta.colors.map((color) => ({
          label: colorMap[color]?.label ?? color,
          value: Math.round(100 / (meta.colors.length || 1)),
        })),
        gamePlan: meta.highlight,
        strengths: ['Leverages current meta positioning.', 'Tested in recent events.', 'Streamlined curve with proven performance.'],
        weaknesses: ['Requires tuning for local metagames.', 'Performance tied to draw consistency.', 'Sideboard profile not customised yet.'],
        winRate: meta.winRate,
        metaShare: meta.metaShare,
        topMatchups: [
          { archetype: 'Popular Midrange', winRate: Math.round(meta.winRate * 0.9) },
          { archetype: 'Aggro Field', winRate: Math.round(meta.winRate * 0.85) },
          { archetype: 'Control Shell', winRate: Math.round(meta.winRate * 0.8) },
        ],
        techOptions: [
          { name: 'Flex Slot A', impact: 'medium', note: 'Adjust depending on local removal density.' },
          { name: 'Flex Slot B', impact: 'high', note: 'Swingy tech card recommended by top lists.' },
          { name: 'Flex Slot C', impact: 'low', note: 'Metagame bullet if combo rises.' },
        ],
      },
  };
}

export default function DeckEditorWorkspace({ onApplyToAnalyzer }: DeckEditorWorkspaceProps) {
  const [savedDecks, setSavedDecks] = useState<DeckRecord[]>(SAVED_DECKS);
  const [activeDeck, setActiveDeck] = useState<DeckRecord>(SAVED_DECKS[0]);
  const { game: selectedGame, setGame } = useGame();
  const [showSavedPicker, setShowSavedPicker] = useState(false);
  const [showMetaPicker, setShowMetaPicker] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const mainSections = useMemo(
    () => activeDeck.sections.filter((section) => section.key !== 'sideboard'),
    [activeDeck.sections],
  );
  const sideboardSection = useMemo(
    () => activeDeck.sections.find((section) => section.key === 'sideboard') ?? null,
    [activeDeck.sections],
  );

  const totalMainCount = useMemo(
    () =>
      mainSections.reduce(
        (total, section) => total + section.cards.reduce((acc, card) => acc + card.count, 0),
        0,
      ),
    [mainSections],
  );

  const sideboardCount = useMemo(
    () => (sideboardSection ? sideboardSection.cards.reduce((acc, card) => acc + card.count, 0) : 0),
    [sideboardSection],
  );

  const filteredSavedDecks = useMemo(
    () => savedDecks.filter((deck) => formatToGameType(deck.format) === selectedGame),
    [savedDecks, selectedGame],
  );

  const filteredMetaDecks = useMemo(
    () => META_DECKS.filter((deck) => formatToGameType(deck.format) === selectedGame),
    [selectedGame],
  );

  const selectedGameLabel = getGameLabel(selectedGame);

  const activeDeckGame = formatToGameType(activeDeck.format);

  const curveBuckets = ensureCurveBuckets(activeDeck.snapshot.curve.map((bucket) => bucket.label));

  const derivedCurve = useMemo(() => {
    const bucketValues = new Map<string, number>();
    curveBuckets.forEach((label) => bucketValues.set(label, 0));

    mainSections.forEach((section) => {
      section.cards.forEach((card) => {
        const bucket = getCurveBucket(curveBuckets, card.manaValue);
        bucketValues.set(bucket, (bucketValues.get(bucket) ?? 0) + card.count);
      });
    });

    return curveBuckets.map((label) => ({
      label,
      value: bucketValues.get(label) ?? 0,
    }));
  }, [curveBuckets, mainSections]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (activeDeckGame === selectedGame) return;
    const nextDeck = savedDecks.find((deck) => formatToGameType(deck.format) === selectedGame);
    if (nextDeck) {
      setActiveDeck(nextDeck);
    }
  }, [activeDeckGame, savedDecks, selectedGame]);

  const adjustCardCount = (sectionKey: string, cardName: string, delta: number) => {
    setActiveDeck((prev) => {
      const updatedSections = prev.sections.map((section) => {
        if (section.key !== sectionKey) return section;

        const updatedCards = section.cards
          .map((card) => {
            if (card.name !== cardName) return card;
            const nextCount = Math.max(0, card.count + delta);
            return { ...card, count: nextCount };
          })
          .filter((card) => card.count > 0);

        return { ...section, cards: updatedCards };
      });

      return {
        ...prev,
        sections: updatedSections,
      };
    });
  };

  const handleLoadDeck = (deck: DeckRecord) => {
    setActiveDeck(deck);
    setGame(formatToGameType(deck.format));
    setShowSavedPicker(false);
    setToast({ title: 'Deck loaded', description: `${deck.name} is now active in the editor.` });
  };

  const handleImportMetaDeck = (metaDeck: MetaDeck) => {
    const importedDeck = createDeckFromMeta(metaDeck);
    setActiveDeck(importedDeck);
    setGame(formatToGameType(metaDeck.format));
    setSavedDecks((prev) => {
      const exists = prev.find((deck) => deck.id === importedDeck.id);
      if (exists) return prev;
      return [importedDeck, ...prev];
    });
    setShowMetaPicker(false);
    setToast({ title: 'Meta deck imported', description: `${metaDeck.name} ready for tuning.` });
  };

  const handleSaveDeck = () => {
    setActiveDeck((prev) => ({ ...prev, lastUpdated: 'Just now' }));
    setSavedDecks((prev) => {
      const existingIndex = prev.findIndex((deck) => deck.id === activeDeck.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...activeDeck, lastUpdated: 'Just now' };
        return next;
      }
      return [{ ...activeDeck, lastUpdated: 'Just now' }, ...prev];
    });
    setToast({ title: 'Deck saved', description: `${activeDeck.name} stored in your library.` });
  };

  const handleSaveVariation = () => {
    const variationCount = savedDecks.filter((deck) => deck.name.startsWith(activeDeck.name)).length + 1;
    const variation: DeckRecord = {
      ...activeDeck,
      id: `${activeDeck.id}-variation-${Date.now()}`,
      name: `${activeDeck.name} · Variation ${variationCount}`,
      lastUpdated: 'Just now',
    };
    setActiveDeck(variation);
    setSavedDecks((prev) => [variation, ...prev]);
    setToast({ title: 'Variation saved', description: `${variation.name} added to saved decks.` });
  };

  const sendToAnalyzer = () => {
    onApplyToAnalyzer?.(activeDeck.deckCode, activeDeck.format);
    setToast({ title: 'Sent to analyzer', description: 'Deck code preloaded into Decklytics.' });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#090c16] p-8 shadow-[0_40px_80px_-40px_rgba(16,185,129,0.35)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/70">
            Deck Workbench
          </div>
          <h2 className="mt-3 font-display text-3xl text-white">{activeDeck.name}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 ${formatBadgeStyles[activeDeck.format]}`}>
              {activeDeck.format}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-white/70">
              {activeDeck.archetype}
            </span>
            {activeDeck.colors.map((color) => {
              const meta = colorMap[color] ?? { label: color, className: 'border border-white/10 px-3 py-1 text-white/70' };
              return (
                <span key={color} className={`rounded-full px-3 py-1 text-xs ${meta.className}`}>
                  {meta.label}
                </span>
              );
            })}
            <span className="ml-2 flex items-center gap-1 text-xs text-white/40">
              <Clock3 className="size-3" />
              Updated {activeDeck.lastUpdated}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-3">
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
              Game focus
            </div>
            <select
              value={selectedGame}
              onChange={(event) => setGame(event.target.value as GameType)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-[#101626] px-3 py-2 text-sm text-white/80 transition focus:border-emerald-400/60 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
            >
              {GAME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/50">
              Loading decks, meta pulls, and tuning tools tailored for {selectedGameLabel}.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 shadow-glow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">Predicted WR</div>
                <div className="text-2xl font-semibold text-emerald-100">
                  {activeDeck.snapshot.winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-emerald-100/70">
                  Meta share {activeDeck.snapshot.metaShare.toFixed(1)}%
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-400/10">
                <TrendingUp className="size-6 text-emerald-200" />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={sendToAnalyzer}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            <Send className="size-4" />
            Send to Analyzer
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowSavedPicker(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
        >
          <ArchiveRestore className="size-4" />
          Load Saved Deck
        </button>
        <button
          type="button"
          onClick={() => setShowMetaPicker(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
        >
          <DownloadCloud className="size-4" />
          Import Meta Deck
        </button>
        <button
          type="button"
          onClick={handleSaveDeck}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/30"
        >
          <Save className="size-4" />
          Save Deck
        </button>
        <button
          type="button"
          onClick={handleSaveVariation}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/25"
        >
          <GitBranchPlus className="size-4" />
          Save Variation
        </button>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <section className="space-y-6">
          {mainSections.map((section) => (
            <div key={section.key} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white/90">{section.label}</h3>
                <span className="text-xs uppercase tracking-[0.25em] text-white/40">
                  {section.cards.reduce((acc, card) => acc + card.count, 0)} cards
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {section.cards.map((card) => (
                  <div
                    key={card.name}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d1220] p-4 transition hover:border-emerald-400/40 hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.4)] md:flex-row md:items-start md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white/90">{card.name}</p>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                          {card.role}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/50">
                        {card.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 px-2 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {card.note && <p className="mt-2 text-xs text-white/60">{card.note}</p>}
                    </div>
                    <div className="flex items-center gap-3 self-start text-sm text-white/70">
                      <button
                        type="button"
                        onClick={() => adjustCardCount(section.key, card.name, -1)}
                        className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-emerald-400/60 hover:text-emerald-200"
                      >
                        <Minus className="size-4" />
                      </button>
                      <div className="min-w-[2ch] text-center text-lg font-semibold text-white">
                        {card.count}
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustCardCount(section.key, card.name, 1)}
                        className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-emerald-400/60 hover:text-emerald-200"
                      >
                        <Plus className="size-4" />
                      </button>
                      <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                        {card.manaValue === 0 ? 'land' : `${card.manaValue} mv`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sideboardSection && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-200">{sideboardSection.label}</h3>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">
                  {sideboardCount} cards
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {sideboardSection.cards.map((card) => (
                  <div key={card.name} className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4">
                    <div className="flex items-center justify-between text-sm text-emerald-100">
                      <span>{card.name}</span>
                      <span className="font-semibold">{card.count}x</span>
                    </div>
                    {card.note && <p className="mt-2 text-xs text-emerald-100/70">{card.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
              <Sparkles className="size-3" />
              Curve Pulse
            </div>
            <div className="mt-3 space-y-3">
              {derivedCurve.map((bucket) => {
                const ratio = totalMainCount > 0 ? Math.min(100, (bucket.value / totalMainCount) * 100) : 0;
                return (
                  <div key={bucket.label}>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{bucket.label}-drops</span>
                      <span>{bucket.value}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/60">
              {totalMainCount} main-deck cards · {sideboardCount} sideboard ·{' '}
              {activeDeckGame === 'magic' ? '60-card baseline' : '30-card baseline'}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
              <ShieldCheck className="size-3" />
              Positioning
            </div>
            <p className="mt-3 text-sm text-white/70">{activeDeck.snapshot.gamePlan}</p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-emerald-200/70">
                  <Sparkles className="size-3" />
                  Strengths
                </div>
                <ul className="mt-3 space-y-2 text-emerald-100/80">
                  {activeDeck.snapshot.strengths.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-[2px] size-1.5 rounded-full bg-emerald-300" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-rose-200/70">
                  <ShieldCheck className="size-3 rotate-180" />
                  Pressure Points
                </div>
                <ul className="mt-3 space-y-2 text-rose-100/80">
                  {activeDeck.snapshot.weaknesses.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-[2px] size-1.5 rounded-full bg-rose-300" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
              <ListOrdered className="size-3" />
              Matchups Radar
            </div>
            <div className="mt-3 space-y-3">
              {activeDeck.snapshot.topMatchups.map((matchup) => (
                <div key={matchup.archetype} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-white/80">{matchup.archetype}</p>
                    <p className="text-xs text-white/50">Projected {matchup.winRate}% WR</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                    Favored
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
              <TrendingUp className="size-3" />
              Tech Bench
            </div>
            <div className="mt-3 space-y-3">
              {activeDeck.snapshot.techOptions.map((option) => (
                <div key={option.name} className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{option.name}</p>
                    <span className={`rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.2em] ${impactBadge[option.impact]}`}>
                      {option.impact} impact
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/60">{option.note}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {showSavedPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#080b14] p-6 shadow-[0_40px_120px_-60px_rgba(16,185,129,0.65)]">
            <button
              type="button"
              onClick={() => setShowSavedPicker(false)}
              className="absolute right-5 top-5 rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white"
            >
              <X className="size-4" />
            </button>
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40">Load Saved Deck</div>
            <h3 className="text-2xl font-semibold text-white">Your library</h3>
            <div className="mt-6 grid max-h-[60vh] gap-4 overflow-y-auto pr-2 md:grid-cols-2">
              {filteredSavedDecks.length > 0 ? (
                filteredSavedDecks.map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => handleLoadDeck(deck)}
                    className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <ArchiveRestore className="size-3.5" />
                      {deck.lastUpdated}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white/90">{deck.name}</p>
                      <p className="text-sm text-white/60">{deck.archetype}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-full px-3 py-1 ${formatBadgeStyles[deck.format]}`}>
                        {deck.format}
                      </span>
                      <span className="rounded-full border border-white/15 px-3 py-1 text-white/60">
                        {deck.snapshot.winRate.toFixed(1)}% WR
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                      {deck.colors.map((color) => (
                        <span key={color} className={`rounded-full px-2 py-1 ${colorMap[color]?.className ?? 'border border-white/10 text-white/60'}`}>
                          {colorMap[color]?.label ?? color}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-white/60">
                  No saved decks for this game yet. Import a meta list or save a new build to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showMetaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#080b14] p-6 shadow-[0_40px_120px_-60px_rgba(8,145,178,0.65)]">
            <button
              type="button"
              onClick={() => setShowMetaPicker(false)}
              className="absolute right-5 top-5 rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white"
            >
              <X className="size-4" />
            </button>
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40">Import Meta Deck</div>
            <h3 className="text-2xl	font-semibold text-white">Live meta pulls</h3>
            <div className="mt-6 grid max-h-[60vh] gap-4 overflow-y-auto pr-2 md:grid-cols-2">
              {filteredMetaDecks.length > 0 ? (
                filteredMetaDecks.map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => handleImportMetaDeck(deck)}
                    className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
                  >
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <DownloadCloud className="size-3.5" />
                      {deck.source}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white/90">{deck.name}</p>
                      <p className="text-sm text-white/60">{deck.archetype}</p>
                    </div>
                    <p className="text-xs text-white/60">{deck.highlight}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-full px-3 py-1 ${formatBadgeStyles[deck.format]}`}>
                        {deck.format}
                      </span>
                      <span className="rounded-full border border-white/15 px-3 py-1 text-white/60">
                        {deck.winRate.toFixed(1)}% WR · {deck.metaShare.toFixed(1)}% meta
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <TrendingUp className="size-3" />
                      {deck.trending === 'up' ? 'Trending upward' : deck.trending === 'down' ? 'Cooling off' : 'Stable'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      View outline <ChevronRight className="size-3" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-white/60">
                  Meta data for this game is coming soon. Switch games or check back for fresh pulls.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.8)]">
            <Sparkles className="mt-1 size-4 text-emerald-200" />
            <div>
              <p className="font-semibold text-emerald-100">{toast.title}</p>
              {toast.description && <p className="mt-1 text-xs text-emerald-100/70">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto rounded-full border border-emerald-500/20 p-1 text-emerald-100/70 transition hover:text-emerald-100"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
