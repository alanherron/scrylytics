'use client';

import { Suspense, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import DeckEditorWorkspace from '@/components/DeckEditorWorkspace';
import { saveDeckPrefill } from '@/lib/deck-transfer';
import type { DeckRecord } from '@/data/deck-editor';
import { VERSION, BUILD_DATE, BUILD_NUMBER } from '@/lib/version';
import { useGame } from '@/context/GameContext';

function DeckEditorPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = useMemo(() => searchParams.get('returnTo') ?? '/decklytics', [searchParams]);
  const { game, setGame } = useGame();

  // Set default game to Hearthstone when editor loads
  useEffect(() => {
    if (game !== 'hearthstone') {
      setGame('hearthstone');
    }
  }, [game, setGame]);

  const handleApplyToAnalyzer = (deckCode: string, format?: DeckRecord['format']) => {
    if (!deckCode) return;
    saveDeckPrefill({ deckCode, format });

    const params = new URLSearchParams();
    params.set('prefill', '1');
    if (format) params.set('format', format);
    router.push(`/decklytics?${params.toString()}`);
  };

  return (
    <div className="px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
          >
            <ChevronLeft className="size-4" />
            Back to Analyzer
          </Link>

          <section className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/10 p-8 shadow-[0_50px_120px_-60px_rgba(16,185,129,0.75)]">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,1fr)] lg:items-center">
              <div className="flex flex-col gap-6">
                <div className="text-emerald-200/80 text-xs font-semibold uppercase tracking-[0.45em]">
                  Decklytics Workbench
                </div>
                <h1 className="font-display text-4xl text-emerald-50 sm:text-5xl">Iterate & Branch Decks</h1>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  Edit and experiment with decks in a dedicated workspace. Make changes, test variations, and branch off different versions—all without losing your work. When you&apos;re ready, send your deck to the Analyzer for AI-powered insights.
                </p>
                <div className="mt-4 grid gap-3 text-xs text-emerald-100/70 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-200" />
                    <span><strong>Iterate:</strong> Edit cards, adjust counts, and refine your deck composition.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-200" />
                    <span><strong>Branch:</strong> Save variations to test different builds side-by-side.</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 rounded-3xl border border-emerald-400/25 bg-[#07101f]/80 p-6 backdrop-blur">
                <div className="flex items-center justify-between text-xs text-emerald-100/70">
                  <span>Build #{BUILD_NUMBER}</span>
                  <span>
                    v{VERSION} · {BUILD_DATE}
                  </span>
                </div>
                <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Looking to analyze a deck instead?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/decklytics')}
                    className="inline-flex items-center gap-2 text-emerald-200 transition hover:text-emerald-100"
                  >
                    Open Analyzer
                    <ArrowRight className="size-4" />
                  </button>
                </p>
              </div>
            </div>
          </section>
        </div>

        <DeckEditorWorkspace onApplyToAnalyzer={handleApplyToAnalyzer} />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-white/60">
          <div className="font-semibold text-white/70">Tip</div>
          Decks sent to the analyzer are staged locally and cleared once Decklytics loads them. You can branch,
          save, and return here without losing your context.
        </div>

        <footer className="border-t border-white/10 pt-8 text-center text-xs text-white/50">
          <div className="font-semibold text-white/70">
            Scrylytics v{VERSION} · Build #{BUILD_NUMBER} · {BUILD_DATE}
          </div>
          <p className="mt-2">Deck Workbench isolates editing from live analytics to keep the experience steady.</p>
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

export default function DeckEditorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10 text-sm text-white/60">Loading editor…</div>}>
      <DeckEditorPageInner />
    </Suspense>
  );
}
