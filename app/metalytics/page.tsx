import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowDownRight, BarChart2, Flame, Layers, Sparkles, Trophy, Users } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import HeroSigil from '@/components/HeroSigil';
import { getHearthstoneMeta, type NormalizedArchetype, type NormalizedCard } from '@/lib/services/hearthstoneMeta';

type Metric = {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type ArchetypeSummary = {
  archetype: NormalizedArchetype;
  trend: 'up' | 'down' | 'flat';
  winRateLabel: string;
  popularityLabel: string;
};

type CardHighlight = NormalizedCard & {
  archetypeName: string;
  deckWinRate: number | null;
  deckPopularity: number | null;
};

function formatPercent(value: number | null, fractionDigits = 1) {
  if (value === null || Number.isNaN(value)) return '—';
  return `${value.toFixed(fractionDigits)}%`;
}

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString();
}

function getTrend(winRateDelta: number | null, popularityDelta: number | null): 'up' | 'down' | 'flat' {
  const delta = winRateDelta ?? popularityDelta ?? 0;
  if (delta > 0.05) return 'up';
  if (delta < -0.05) return 'down';
  return 'flat';
}

function summariseArchetype(archetype: NormalizedArchetype): ArchetypeSummary {
  const trend = getTrend(archetype.trend.winRateDelta, archetype.trend.popularityDelta);
  return {
    archetype,
    trend,
    winRateLabel: formatPercent(archetype.winRate),
    popularityLabel: formatPercent(archetype.popularity),
  };
}

function gatherCardHighlights(archetypes: NormalizedArchetype[]): CardHighlight[] {
  const highlights: CardHighlight[] = [];

  archetypes.slice(0, 4).forEach((archetype) => {
    archetype.cardBreakdown.slice(0, 6).forEach((card) => {
      highlights.push({
        ...card,
        archetypeName: archetype.name,
        deckWinRate: archetype.winRate,
        deckPopularity: archetype.popularity,
      });
    });
  });

  return highlights.sort((a, b) => (b.deckWinRate ?? 0) - (a.deckWinRate ?? 0));
}

function buildMetrics(archetypes: NormalizedArchetype[], lastUpdated: string | null): Metric[] {
  const topWin = [...archetypes].sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0))[0];
  const topPop = [...archetypes].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0];
  const averageWin =
    archetypes.length > 0
      ? archetypes.reduce((sum, item) => sum + (item.winRate ?? 0), 0) / archetypes.length
      : null;

  return [
    {
      label: 'Updated',
      value: lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Awaiting refresh',
      icon: Sparkles,
    },
    {
      label: 'Top Winrate',
      value: topWin ? topWin.name : 'No data',
      hint: topWin ? formatPercent(topWin.winRate, 2) : undefined,
      icon: Trophy,
    },
    {
      label: 'Most Popular',
      value: topPop ? topPop.name : 'No data',
      hint: topPop ? formatPercent(topPop.popularity, 2) : undefined,
      icon: Users,
    },
    {
      label: 'Average Winrate',
      value: averageWin ? formatPercent(averageWin, 2) : '—',
      icon: BarChart2,
    },
  ];
}

