'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ListChecks,
  Sparkles,
  Save,
  Activity,
  Zap,
  Compass,
  Workflow,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import HeroSigil from '@/components/HeroSigil';
import DeckAnalysisResults from '@/components/DeckAnalysisResults';
import { VERSION, BUILD_DATE, BUILD_NUMBER } from '@/lib/version';
import { ELEMENTS } from '@/lib/theme';
import DeckEditorWorkspace from '@/components/DeckEditorWorkspace';
import { SAVED_DECKS, META_DECKS } from '@/data/deck-editor';

const sampleDecks = [
  {
    id: 'hs-control-warrior',
    label: '🃏 Hearthstone: Control Warrior',
    description: 'Classic control deck with strong board control. Great for tempo management drills.',
    deckCode:
      'AAEBAf0EBMABoAHCAe0DqwTLBMsEzATNBM8EzgTOBM8E0ATQBNEE0gTRBNIE1ATVBNYE1wTXBNgE2ATZBNkE2gTaBNsE2wTcBN0E3gTfBOAE4AThBOIE4gTjBOQE5ATmBOYE5gTnBOgE6ATqBOoE6gTrBOwE7ATuBO4E7gTvBO8E8ATxBPQE9AT2BPYE9gT3BPgE+AT5BPkE+QT6BP4GCg==',
    gameType: 'hearthstone',
  },
  {
    id: 'hs-zoo-warlock',
    label: '🃏 Hearthstone: Zoo Warlock',
    description: 'Aggressive list overloaded on low drops – showcases curve discipline problems.',
    deckCode:
      'AAEBAfBlGjwHyQGLBZME3QTgBOYF6gTrBO4E7wTwBPAE8QT1BPUF9gX3BfgF+QX6BfoF+wX8BfwF/AX+Bf8GAIAA',
    gameType: 'hearthstone',
  },
  {
    id: 'hs-miracle-rogue',
    label: '🃏 Hearthstone: Miracle Rogue',
    description: 'Combo-centric shell with inconsistent draw – exposes sequencing pressure.',
    deckCode:
      'AAEBAaIHBqW4A9W4A5rKA9rKA+DNA/rNA6bTA6jTA6rTA7LTA7TTA7bTA7jTA7rTA7vTA8DTA8TTA8jTA8rTA8vTA9DTA9TTA9jTA9rTA9vTA+DTA+TTBqHBsAAA==',
    gameType: 'hearthstone',
  },
  {
    id: 'mtg-uw-control',
    label: '🧙‍♂️ Magic: Blue-White Control',
    description: 'Classic draw-go list – balanced but deliberate. Perfect for pacing analysis.',
    deckCode: `1 Island
1 Plains
1 Sol Ring
1 Counterspell
1 Wrath of God
1 Timetwister
1 Ancestral Recall
1 Timetwister
1 Time Walk
1 Timetwister
1 Ancestral Recall
1 Black Lotus
1 Mox Sapphire
1 Mox Jet
1 Mox Ruby
1 Mox Emerald
1 Ancestral Recall
1 Time Walk
1 Timetwister
1 Time Walk

20 cards remaining...`,
    gameType: 'magic',
  },
  {
    id: 'mtg-storm-combo',
    label: '🧙‍♂️ Magic: Storm Combo',
    description: 'Lightning-fast combo shell with fragile redundancy – perfect for draw engine tuning.',
    deckCode: `4 Brainstorm
4 Ponder
4 Preordain
4 Lotus Petal
4 Dark Ritual
4 Lion's Eye Diamond
4 Infernal Tutor
4 Cabal Ritual
4 Tendrils of Agony
4 Ad Nauseam
4 Past in Flames
4 Burning Wish
4 Empty the Warrens
4 Grapeshot

16 cards remaining...`,
    gameType: 'magic',
  },
  {
    id: 'mtg-jund',
    label: '🧙‍♂️ Magic: Jund Midrange',
    description: 'Ambitious three-color midrange pile – great for diagnosing role confusion.',
    deckCode: `4 Bloodstained Mire
4 Wooded Foothills
4 Windswept Heath
4 Blackcleave Cliffs
4 Copperline Gorge
4 Blood Crypt
4 Overgrown Tomb
4 Stomping Ground
4 Liliana of the Veil
4 Dark Confidant
4 Tarmogoyf
4 Scavenging Ooze
4 Bloodbraid Elf
4 Lightning Helix
4 Maelstrom Pulse
4 Jund Charm
4 Kolaghan's Command
4 Fatal Push
4 Thoughtseize
4 Inquisition of Kozilek

4 cards remaining...`,
    gameType: 'magic',
  },
];

