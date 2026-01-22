'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Upload,
  Sparkles,
  Compass,
  Target,
  Shield,
  LineChart,
  Activity,
  Layers,
  BarChart3,
  Sword,
  Flame,
  Timer,
  Network,
  Library,
} from 'lucide-react';
import type { ComponentType } from 'react';
import HeroSigil from '@/components/HeroSigil';
import ChartCard from '@/components/ChartCard';
import { Sparkline, Bars } from '@/components/charts';
import { ELEMENTS } from '@/lib/theme';

interface MetricCard {
  label: string;
  value: string;
  change?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: string;
  descriptor?: string;
}

interface Pillar {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

interface WorkflowShortcut {
  title: string;
  description: string;
  badge: string;
  href: string;
  cta: string;
  icon: ComponentType<{ className?: string }>;
}

interface ContinuityLink {
  label: string;
  description: string;
  href: string;
}

interface ResourceLink {
  title: string;
  description: string;
  href: string;
}

const heroHighlights = [
  'Rapid archetype detection aligns reports to your intended game plan.',
  'Deck Builder keeps versions in sync with analyzer findings.',
  'Saved runs and practice scripts live inside your strategy library.',
];

const workflowShortcuts: WorkflowShortcut[] = [
  {
    title: 'Deck Analyzer',
    description: 'Upload a list, auto-detect archetype intent, and surface structural gaps in seconds.',
    badge: 'Diagnostics',
    href: '/analyzer?returnTo=/decklyzer',
    cta: 'Launch Analyzer',
    icon: Activity,
  },
  {
    title: 'Deck Builder',
    description: 'Iterate variants, track swaps, and push revisions back into Decklyzer without copy-paste.',
    badge: 'Iteration',
    href: '/decklytics/editor?returnTo=/decklyzer',
    cta: 'Open Builder',
    icon: Layers,
  },
  {
    title: 'Strategy Library',
    description: 'Browse saved runs, practice scripts, and archetype primers to prep the next session.',
    badge: 'Reference',
    href: '/decklytics/library',
    cta: 'Browse Library',
    icon: Library,
  },
];

const foundationMetrics: MetricCard[] = [
  { label: 'Curve Stability', value: '92', change: '+6 vs field', icon: Activity, tone: 'text-emerald-400', descriptor: 'score' },
  { label: 'Redundancy Index', value: '78', change: 'Balanced suite', icon: Layers, tone: 'text-emerald-300', descriptor: 'score' },
  { label: 'Threat Density', value: '18', change: '16 optimal', icon: Sword, tone: 'text-amber-300', descriptor: 'focus targets' },
  { label: 'Interaction Coverage', value: '12', change: 'Needs +2', icon: Shield, tone: 'text-sky-300', descriptor: 'slots' },
];

const archetypeSignals: MetricCard[] = [
  { label: 'Archetype Match', value: 'Emerald Ramp Druid', change: '97% signature overlap', icon: Compass },
  { label: 'Meta Win Rate', value: '56.4%', change: '+3.1% vs ladder', icon: BarChart3 },
  { label: 'Game Length', value: '8.7 turns', change: 'Faster than other macro lists', icon: Timer },
  { label: 'Risk Profile', value: 'Low variance', change: 'Stable resource curve', icon: Flame },
];

const insightPillars: Pillar[] = [
  {
    title: 'Tempo Windows & Curve',
    description: 'Spot dead turns and pressure spikes with annotated mulligan guidance.',
    icon: LineChart,
  },
  {
    title: 'Synergy Lattice',
    description: 'Cluster cross-card triggers to expose win-more pieces versus core engines.',
    icon: Network,
  },
  {
    title: 'Matchup Command Decks',
    description: 'Auto-build playbooks with priority lines, swaps, and pivot alerts.',
    icon: Target,
  },
];

const prefillSamples = [
  'HS • Control Warrior — Role discipline check',
  'HS • Miracle Rogue — Draw sequencing stress test',
  'MTG • Rakdos Midrange — Sideboard planning',
  'MTG • Izzet Phoenix — Redundancy audit',
];

const continuityLinks: ContinuityLink[] = [
  {
    label: 'Version decks in the Builder',
    description: 'Duplicate this list, try bold pivots, and send winning lines back for a fresh analysis.',
    href: '/decklytics/editor?returnTo=/decklyzer',
  },
  {
    label: 'Reference the Strategy Library',
    description: 'Compare against saved archetypes, runbook scripts, and matchup notes before queueing.',
    href: '/decklytics/library',
  },
];

const resourceLinks: ResourceLink[] = [
  {
    title: 'Deck Library & Version Vault',
    description: 'Keep every list, analysis, and practice script synced across your roster.',
    href: '/decklytics/library',
  },
  {
    title: 'Deck Builder Workbench',
    description: 'Branch new variants with diff tracking and one-click pushes into Decklyzer.',
    href: '/decklytics/editor?returnTo=/decklyzer',
  },
  {
    title: 'Strategist’s Handbook',
    description: 'Deep dives on tempo theory, role assignment, and adaptive sideboarding for ladder climbs.',
    href: '#handbook',
  },
  {
    title: 'Forge Integration',
    description: 'Send this list straight to The Forge for simulation batches and timeline stress testing.',
    href: '/the-forge',
  },
];

export default function DecklyzerPage() {
  const element = ELEMENTS.earth;

  return (
    <div className="px-6 pb-24">
      <section className="hero-section mx-auto max-w-6xl py-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-6">
          <HeroSigil color={element.hue} glow={element.glow} variant="earth" />
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold tracking-[0.3em] text-emerald-200 uppercase">
            Deck intelligence workflow
          </span>
          <h1 className="font-display text-4xl text-white sm:text-5xl">
            Bring every deck decision into one orchestrated view
          </h1>
          <p className="max-w-3xl text-lg text-white/80">
            Decklyzer unites analysis, building, and knowledge management so you can evaluate a list, iterate it, and back up every queue with current intel.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/analyzer?returnTo=/decklyzer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              Analyze a Deck Now
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/decklytics/editor?returnTo=/decklyzer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 px-6 py-3 text-sm font-semibold text-emerald-50/80 transition hover:bg-emerald-400/10"
            >
              Open Deck Builder
            </Link>
            <Link
              href="/decklytics/library"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              Visit Strategy Library
              <Library className="size-4" />
            </Link>
          </div>
          <ul className="mt-6 grid gap-3 text-sm text-white/70 sm:grid-cols-3 sm:text-left">
            {heroHighlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 text-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <header className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <h2 className="font-display text-3xl text-white">Choose the right launch point</h2>
              <p className="text-sm text-white/70">
                Start with diagnostics, tune in the builder, or pull supporting intel—Decklyzer keeps every workflow aligned.
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
              Seamless handoffs included
            </span>
          </header>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflowShortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Link
                  key={shortcut.title}
                  href={shortcut.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                      {shortcut.badge}
                    </span>
                    <Icon className="size-5 text-emerald-300" />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white">{shortcut.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{shortcut.description}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                    {shortcut.cta}
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl gap-8 lg:grid lg:grid-cols-[7fr,5fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-white">Deck Intake Console</h2>
                <p className="text-sm text-white/70">Paste a list or upload a file to begin your run. We auto-detect archetype and format before the first graph renders.</p>
              </div>
              <Upload className="size-5 text-emerald-300" />
            </header>
            <div className="mt-6 grid gap-6 xl:grid-cols-[3fr,2fr]">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">Deck code or list</label>
                <textarea
                  className="h-44 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="AAECAZICBOO2BvXrA4T+Aw2lBAv6BcQGig86igGdpAHTsQH0sQHp0QKE5gKh+QIA"
                />
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200/80">
                    <Sparkles className="size-3" />
                    Auto format detection
                  </span>
                  <span>Drag-and-drop .txt, .deck, or .hsimport files</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <h3 className="text-sm font-semibold text-white">Supported formats</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/80">
                    {['Hearthstone', 'Magic: Arena', 'Magic: Paper', 'Legends of Runeterra'].map((format) => (
                      <span
                        key={format}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1"
                      >
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  <h3 className="mb-1 flex items-center gap-2 font-semibold">
                    <Compass className="size-4" />
                    Intelligent Prefills
                  </h3>
                  <p>Decklyzer selects relevant modules (curve, matchup, pattern) before you press analyze.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
              <Sparkles className="size-4" />
              Prefill samples
            </h3>
            <p className="mt-2 text-sm text-emerald-50/80">Load a proven template to jump straight into scenario testing.</p>
            <ul className="mt-4 space-y-2 text-sm text-emerald-50/90">
              {prefillSamples.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between gap-2 rounded-xl border border-emerald-400/30 bg-black/20 px-3 py-2 transition hover:border-emerald-300/60"
                >
                  {item}
                  <button className="text-xs font-semibold text-emerald-200">Load</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="mt-8 space-y-6 lg:mt-0">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <header className="mb-4">
              <h3 className="font-semibold text-white">Live simulation snapshot</h3>
              <p className="text-xs text-white/60">Most recent Emerald Ramp Druid run.</p>
            </header>
            <dl className="space-y-3 text-sm text-white/80">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-white/60">Primary role</dt>
                <dd className="font-semibold text-emerald-300">Macro Ramp Control</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-white/60">Core win condition</dt>
                <dd className="font-semibold text-white">Scale + Solar Alignment</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-white/60">Weakest matchup</dt>
                <dd className="font-semibold text-rose-300">Aggro Demon Hunter (45.2%)</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-white/60">Suggested tech</dt>
                <dd className="font-semibold text-amber-200">+2 Earthen Scales</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold text-white">Stay in the loop</h3>
            <p className="mt-1 text-sm text-white/70">
              Close the gap between discovery, iteration, and prep. These shortcuts keep every tool pointing to the same goal.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {continuityLinks.map((item) => (
                <li key={item.label} className="rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-emerald-400/40">
                  <Link href={item.href} className="flex items-center justify-between gap-3 text-white">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs text-white/60">{item.description}</p>
                    </div>
                    <ArrowRight className="size-4 text-emerald-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="mx-auto mt-16 max-w-7xl space-y-8">
        <header className="flex flex-col gap-3 text-center sm:text-left">
          <h2 className="font-display text-3xl text-white">Live intelligence snapshot</h2>
          <p className="text-sm text-white/70">Decklyzer aggregates structural health, meta positioning, and tempo timing into one place.</p>
        </header>
        <div className="grid gap-8 xl:grid-cols-[5fr,4fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {foundationMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-black/30">
                      <Icon className={`size-5 ${metric.tone ?? 'text-white/70'}`} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Foundation metric</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-white">{metric.value}</span>
                    <span className="text-sm text-white/60">{metric.descriptor ?? 'score'}</span>
                  </div>
                  {metric.change && <p className="mt-2 text-sm text-white/70">{metric.change}</p>}
                  <p className="mt-4 text-sm font-medium text-white">{metric.label}</p>
                </div>
              );
            })}
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <header className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">Archetype & meta intelligence</h3>
                  <p className="text-xs text-white/60">Understand how your list slots into the current field.</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                  Updated 2 hours ago
                </span>
              </header>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {archetypeSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div
                      key={signal.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-black/30">
                          <Icon className="size-4 text-emerald-300" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Signal</p>
                          <h4 className="text-sm font-semibold text-white">{signal.label}</h4>
                        </div>
                      </div>
                      <div className="mt-4 text-2xl font-semibold text-white">{signal.value}</div>
                      {signal.change && <p className="mt-1 text-sm text-white/70">{signal.change}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ChartCard title="Archetype performance vs meta">
                <Bars color={element.hue} />
              </ChartCard>
              <ChartCard title="Tempo windows & mulligan outcomes">
                <Sparkline color={element.hue} />
              </ChartCard>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl">
        <header className="flex flex-col gap-2 text-center sm:text-left">
          <h2 className="font-display text-3xl text-white">Elemental modules that guide the pilot</h2>
          <p className="text-sm text-white/70">Each report assembles focused modules that mirror how games actually unfold.</p>
        </header>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {insightPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-300/10 opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <Icon className="size-6 text-emerald-300" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{pillar.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                    <span className="h-px w-6 bg-gradient-to-r from-emerald-300 to-transparent" />
                    Module
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="font-display text-2xl text-white">Matchup command center</h2>
            <p className="mt-2 text-sm text-white/70">Playbooks deliver tactical priorities, mulligan rules, and counter-tech for the meta’s fiercest foes.</p>
            <div className="mt-6 space-y-4">
              {[
                {
                  matchup: 'Aggro Demon Hunter',
                  plan: 'Stall early with Watch Posts, then pivot to proactive Scale + Solar finish.',
                  priority: 'High Pressure',
                  tech: '+1 Dozing Kelpkeeper, +1 Earthen Scales',
                },
                {
                  matchup: 'Rainbow Mage',
                  plan: 'Force awkward clears, maintain armor thresholds, pressure with Nourish turns.',
                  priority: 'Tempo Race',
                  tech: '+2 Speaker Stomper',
                },
                {
                  matchup: 'Control Warrior',
                  plan: 'Lean into greed, maximize card draw cycles, save alignment for double combo turn.',
                  priority: 'Resource Attrition',
                  tech: '+1 Floop, +1 Moonbeam',
                },
              ].map((item) => (
                <div key={item.matchup} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <header className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-white">{item.matchup}</h3>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                      {item.priority}
                    </span>
                  </header>
                  <p className="mt-2 text-sm text-white/70">{item.plan}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">Tech adjustments</p>
                  <p className="mt-1 text-sm text-white">{item.tech}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8">
            <h2 className="font-display text-2xl text-emerald-100">Practice scripts & logging</h2>
            <p className="mt-2 text-sm text-emerald-50/80">
              Export rehearsal scripts that map your first three turns, essential resource thresholds, and key pivot lines.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-emerald-50/90">
              <li className="flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-black/20 px-4 py-3">
                <Target className="size-5 text-emerald-200" />
                Turn sequencer with mulligan contingencies for common openers.
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-black/20 px-4 py-3">
                <Shield className="size-5 text-emerald-200" />
                Defensive breakpoint tracker with armor and life thresholds.
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-black/20 px-4 py-3">
                <Flame className="size-5 text-emerald-200" />
                Combo turn rehearsal with alternate win-condition flowcharts.
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-black/20 px-4 py-3">
                <Sparkles className="size-5 text-emerald-200" />
                Auto-sync with Forge simulations to compare expected vs actual game logs.
              </li>
            </ul>
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300">
              Export practice script
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl">
        <h2 className="font-display text-3xl text-white">Decklyzer knowledge vault</h2>
        <p className="mt-2 text-sm text-white/70">
          Never analyze in isolation—connect to supporting resources so prep, play, and review inform one another.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {resourceLinks.map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
            >
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-100">{resource.title}</h3>
                <p className="mt-2 text-sm text-white/70">{resource.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                Explore
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center">
        <h2 className="font-display text-3xl text-emerald-50">Ready to master the climb?</h2>
        <p className="mt-3 text-sm text-emerald-50/90">
          Decklyzer unites deck construction, meta knowledge, and practice scripts into one elemental workflow—then keeps every iteration synced.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/analyzer?returnTo=/decklyzer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
          >
            Launch deck analysis
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/decklytics/editor?returnTo=/decklyzer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 px-6 py-3 text-sm font-semibold text-emerald-50/80 hover:bg-black/20"
          >
            Iterate in the builder
            <Layers className="size-4" />
          </Link>
          <Link
            href="/decklytics/library"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 px-6 py-3 text-sm font-semibold text-emerald-50/80 hover:bg-black/20"
          >
            Sync with library
            <Library className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