function TrendBadge({ trend, delta }: { trend: 'up' | 'down' | 'flat'; delta: number | null }) {
  if (delta === null || trend === 'flat') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">
        <Layers className="size-3" />
        Stable
      </span>
    );
  }

  const Icon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const tone = trend === 'up' ? 'text-emerald-300/80 border-emerald-400/30' : 'text-rose-300/80 border-rose-400/30';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${tone}`}>
      <Icon className="size-3" />
      {delta > 0 ? '+' : ''}
      {delta.toFixed(2)}%
    </span>
  );
}

function ArchetypeCard({ summary }: { summary: ArchetypeSummary }) {
  const { archetype, trend, winRateLabel, popularityLabel } = summary;
  const winDelta = archetype.trend.winRateDelta;
  const popularityDelta = archetype.trend.popularityDelta;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 shadow-glow transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-white/90">{archetype.name}</h3>
            <p className="text-xs uppercase tracking-wider text-white/40">{archetype.class ?? 'Unknown class'}</p>
          </div>
          <TrendBadge trend={trend} delta={winDelta ?? popularityDelta ?? null} />
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-white/40">Winrate</dt>
            <dd className="text-xl font-semibold text-cyan-300">{winRateLabel}</dd>
            {winDelta !== null && (
              <p className="mt-1 text-xs text-cyan-200/70">{winDelta > 0 ? '+' : ''}{winDelta.toFixed(2)}% vs prior</p>
            )}
          </div>
          <div className="text-right">
            <dt className="text-white/40">Popularity</dt>
            <dd className="text-xl font-semibold text-sky-300">{popularityLabel}</dd>
            {popularityDelta !== null && (
              <p className="mt-1 text-xs text-sky-200/70">{popularityDelta > 0 ? '+' : ''}{popularityDelta.toFixed(2)}% vs prior</p>
            )}
          </div>
        </dl>
        <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Key Cards</h4>
          <div className="flex flex-wrap gap-2">
            {archetype.cardBreakdown.slice(0, 6).map((card) => (
              <span key={card.dbfId} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
                <span className="font-semibold text-cyan-300">{card.count}×</span>
                {card.name}
              </span>
            ))}
            {archetype.cardBreakdown.length === 0 && (
              <span className="text-xs text-white/40">No card data available yet.</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
          <span>{archetype.deckCodes.length > 0 ? `${archetype.deckCodes.length} deck codes` : 'No deck codes yet'}</span>
          <span>{formatNumber(archetype.totalGames)} games tracked</span>
        </div>
      </div>
    </article>
  );
}

function CardShowcase({ card }: { card: CardHighlight }) {
  const hasImage = typeof card.image === 'string' && card.image.length > 0;
  return (
    <div className="flex gap-4 rounded-2xl border border-white/5 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/5 p-4 shadow-glow-sm">
      {hasImage ? (
        <img
          src={card.image ?? ''}
          alt={card.name}
          className="h-24 w-16 rounded-lg border border-white/10 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-24 w-16 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-xs text-white/60">
          No art
        </div>
      )}
      <div className="flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white/90">{card.name}</h4>
          <p className="text-xs uppercase tracking-wide text-white/40">{card.type ?? 'Card'}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
            <Flame className="size-3 text-cyan-300" />
            {card.archetypeName}
          </span>
          <span>{formatPercent(card.deckWinRate)} WR</span>
          <span>{formatPercent(card.deckPopularity)} Pop</span>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 3600;

export default async function Page() {
  const meta = await getHearthstoneMeta({ format: 'standard', timeRange: 'LAST_7_DAYS' });

  if (!meta || meta.archetypes.length === 0) {
    return notFound();
  }

  const archetypes = meta.archetypes.map(summariseArchetype);
  const metrics = buildMetrics(meta.archetypes, meta.lastUpdated);
  const highlights = gatherCardHighlights(meta.archetypes);
  const topTrend = archetypes.filter((item) => item.trend === 'up').slice(0, 3);

  return (
    <div className="px-6 py-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3 text-sm uppercase tracking-widest text-cyan-200/60">
            <Sparkles className="size-4" />
            Hearthstone Meta Pulse
          </div>
          <h1 className="font-display text-4xl text-white/90 sm:text-5xl">
            Today’s Standard Landscape
          </h1>
          <p className="max-w-2xl text-white/70">
            Fresh winrate and popularity signals captured directly from HSReplay. See which archetypes
            are surging, track stability, and spot the cards that define the ladder right now.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <metric.icon className="size-8 text-cyan-300" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">{metric.label}</p>
                  <p className="text-base font-semibold text-white/85">{metric.value}</p>
                  {metric.hint && <p className="text-xs text-white/50">{metric.hint}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center lg:block">
          <HeroSigil color="#5dd6d3" glow="rgba(93,214,211,0.28)" variant="water" size={220} />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-white/90">Featured Archetypes</h2>
            <p className="text-sm text-white/60">
              Top performers ranked by winrate and ladder presence over the last seven days.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-200">
            <Flame className="size-4" />
            Trending archetypes: {topTrend.length > 0 ? topTrend.map((item) => item.archetype.name).join(', ') : 'No movers'}
          </span>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {archetypes.slice(0, 6).map((summary) => (
            <ArchetypeCard key={summary.archetype.name} summary={summary} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white/90">Signature Cards</h2>
            <p className="text-sm text-white/60">
              Spotlight on the cards anchoring the ladder’s premier strategies.
            </p>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {highlights.map((card) => (
            <CardShowcase key={`${card.dbfId}-${card.archetypeName}`} card={card} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <header className="mb-6 flex items-center gap-3 text-white/80">
          <Layers className="size-6 text-cyan-300" />
          <h2 className="font-display text-2xl">Historical Snapshots</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meta.history.slice(0, 6).map((snapshot, index) => (
            <div key={`${snapshot.timestamp}-${String(index)}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-wide text-white/40">Captured</p>
              <p className="font-semibold text-white/90">{new Date(snapshot.timestamp).toLocaleString()}</p>
              <div className="mt-3 space-y-2 text-xs">
                {snapshot.archetypes.slice(0, 3).map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="text-white/70">{entry.name}</span>
                    <span className="text-white/50">{formatPercent(entry.winRate, 1)} WR</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {meta.history.length === 0 && (
          <p className="text-sm text-white/50">History will begin populating after the first refresh cycle.</p>
        )}
      </section>

      <footer className="mx-auto mt-16 max-w-6xl rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 p-8 text-white/80">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-white/90">Need deeper diagnostics?</h2>
            <p className="mt-2 text-sm text-white/60">
              Tap into our analyzer to generate matchup matrices, mulligan scores, and tailored deck advice.
            </p>
          </div>
          <a
            href="/analyzer"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-cyan-200 transition hover:bg-cyan-400/20"
          >
            Launch Analyzer
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </footer>
    </div>
  );
}
