'use client';
import Link from 'next/link';
import HeroSigil from '@/components/HeroSigil';
import FeatureTile from '@/components/FeatureTile';
import ChartCard from '@/components/ChartCard';
import { Sparkline, Bars } from '@/components/charts';
import { ELEMENTS } from '@/lib/theme';
import { Layers, Table2, Network, Library, Eye, Timer, ScanLine, Gauge, Waves, LineChart as Lc, BarChart as Bc, Sparkles, BrainCircuit, Lightbulb } from 'lucide-react';

export default function Home() {
  return (
    <div className="px-6 py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <HeroSigil color="#f59e0b" glow="rgba(251,191,36,0.28)" variant="aether" />
          <h1 className="font-display text-4xl text-white/90 sm:text-5xl">Scrylytics</h1>
          <p className="text-white/80 text-lg">Where data becomes destiny. AI-powered analytics for collectible card games.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/decklytics" className="rounded-xl bg-emerald-400 px-6 py-3 text-emerald-950 hover:bg-emerald-300 font-medium">
              Get Started
            </Link>
            <button className="rounded-xl border border-white/20 px-6 py-3 text-white/80 hover:bg-white/5">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mt-20 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl text-white/90 mb-4">The Elements of Mastery</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Five interconnected tools, each channeling the power of a different element to reveal the hidden truths of your games.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link href="/decklytics" className="block">
            <div className="group rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 h-full hover:bg-emerald-400/10 transition-all">
              <HeroSigil color={ELEMENTS.earth.hue} glow={ELEMENTS.earth.glow} variant="earth" />
              <h3 className="font-display text-lg text-emerald-200 mt-4 mb-2">{ELEMENTS.earth.name}</h3>
              <p className="text-white/70 text-sm">{ELEMENTS.earth.headline}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-emerald-300 text-sm font-medium">
                {ELEMENTS.earth.cta} →
              </div>
            </div>
          </Link>

          <Link href="/playlytics" className="block">
            <div className="group rounded-2xl border border-air-400/20 bg-air-400/5 p-6 h-full hover:bg-air-400/10 transition-all">
              <HeroSigil color={ELEMENTS.air.hue} glow={ELEMENTS.air.glow} variant="air" />
              <h3 className="font-display text-lg text-air-200 mt-4 mb-2">{ELEMENTS.air.name}</h3>
              <p className="text-white/70 text-sm">{ELEMENTS.air.headline}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-air-300 text-sm font-medium">
                {ELEMENTS.air.cta} →
              </div>
            </div>
          </Link>

          <Link href="/the-forge" className="block">
            <div className="group rounded-2xl border border-fire-400/20 bg-fire-400/5 p-6 h-full hover:bg-fire-400/10 transition-all">
              <HeroSigil color={ELEMENTS.fire.hue} glow={ELEMENTS.fire.glow} variant="fire" />
              <h3 className="font-display text-lg text-amber-200 mt-4 mb-2">{ELEMENTS.fire.name}</h3>
              <p className="text-white/70 text-sm">{ELEMENTS.fire.headline}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-amber-300 text-sm font-medium">
                {ELEMENTS.fire.cta} →
              </div>
            </div>
          </Link>

          <Link href="/metalytics" className="block">
            <div className="group rounded-2xl border border-water-400/20 bg-water-400/5 p-6 h-full hover:bg-water-400/10 transition-all">
              <HeroSigil color={ELEMENTS.water.hue} glow={ELEMENTS.water.glow} variant="water" />
              <h3 className="font-display text-lg text-water-200 mt-4 mb-2">{ELEMENTS.water.name}</h3>
              <p className="text-white/70 text-sm">{ELEMENTS.water.headline}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-water-300 text-sm font-medium">
                {ELEMENTS.water.cta} →
              </div>
            </div>
          </Link>

          <Link href="/the-oracle" className="block">
            <div className="group rounded-2xl border border-aether-400/20 bg-aether-400/5 p-6 h-full hover:bg-aether-400/10 transition-all">
              <HeroSigil color={ELEMENTS.aether.hue} glow={ELEMENTS.aether.glow} variant="aether" />
              <h3 className="font-display text-lg text-aether-200 mt-4 mb-2">{ELEMENTS.aether.name}</h3>
              <p className="text-white/70 text-sm">{ELEMENTS.aether.headline}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-aether-300 text-sm font-medium">
                {ELEMENTS.aether.cta} →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Sample Charts */}
      <section className="mx-auto mt-20 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl text-white/90 mb-4">Live Analytics Preview</h2>
          <p className="text-white/70 text-lg">Real-time insights powered by AI and machine learning</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ChartCard title="Mana Curve Health">
            <Sparkline color="#10b981" />
          </ChartCard>
          <ChartCard title="Synergy Strength">
            <Bars color="#10b981" />
          </ChartCard>
          <ChartCard title="Tempo Analysis">
            <Sparkline color="#7bd3f7" />
          </ChartCard>
          <ChartCard title="Meta Trends">
            <Bars color="#5dd6d3" />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
