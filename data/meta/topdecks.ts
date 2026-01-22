import raw from './topdecks-meta.json';

export type TopDeckSummary = {
  title: string;
  slug: string;
  link: string;
  author: string;
  published: string;
  class: string;
  format: string;
  archetype: string;
  style: string;
  season: string;
  dustCost: number | null;
  thumbnail: string | null;
  totalCards: number | null;
};

export type MetaBreakdown = {
  label: string;
  count: number;
  percent: number;
  color?: string | null;
};

export type TopDecksMetaSnapshot = {
  scrapedAt: string;
  source: string;
  totalDecks: number;
  classSummary: MetaBreakdown[];
  formatSummary: MetaBreakdown[];
  archetypeSummary: MetaBreakdown[];
  decks: TopDeckSummary[];
};

export const TOPDECKS_META = raw as TopDecksMetaSnapshot;

export const CLASS_COLOR_MAP: Record<string, string> = {
  'Death Knight': '#6e7680',
  'Demon Hunter': '#5e8b7e',
  Druid: '#c98f44',
  Hunter: '#9dc41a',
  Mage: '#4aa3ff',
  Paladin: '#f2c94c',
  Priest: '#d6dde7',
  Rogue: '#b48c73',
  Shaman: '#0090be',
  Warlock: '#7b2c8c',
  Warrior: '#c24c3e',
};
