'use client';
import Link from 'next/link';
import HeroSigil from '@/components/HeroSigil';
import ChartCard from '@/components/ChartCard';
import ColoredIcon from '@/components/ColoredIcon';
import { Sparkline, Bars } from '@/components/charts';
import { ELEMENTS } from '@/lib/theme';
import { SCRYLYTICS_THEME } from '@/lib/scrylytics-theme';

export default function Home() {
  return (
    <div className="px-6 py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <HeroSigil color="#388E3C" glow="rgba(56,142,60,0.28)" variant="earth" />
          <h1 className="font-display text-4xl text-white sm:text-5xl">Scrylytics</h1>
          <p className="text-textMuted text-lg">Where data becomes destiny. AI-powered analytics for collectible card games.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/decklytics" className="rounded-xl px-6 py-3 font-medium transition" style={{ background: SCRYLYTICS_THEME.elements.water.gradient, color: '#FFFFFF' }}>
              Get Started
            </Link>
            <button className="rounded-xl border px-6 py-3 transition hover:bg-surface" style={{ borderColor: SCRYLYTICS_THEME.colors.border, color: SCRYLYTICS_THEME.colors.textMuted }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mt-20 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl text-white mb-4">The Elements of Mastery</h2>
          <p className="text-textMuted text-lg max-w-2xl mx-auto">
            Four interconnected tools, each channeling the power of a different element to reveal the hidden truths of your games.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/cardlytics" className="block">
            <div className="group rounded-2xl border border-earth-base/20 bg-earth-base/5 p-6 h-full hover:bg-earth-base/10 transition-all" style={{ borderColor: 'rgba(56,142,60,0.2)', backgroundColor: 'rgba(56,142,60,0.05)' }}>
              <div className="flex items-center gap-3 mb-4">
                <ColoredIcon element="earth" size={48} />
                <h3 className="font-display text-lg" style={{ color: ELEMENTS.earth.accent }}>{ELEMENTS.earth.name}</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">{ELEMENTS.earth.headline}</p>
              <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: ELEMENTS.earth.accent }}>
                {ELEMENTS.earth.cta} →
              </div>
            </div>
          </Link>

          <Link href="/decklytics" className="block">
            <div className="group rounded-2xl border border-water-base/20 bg-water-base/5 p-6 h-full hover:bg-water-base/10 transition-all" style={{ borderColor: 'rgba(2,136,209,0.2)', backgroundColor: 'rgba(2,136,209,0.05)' }}>
              <div className="flex items-center gap-3 mb-4">
                <ColoredIcon element="water" size={48} />
                <h3 className="font-display text-lg" style={{ color: ELEMENTS.water.accent }}>{ELEMENTS.water.name}</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">{ELEMENTS.water.headline}</p>
              <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: ELEMENTS.water.accent }}>
                {ELEMENTS.water.cta} →
              </div>
            </div>
          </Link>

          <Link href="/playlytics" className="block">
            <div className="group rounded-2xl border border-fire-base/20 bg-fire-base/5 p-6 h-full hover:bg-fire-base/10 transition-all" style={{ borderColor: 'rgba(229,57,53,0.2)', backgroundColor: 'rgba(229,57,53,0.05)' }}>
              <div className="flex items-center gap-3 mb-4">
                <ColoredIcon element="fire" size={48} />
                <h3 className="font-display text-lg" style={{ color: ELEMENTS.fire.accent }}>{ELEMENTS.fire.name}</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">{ELEMENTS.fire.headline}</p>
              <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: ELEMENTS.fire.accent }}>
                {ELEMENTS.fire.cta} →
              </div>
            </div>
          </Link>

          <Link href="/metalytics" className="block">
            <div className="group rounded-2xl border border-air-base/20 bg-air-base/5 p-6 h-full hover:bg-air-base/10 transition-all" style={{ borderColor: 'rgba(106,27,154,0.2)', backgroundColor: 'rgba(106,27,154,0.05)' }}>
              <div className="flex items-center gap-3 mb-4">
                <ColoredIcon element="air" size={48} />
                <h3 className="font-display text-lg" style={{ color: ELEMENTS.air.accent }}>{ELEMENTS.air.name}</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">{ELEMENTS.air.headline}</p>
              <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: ELEMENTS.air.accent }}>
                {ELEMENTS.air.cta} →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Sample Charts */}
      <section className="mx-auto mt-20 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl text-white mb-4">Live Analytics Preview</h2>
          <p className="text-textMuted text-lg">Real-time insights powered by AI and machine learning</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ChartCard title="Mana Curve Health">
            <Sparkline color={SCRYLYTICS_THEME.elements.earth.base} />
          </ChartCard>
          <ChartCard title="Synergy Strength">
            <Bars color={SCRYLYTICS_THEME.elements.water.base} />
          </ChartCard>
          <ChartCard title="Tempo Analysis">
            <Sparkline color={SCRYLYTICS_THEME.elements.fire.base} />
          </ChartCard>
          <ChartCard title="Meta Trends">
            <Bars color={SCRYLYTICS_THEME.elements.air.base} />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
