import { SCRYLYTICS_THEME } from './scrylytics-theme';

export type ElementKey = 'fire'|'earth'|'air'|'water'|'aether';

// Updated to match new theme structure
// Note: Element mappings changed - earth=Cardlytics, water=Decklytics, fire=Playlytics, air=Metalytics
export const ELEMENTS: Record<ElementKey, {
  name: string;
  hue: string;
  glow: string;
  headline: string;
  sub: string;
  cta: string;
  base?: string;
  accent?: string;
  gradient?: string;
}> = {
  earth:  { 
    name: 'Cardlytics', 
    hue: SCRYLYTICS_THEME.elements.earth.base, 
    base: SCRYLYTICS_THEME.elements.earth.base,
    accent: SCRYLYTICS_THEME.elements.earth.accent,
    gradient: SCRYLYTICS_THEME.elements.earth.gradient,
    glow: 'rgba(56,142,60,0.28)',
    headline: 'Explore every card in the meta.',
    sub: 'Analyze, explore, and compare cards with deep insights and filtering.',
    cta: 'Browse Cards' 
  },
  water:  { 
    name: 'Decklytics', 
    hue: SCRYLYTICS_THEME.elements.water.base, 
    base: SCRYLYTICS_THEME.elements.water.base,
    accent: SCRYLYTICS_THEME.elements.water.accent,
    gradient: SCRYLYTICS_THEME.elements.water.gradient,
    glow: 'rgba(2,136,209,0.28)',
    headline: 'Root your strategy in wisdom.',
    sub: 'Analyze composition, synergy, and structural integrity.',
    cta: 'Analyze a Deck' 
  },
  fire:   { 
    name: 'Playlytics', 
    hue: SCRYLYTICS_THEME.elements.fire.base, 
    base: SCRYLYTICS_THEME.elements.fire.base,
    accent: SCRYLYTICS_THEME.elements.fire.accent,
    gradient: SCRYLYTICS_THEME.elements.fire.gradient,
    glow: 'rgba(229,57,53,0.28)',
    headline: 'In motion lies mastery.',
    sub: 'Track your tempo, patterns, and decision rhythm.',
    cta: 'View Play Insights' 
  },
  air:    { 
    name: 'Metalytics', 
    hue: SCRYLYTICS_THEME.elements.air.base, 
    base: SCRYLYTICS_THEME.elements.air.base,
    accent: SCRYLYTICS_THEME.elements.air.accent,
    gradient: SCRYLYTICS_THEME.elements.air.gradient,
    glow: 'rgba(106,27,154,0.28)',
    headline: 'Reflection reveals the tide.',
    sub: 'Explore trends and meta shifts across the ladder.',
    cta: 'Open Meta Snapshot' 
  },
  aether: { 
    name: 'The Oracle', 
    hue: '#b68cf2', 
    glow: 'rgba(182,140,242,0.28)',
    headline: 'All knowledge flows to the center.',
    sub: 'AI foresight unifying deck, play, and meta data.',
    cta: 'Consult The Oracle' 
  },
};
