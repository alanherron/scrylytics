'use client';
import { Eye, Timer, ScanLine, Gauge, PlayCircle, Upload, Wind, ArrowRight } from 'lucide-react';
import HeroSigil from '@/components/HeroSigil';
import FeatureTile from '@/components/FeatureTile';
import ChartCard from '@/components/ChartCard';
import { Sparkline, Bars } from '@/components/charts';
import { ELEMENTS } from '@/lib/theme';
import { COPY } from '@/lib/fake';

export default function Page() {
  const E = ELEMENTS.air;
  const C = COPY.air;

  return (
    <div className="px-6">
      <section className="mx-auto max-w-7xl py-16 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <HeroSigil color={E.hue} glow={E.glow} variant="air" size={208} />
          {C.hero.kicker && <div className="text-air-300/80 text-sm font-medium uppercase tracking-wider">{C.hero.kicker}</div>}
          <h1 className="font-display text-4xl text-air-300 sm:text-5xl">{C.hero.headline}</h1>
          <p className="text-white/80">{C.hero.sub}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button className="rounded-xl bg-air-400 px-4 py-2 text-slate-900 hover:bg-air-300">{C.hero.primaryCta}</button>
            {C.hero.secondaryCta && <button className="rounded-xl border border-white/20 px-4 py-2">{C.hero.secondaryCta}</button>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-10">
        <h2 className="mb-6 flex items-center gap-2 font-semibold text-air-300"><Eye className="size-5"/>Observation Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {C.features.map((f) => {
            const Icon = f.icon === 'Eye' ? Eye : f.icon === 'Timer' ? Timer : f.icon === 'ScanLine' ? ScanLine : f.icon === 'Gauge' ? Gauge : Eye;
            return (
              <FeatureTile key={f.title} icon={Icon} title={f.title} body={f.body} hue={E.hue}/>
            );
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
            <button className="inline-flex items-center gap-2 rounded-xl bg-air-400 px-3 py-2 text-sm text-slate-900 hover:bg-air-300">
              <PlayCircle className="size-4" />
              {C.workbench.leftPrimary.label}
            </button>
            {C.workbench.leftSecondary && (
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm">
                <Upload className="size-4" />
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
            <button className="inline-flex items-center gap-2 rounded-xl bg-air-400 px-4 py-2 text-slate-900 hover:bg-air-300">{C.footerCtas.primary} <ArrowRight className="size-4"/></button>
            {C.footerCtas.secondary && <button className="rounded-xl border border-white/20 px-4 py-2">{C.footerCtas.secondary}</button>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl text-air-300">{C.insightsTitle}</h2>
          <div className="mt-2 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-air-400 to-transparent opacity-60" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {C.insights.map((insight, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-air-500/20 bg-gradient-to-br from-air-950/40 to-sky-950/20 p-6 shadow-glow hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-air-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <h3 className="mb-3 font-semibold text-air-100 text-lg leading-tight">{insight.title}</h3>
                <p className="text-sm text-air-200/80 leading-relaxed">{insight.body}</p>
                <div className="mt-4 flex items-center gap-2 text-air-400/60 text-xs font-medium">
                  <div className="h-px flex-1 bg-gradient-to-r from-air-400/30 to-transparent" />
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