const E = ELEMENTS.earth;

const formatToGameTypeFromFormat = (format) => {
  if (!format) return 'magic';
  return format === 'Wild' || format === 'Standard (HS)' ? 'hearthstone' : 'magic';
};

const featuredSavedDecks = SAVED_DECKS.slice(0, 3);
const featuredMetaDecks = META_DECKS.slice(0, 2);

export default function Analyzer() {
  const [deckCode, setDeckCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('configure');
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState('hearthstone');
  const [user, setUser] = useState(null);
  const [deckName, setDeckName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [insights, setInsights] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const deckInputMetrics = useMemo(() => {
    const clean = deckCode.trim();
    if (!clean) {
      return {
        lines: 0,
        tokens: 0,
        characters: 0,
        estimatedCards: 0,
        containsSideboard: false,
      };
    }
    const lines = clean.split(/\r?\n/);
    const tokens = clean.split(/\s+/).length;
    const characters = clean.length;
    const numericLines = lines.filter((line) => /^\d+/.test(line.trim()));
    const estimatedCards = numericLines.reduce((total, line) => {
      const match = line.trim().match(/^(\d+)/);
      if (!match) return total + 1;
      return total + Number(match[1]);
    }, gameType === 'hearthstone' ? 30 : 0);
    const containsSideboard = lines.some((line) => /sideboard/i.test(line));
    return {
      lines: lines.length,
      tokens,
      characters,
      estimatedCards,
      containsSideboard,
    };
  }, [deckCode, gameType]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadUserData();
    }
  }, []);

  const loadUserData = async () => {
    try {
      const { getCurrentUser } = await import('@/lib/auth/user');
      const currentUser = getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn('Failed to load user data:', error);
    }
  };

  const saveDeck = async () => {
    if (!user || !analysis || !deckName.trim()) return;

    try {
      const { saveDeck } = await import('@/lib/auth/user');
      const deckData = {
        gameType,
        deckCode: deckCode.trim(),
        analysis,
        stats: analysis.detailedAnalysis || {},
      };

      const savedDeck = saveDeck(deckData, deckName.trim());
      if (savedDeck) {
        setShowSaveDialog(false);
        setDeckName('');
        alert('Deck saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save deck:', error);
      alert('Failed to save deck. Please try again.');
    }
  };

  const analyzeDeck = async () => {
    if (!deckCode.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckCode, gameType }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (typeof window !== 'undefined') {
        try {
          const { getCurrentUser, saveAnalysis } = await import('@/lib/auth/user');
          const currentUser = getCurrentUser();
          if (currentUser && result.score) {
            saveAnalysis(result, `Analysis ${new Date().toLocaleDateString()}`);
          }
        } catch (error) {
          console.warn('Failed to save analysis:', error);
        }
      }

      setAnalysis(result);
      setInsights(null);
      setShowInsights(false);
      setViewMode('results');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => loadRealCardImages(result), 100);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: 'Failed to analyze deck. Please try again.' });
      setShowInsights(false);
      setViewMode('results');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRealCardImages = async (currentAnalysis) => {
    if (!currentAnalysis?.cardImages?.length) return;

    const placeholders = currentAnalysis.cardImages.filter((card) => card.isPlaceholder);
    if (placeholders.length === 0) return;

    try {
      const response = await fetch('/api/analyze/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckCode, gameType }),
      });

      if (response.ok) {
        const imageData = await response.json();
        if (imageData.cardImages && imageData.cardImages.length > 0) {
          setAnalysis((prev) => ({
            ...prev,
            cardImages: imageData.cardImages,
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to load real card images:', error);
    }
  };

  const handleBackToConfigure = () => {
    setViewMode('configure');
    setAnalysis(null);
    setInsights(null);
    setShowInsights(false);
    setShowSaveDialog(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrefillSavedDeck = (deck) => {
    setGameType(formatToGameTypeFromFormat(deck.format));
    setDeckCode(deck.deckCode);
    setViewMode('configure');
    scrollToTop();
  };

  const handlePrefillMetaDeck = (deck) => {
    setGameType(formatToGameTypeFromFormat(deck.format));
    setDeckCode(deck.deckCode);
    setViewMode('configure');
    scrollToTop();
  };

  const handleApplyFromWorkbench = (code, format) => {
    if (!code) return;
    setDeckCode(code);
    if (format) {
      setGameType(formatToGameTypeFromFormat(format));
    }
    setViewMode('configure');
    scrollToTop();
  };

  const analyzerTelemetry = [
    {
      label: 'Intake readiness',
      value: deckCode.trim() ? 'Deck detected' : 'Awaiting input',
      meta: deckCode.trim()
        ? `${deckInputMetrics.lines} lines · ${deckInputMetrics.tokens} tokens`
        : 'Paste a list or deck code to begin',
      icon: Activity,
    },
    {
      label: 'Format focus',
      value: gameType === 'magic' ? 'Magic: The Gathering' : 'Hearthstone',
      meta: deckInputMetrics.containsSideboard ? 'Sideboard detected' : 'Main deck only',
      icon: Compass,
    },
    {
      label: 'AI queue',
      value: loading ? 'Processing...' : analysis ? 'Latest report ready' : 'Standing by',
      meta: loading ? 'Generating predictions now' : analysis ? 'Scroll down for detailed breakdown' : 'Run analysis to unlock insights',
      icon: Zap,
    },
  ];

  const stageTimeline = [
    {
      title: 'Plan',
      body: 'Load a saved list, import meta tech, or paste a fresh brew.',
      icon: Workflow,
    },
    {
      title: 'Diagnose',
      body: 'AI cross-checks curve gaps, matchup pivots, and role compression.',
      icon: Gauge,
    },
    {
      title: 'Refine',
      body: 'Iterate in the Deck Workbench, branch variations, and re-run instantly.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
          >
            <ChevronLeft className="size-4" />
            Back to Realms
          </Link>

          <section className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/10 p-8 shadow-[0_50px_120px_-60px_rgba(16,185,129,0.75)]">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,1fr)] lg:items-center">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
                  <HeroSigil color={E.hue} glow={E.glow} variant="earth" />
                  <div>
                    <div className="text-emerald-200/80 text-xs font-semibold uppercase tracking-[0.45em]">
                      Decklytics Flight Deck
                    </div>
                    <h1 className="mt-2 font-display text-4xl text-emerald-50 sm:text-5xl">
                      AI Deck Analyzer & Workbench
                    </h1>
                    <p className="mt-3 max-w-xl text-sm text-emerald-100/70">
                      Tune lists, audit matchup readiness, and branch variations with guided AI heuristics. Paste a deck, pull from the meta, or iterate from your saved library.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <a
                    href="#configure"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
                  >
                    Open Analyzer
                    <ArrowRight className="size-4" />
                  </a>
                  <a
                    href="#workbench"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:border-emerald-400/40 hover:text-emerald-100"
                  >
                    Jump to Deck Editor
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {stageTimeline.map((stage) => (
                    <div key={stage.title} className="rounded-2xl border border-white/10 bg-[#0b121f]/60 p-4">
                      <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                        <stage.icon className="size-4 text-emerald-200" />
                        {stage.title}
                      </div>
                      <p className="mt-2 text-xs text-white/60">{stage.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 rounded-3xl border border-emerald-400/25 bg-[#07101f]/80 p-6 backdrop-blur">
                <div className="flex items-center justify-between text-xs text-emerald-100/70">
                  <span>Build #{BUILD_NUMBER}</span>
                  <span>
                    v{VERSION} · {BUILD_DATE}
                  </span>
                </div>
                <div className="grid gap-4">
                  {analyzerTelemetry.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                        <item.icon className="size-5 text-emerald-200" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-200/70">{item.label}</div>
                        <div className="mt-1 text-sm font-semibold text-emerald-50">{item.value}</div>
                        <div className="text-xs text-emerald-100/60">{item.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {viewMode === 'results' ? (
          <section className="space-y-6" id="results">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
                    Analyzer Report
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {analysis?.score ? 'Latest AI evaluation ready.' : 'AI analysis generated.'}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    Review the breakdown below, then hop into the Deck Workbench to iterate and resend.
                  </p>
                </div>
                <button
                  onClick={handleBackToConfigure}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-emerald-400/40 hover:text-emerald-100"
                >
                  Re-run analyzer
                </button>
              </div>
            </div>

            {analysis ? (
              <DeckAnalysisResults
                analysis={analysis}
                deckCode={deckCode}
                gameType={gameType}
                onBack={handleBackToConfigure}
                onSave={() => setShowSaveDialog(true)}
                canSave={Boolean(user && analysis?.score)}
                insights={insights}
                showInsights={showInsights}
                onToggleInsights={() => setShowInsights((prev) => !prev)}
              />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/60 shadow-glow">
                Run a fresh analysis to see detailed results here.
              </div>
            )}
          </section>
        ) : (
          <>
            <section
              id="configure"
              className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]"
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
                      Intake Console
                    </div>
                    <h2 className="mt-2 font-display text-2xl text-white">
                      Configure and launch an AI deck scan
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      Select a supported game, drop in a deck code or list, and we will surface the curve, matchup, and synergy diagnostics instantly.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-xs text-white/50">
                    Build #{BUILD_NUMBER} · v{VERSION} · {BUILD_DATE}
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-white/70">Select game</label>
                      <select
                        value={gameType}
                        onChange={(e) => setGameType(e.target.value)}
                        className="rounded-2xl border border-white/15 bg-[#121320] px-4 py-3 text-sm text-white/80 transition focus:border-emerald-400/60 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
                      >
                        <option value="hearthstone">Hearthstone</option>
                        <option value="magic">Magic: The Gathering</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-white/70">Analysis focus</label>
                      <div className="rounded-2xl border border-white/10 bg-[#101626] px-4 py-3 text-xs text-white/60">
                        {gameType === 'magic'
                          ? 'Magic decklists accept sideboards and multi-line card counts.'
                          : 'Hearthstone deckstrings paste in as a single line base64 code.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/70">Deck input</label>
                    <textarea
                      value={deckCode}
                      onChange={(e) => setDeckCode(e.target.value)}
                      placeholder={
                        gameType === 'hearthstone'
                          ? 'AAEBAf0EBMABoAHCAe0DqwTLBMsEzATNBM8EzgTOBM8E0ATQBNEE0gTRBNIE1ATVBNYE1wTXBNgE2ATZBNkE2gTaBNsE2wTcBN0E3gTfBOAE4AThBOIE4gTjBOQE5ATmBOYE5gTnBOgE6ATqBOoE6gTrBOwE7ATuBO4E7gTvBO8E8ATxBPQE9AT2BPYE9gT3BPgE+AT5BPkE+QT6BP4GCg=='
                          : `1 Forest
1 Island
1 Mountain
1 Plains
1 Swamp

1 Sol Ring
1 Lightning Bolt
1 Counterspell

20 cards remaining...`
                      }
                      className="min-h-[240px] w-full rounded-2xl border border-white/10 bg-[#0c101b] px-4 py-3 font-mono text-sm text-white/80 placeholder:text-white/30 transition focus:border-emerald-400/60 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
                    />
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Lines parsed</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {deckInputMetrics.lines}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Tokens</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {deckInputMetrics.tokens}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Characters</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {deckInputMetrics.characters}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                        {gameType === 'magic' ? 'Estimated cards' : 'Deck size target'}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {gameType === 'magic' ? deckInputMetrics.estimatedCards : 30}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={analyzeDeck}
                      disabled={loading || !deckCode.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
                    >
                      <Sparkles className="size-4" />
                      {loading ? 'Analyzing...' : 'Analyze deck'}
                    </button>
                    <button
                      onClick={() => setDeckCode('')}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm text-white/70 transition hover:border-emerald-400/40 hover:text-emerald-100"
                    >
                      Clear input
                    </button>
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/20 p-6 shadow-glow">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                    <ListChecks className="size-4" />
                    Saved deck quickloads
                  </h3>
                  <p className="mt-1 text-xs text-emerald-100/70">
                    Pull a tuned shell and send it through the analyzer in one click.
                  </p>
                  <div className="mt-5 space-y-3">
                    {featuredSavedDecks.map((deck) => (
                      <div
                        key={deck.id}
                        className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{deck.name}</p>
                            <p className="text-xs text-white/50">{deck.archetype}</p>
                          </div>
                          <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/60">
                            {deck.snapshot.winRate.toFixed(1)}% WR
                          </span>
                        </div>
                        <button
                          onClick={() => handlePrefillSavedDeck(deck)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
                        >
                          Load into analyzer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/15 via-sky-500/10 to-emerald-500/10 p-6 shadow-glow">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-sky-100">
                    <Activity className="size-4" />
                    Meta pulse
                  </h3>
                  <p className="mt-1 text-xs text-sky-100/70">
                    Trending archetypes sourced from the live meta feed.
                  </p>
                  <div className="mt-5 space-y-3">
                    {featuredMetaDecks.map((deck) => (
                      <div
                        key={deck.id}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/80 transition hover:border-sky-400/40 hover:bg-sky-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{deck.name}</p>
                            <p className="text-xs text-white/50">{deck.archetype}</p>
                          </div>
                          <span className="text-xs text-sky-200">
                            {deck.winRate.toFixed(1)}% WR · {deck.metaShare.toFixed(1)}% meta
                          </span>
                        </div>
                        <button
                          onClick={() => handlePrefillMetaDeck(deck)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/40 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/20"
                        >
                          Import & analyze
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <HeroSigil color={E.hue} glow={E.glow} variant="earth" />
                    Practice decks
                  </h3>
                  <p className="mt-1 text-xs text-white/60">
                    Load curated examples that spotlight common analyzer callouts.
                  </p>
                  <div className="mt-4 space-y-3">
                    {sampleDecks.slice(0, 3).map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => {
                          setGameType(sample.gameType);
                          setDeckCode(sample.deckCode);
                          scrollToTop();
                        }}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-left text-xs text-white/70 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                      >
                        <p className="font-semibold text-white/80">{sample.label}</p>
                        <p className="mt-2 text-[11px] leading-relaxed">{sample.description}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-emerald-200/80">
                          Load example
                          <ArrowRight className="size-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                  <a
                    href="#sample-library"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 transition hover:text-emerald-100"
                  >
                    View full library
                    <ArrowRight className="size-3" />
                  </a>
                </div>
              </aside>
            </section>

            <section
              id="sample-library"
              className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
                    Practice Library
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-white/90">
                    Guided sample decks to stress-test the analyzer
                  </h3>
                </div>
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 transition hover:text-emerald-100"
                >
                  Explore insights
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sampleDecks.map((sample) => (
                  <div
                    key={`${sample.id}-extended`}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/80">{sample.label}</p>
                      <p className="mt-2 text-xs text-white/60">{sample.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setGameType(sample.gameType);
                        setDeckCode(sample.deckCode);
                        scrollToTop();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
                    >
                      Load & analyze
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <section id="workbench" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
                Deck Editor
              </div>
              <h2 className="mt-2 font-display text-3xl text-white">Deck Workbench for iterative tuning</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/60">
                Load saved lists, import meta decks, branch variations, and send tuned copies back through the analyzer. The workbench keeps your stats, matchups, and tech options close at hand.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Sparkles className="size-4 text-emerald-200" />
              <span>Load, branch, and re-run in seconds with the analyzer relay.</span>
            </div>
          </div>
          <DeckEditorWorkspace onApplyToAnalyzer={handleApplyFromWorkbench} />
        </section>

        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
            <div className="w-full max-w-md rounded-3xl border border-emerald-400/30 bg-[#0b0b10] p-8 shadow-glow">
              <h3 className="text-lg font-semibold text-white/90">Save deck analysis</h3>
              <p className="mt-2 text-sm text-white/60">
                Store this run in your library to compare against future variations.
              </p>

              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter deck name"
                className="mt-6 w-full rounded-2xl border border-white/15 bg-[#121320] px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDeck}
                  disabled={!deckName.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
                >
                  <Save className="size-4" />
                  Save deck
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="border-t border-white/10 pt-8 text-center text-xs text-white/50">
          <div className="font-semibold text-white/70">
            Scrylytics v{VERSION} · Build #{BUILD_NUMBER} · {BUILD_DATE}
          </div>
          <p className="mt-2">
            Decklytics pairs machine learning heuristics with interactive editing to keep every iteration sharp.
          </p>
          <Link
            href="/api/version"
            className="mt-3 inline-flex items-center justify-center gap-1 text-emerald-300 transition hover:text-emerald-200"
          >
            API version info →
          </Link>
        </footer>
      </div>
    </div>
  );
}
