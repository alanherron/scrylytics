export type ElementKey = 'fire'|'earth'|'air'|'water'|'aether';

export const ELEMENTS: Record<ElementKey, {
  name: string;
  hue: string;
  glow: string;
  headline: string;
  sub: string;
  cta: string;
}> = {
  fire:   { name:'The Forge', hue:'#f59e0b', glow:'rgba(251,191,36,0.28)',
            headline:'Where strategy is tempered in fire.',
            sub:'Experiment, refine, and evolve your decks through simulation.',
            cta:'Start a Simulation' },
  earth:  { name:'Decklytics', hue:'#10b981', glow:'rgba(16,185,129,0.28)',
            headline:'Root your strategy in wisdom.',
            sub:'Analyze composition, synergy, and structural integrity.',
            cta:'Analyze a Deck' },
  air:    { name:'Playlytics', hue:'#7bd3f7', glow:'rgba(123,211,247,0.28)',
            headline:'In motion lies mastery.',
            sub:'Track your tempo, patterns, and decision rhythm.',
            cta:'View Play Insights' },
  water:  { name:'Metalytics', hue:'#5dd6d3', glow:'rgba(93,214,211,0.28)',
            headline:'Reflection reveals the tide.',
            sub:'Explore trends and meta shifts across the ladder.',
            cta:'Open Meta Snapshot' },
  aether: { name:'The Oracle', hue:'#b68cf2', glow:'rgba(182,140,242,0.28)',
            headline:'All knowledge flows to the center.',
            sub:'AI foresight unifying deck, play, and meta data.',
            cta:'Consult The Oracle' },
};
