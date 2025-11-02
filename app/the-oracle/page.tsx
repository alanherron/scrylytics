'use client';
import { Sparkles, ArrowRight } from 'lucide-react';
import * as Lucide from 'lucide-react';
import HeroSigil from '@/components/HeroSigil';
import FeatureTile from '@/components/FeatureTile';
import ChartCard from '@/components/ChartCard';
import { Sparkline, Bars } from '@/components/charts';
import { ELEMENTS } from '@/lib/theme';
import { COPY } from '@/lib/fake';
import type { ComponentType, SVGProps } from 'react';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

const getLucideIcon = (iconName?: string): LucideIcon | null => {
  if (!iconName) return null;
  const maybeIcon = (Lucide as Record<string, unknown>)[iconName];
  return typeof maybeIcon === 'function' ? (maybeIcon as LucideIcon) : null;
};

export default function Page() {
  const E = ELEMENTS.aether;
  const C = COPY.aether;
  const LeftPrimaryIcon = getLucideIcon(C.workbench.leftPrimary?.icon);
  const LeftSecondaryIcon = getLucideIcon(C.workbench.leftSecondary?.icon);

  return (
    <div className="px-6">
      <section className="mx-auto max-w-7xl py-16 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <HeroSigil color={E.hue} glow={E.glow} variant="aether" />
          {C.hero.kicker && <div className="text-aether-300/80 text-sm font-medium uppercase tracking-wider">{C.hero.kicker}</div>}
          <h1 className="font-display text-4xl text-aether-300 sm:text-5xl">{C.hero.headline}</h1>
          <p className="text-white/80">{C.hero.sub}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button className="rounded-xl bg-aether-400 px-4 py-2 text-slate-900 hover:bg-aether-300">{C.hero.primaryCta}</button>
            {C.hero.secondaryCta && <button className="rounded-xl border border-white/20 px-4 py-2">{C.hero.secondaryCta}</button>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-10">
        <h2 className="mb-6 flex items-center gap-2 font-semibold text-aether-300"><Sparkles className="size-5"/>Mind of Light</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {C.features.map((feature) => {
            const Icon = getLucideIcon(feature.icon) ?? Sparkles;
            return <FeatureTile key={feature.title} icon={Icon} title={feature.title} body={feature.body} hue={E.hue} />;
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 py-12 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h3 className="mb-3 font-semibold">{C.workbench.leftTitle}</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {C.workbench.items.map((item, i)=>(
              <li key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span>{item.label}</span>
                {item.meta && <span className="text-white/50">{item.meta}</span>}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-aether-400 px-3 py-2 text-sm text-slate-900 hover:bg-aether-300">
              {LeftPrimaryIcon && <LeftPrimaryIcon className="size-4" />}
              {C.workbench.leftPrimary.label}
            </button>
            {LeftSecondaryIcon && C.workbench.leftSecondary?.label && (
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm">
                <LeftSecondaryIcon className="size-4" />
                <span>{C.workbench.leftSecondary.label}</span>
              </button>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h3 className="mb-3 font-semibold">{C.analyticsTitle}</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title={C.analyticsLeftTitle}><Sparkline color={E.hue}/></ChartCard>
            <ChartCard title={C.analyticsRightTitle}><Bars color={E.hue}/></ChartCard>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-aether-400 px-4 py-2 text-slate-900 hover:bg-aether-300">{C.footerCtas.primary} <ArrowRight className="size-4"/></button>
            {C.footerCtas.secondary && <button className="rounded-xl border border-white/20 px-4 py-2">{C.footerCtas.secondary}</button>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl text-aether-300">{C.insightsTitle}</h2>
          <div className="mt-2 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-aether-400 to-transparent opacity-60" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {C.insights.map((insight, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-aether-500/20 bg-gradient-to-br from-aether-950/40 to-purple-950/20 p-6 shadow-glow hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-aether-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <h3 className="mb-3 font-semibold text-aether-100 text-lg leading-tight">{insight.title}</h3>
                <p className="text-sm text-aether-200/80 leading-relaxed">{insight.body}</p>
                <div className="mt-4 flex items-center gap-2 text-aether-400/60 text-xs font-medium">
                  <div className="h-px flex-1 bg-gradient-to-r from-aether-400/30 to-transparent" />
                  <span className="uppercase tracking-wider">Insight</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
