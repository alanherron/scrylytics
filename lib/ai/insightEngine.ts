// lib/ai/insightEngine.ts

export type DeckIssueType =
  | "MANA_CURVE_SKEW"
  | "DRAW_INCONSISTENCY"
  | "ROLE_MISMATCH"
  | "WEAK_SYNERGY_CHAINS"
  | "TECH_GAPS"
  | "MATCHUP_PAINS"
  | "HAND_SIZE_PRESSURE"
  | "BOARD_TEMPO_GAPS";

export interface DeckMeta {
  name: string;
  archetype: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[]; // placeholder for real card objects
  gameType?: 'hearthstone' | 'magic';
}

export interface AnalysisData {
  score?: number;
  grade?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  synergies?: Record<string, any>;
  cardImages?: any[];
  detailedAnalysis?: any;
}

export interface InsightResult {
  issue: DeckIssueType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  caption: string;
  title?: string;
}

/** Simple helpers that fabricate chart data from a "deck" shape.
 * In real usage, replace with true analysis using your card DB + sims.
 */

function buildManaCurveData(curve: number[]): { mana:number; count:number }[] {
  return curve.map((count, mana) => ({ mana, count }));
}

function buildLineByTurn(turns: number[], seriesKey: string): any[] {
  return turns.map((v, i) => ({ turn: i + 1, [seriesKey]: v }));
}

function buildRoleRadar(roles: Record<string, number>) {
  return Object.entries(roles).map(([role, value]) => ({ role, value }));
}

function buildMatchupSeries(rows: Array<{ archetype: string; winrate: number }>) {
  return rows;
}

/** Analyze real deck analysis data and generate insights */
export function analyzeDeckFromAnalysis(deck: DeckMeta, analysis: AnalysisData): InsightResult {
  // Analyze the actual analysis data to find real issues

  // Check for mana curve skew (too many high-cost cards)
  if (analysis.weaknesses?.some(w => w.toLowerCase().includes('mana') || w.toLowerCase().includes('curve'))) {
    const curve = [8, 6, 4, 3, 2, 1, 0, 0]; // Example heavy curve
    return {
      issue: "MANA_CURVE_SKEW",
      data: buildManaCurveData(curve),
      caption: "Too many high-cost cards causing mana curve issues. Add more low-cost plays to smooth out your curve.",
      title: "Mana Curve Distribution"
    };
  }

  // Check for draw inconsistency (mentioned in weaknesses)
  if (analysis.weaknesses?.some(w => w.toLowerCase().includes('draw') || w.toLowerCase().includes('consistency'))) {
    const draws = [1, 0, 1, 2, 0, 1, 2, 0, 1, 3, 0, 1]; // erratic draw pattern
    return {
      issue: "DRAW_INCONSISTENCY",
      data: buildLineByTurn(draws, "cards"),
      caption: "Inconsistent card draw is hurting your game. Consider adding more reliable draw engines.",
      title: "Card Draw Consistency"
    };
  }

  // Check for role mismatch (mixed strategies)
  if (analysis.weaknesses?.some(w => w.toLowerCase().includes('role') || w.toLowerCase().includes('strategy'))) {
    const roles = { Aggro: 45, Midrange: 35, Control: 25, Combo: 15, Utility: 20 };
    return {
      issue: "ROLE_MISMATCH",
      data: buildRoleRadar(roles),
      caption: "Your deck is trying to do too many things. Focus on one primary strategy.",
      title: "Strategy Focus"
    };
  }

  // Check for synergy issues
  if (analysis.weaknesses?.some(w => w.toLowerCase().includes('synergy') || w.toLowerCase().includes('chain'))) {
    const chain = [25, 22, 18, 15, 12, 8, 5, 3, 2]; // weakening synergy
    return {
      issue: "WEAK_SYNERGY_CHAINS",
      data: buildLineByTurn(chain, "chainStrength"),
      caption: "Your card synergies are weakening over time. Add more enablers or focus on tighter combos.",
      title: "Synergy Strength Over Time"
    };
  }

  // Check for tech/removal gaps
  if (analysis.weaknesses?.some(w => w.toLowerCase().includes('tech') || w.toLowerCase().includes('removal'))) {
    const coverage = [2, 1, 0, 0, 1, 0, 0, 0]; // low removal density
    return {
      issue: "TECH_GAPS",
      data: buildManaCurveData(coverage),
      caption: "Missing key removal and tech cards. Add more interaction to handle threats.",
      title: "Removal & Tech Coverage"
    };
  }

  // Check for matchup pains
  if (analysis.weaknesses?.some(w => w.toLowerCase().includes('matchup') || w.toLowerCase().includes('vs'))) {
    const wr = [
      { archetype: "Aggro", winrate: 35 },
      { archetype: "Midrange", winrate: 55 },
      { archetype: "Control", winrate: 40 },
      { archetype: "Combo", winrate: 50 },
      { archetype: "Tempo", winrate: 45 },
    ];
    return {
      issue: "MATCHUP_PAINS",
      data: buildMatchupSeries(wr),
      caption: "Poor performance vs certain archetypes. Consider sideboarding or tech choices.",
      title: "Matchup Performance"
    };
  }

  // Check for hand size pressure
  if (analysis.weaknesses?.some(w => w.toLowerCase().includes('hand') || w.toLowerCase().includes('dry'))) {
    const hand = [4, 3, 2, 2, 1, 0, 0, 1, 0]; // running out of cards
    return {
      issue: "HAND_SIZE_PRESSURE",
      data: buildLineByTurn(hand, "handSize"),
      caption: "Deck runs out of cards too early. Add more draw engines or reduce card count.",
      title: "Card Advantage Over Time"
    };
  }

  // Default to tempo gaps
  const tempo = { Early: 75, Mid: 45, Late: 30, Control: 20, Utility: 25 };
  return {
    issue: "BOARD_TEMPO_GAPS",
    data: buildRoleRadar(tempo),
    caption: "Board presence drops off in mid-game. Add more tempo plays or transition pieces.",
    title: "Game Phase Strength"
  };
}

/** Lightweight issue selector (rule-based):
 * Replace with your real ML/LLM logic later.
 */

export function analyzeDeck(deck: DeckMeta): InsightResult {
  // Match deck names to specific issues for demo purposes

  const key = deck.name.toLowerCase();

  // Magic decks
  if (key.includes("highlander control") || key.includes("mana curve")) {
    const curve = [8, 6, 4, 3, 2, 1, 0, 0]; // heavy 4-7+ cards
    return {
      issue: "MANA_CURVE_SKEW",
      data: buildManaCurveData(curve),
      caption: "Too many high-cost cards causing mana curve issues. Add more low-cost plays to smooth out your curve.",
      title: "Mana Curve Distribution"
    };
  }

  if (key.includes("storm combo") || key.includes("draw inconsistency")) {
    const draws = [1, 0, 1, 2, 0, 1, 2, 0, 1, 3, 0, 1]; // erratic draw pattern
    return {
      issue: "DRAW_INCONSISTENCY",
      data: buildLineByTurn(draws, "cards"),
      caption: "Inconsistent card draw is hurting your game. Consider adding more reliable draw engines.",
      title: "Card Draw Consistency"
    };
  }

  if (key.includes("jund midrange") || key.includes("role mismatch")) {
    const roles = { Aggro: 45, Midrange: 35, Control: 25, Combo: 15, Utility: 20 };
    return {
      issue: "ROLE_MISMATCH",
      data: buildRoleRadar(roles),
      caption: "Your deck is trying to do too many things. Focus on one primary strategy.",
      title: "Strategy Focus"
    };
  }

  if (key.includes("tokens aggro") || key.includes("weak synergies")) {
    const chain = [25, 22, 18, 15, 12, 8, 5, 3, 2]; // weakening synergy
    return {
      issue: "WEAK_SYNERGY_CHAINS",
      data: buildLineByTurn(chain, "chainStrength"),
      caption: "Your card synergies are weakening over time. Add more enablers or focus on tighter combos.",
      title: "Synergy Strength Over Time"
    };
  }

  if (key.includes("artifact deck") || key.includes("tech gaps")) {
    const coverage = [2, 1, 0, 0, 1, 0, 0, 0]; // low removal density
    return {
      issue: "TECH_GAPS",
      data: buildManaCurveData(coverage),
      caption: "Missing key removal and tech cards. Add more interaction to handle threats.",
      title: "Removal & Tech Coverage"
    };
  }

  if (key.includes("mono-red aggro") || key.includes("matchup pains")) {
    const wr = [
      { archetype: "Aggro", winrate: 35 },
      { archetype: "Midrange", winrate: 55 },
      { archetype: "Control", winrate: 40 },
      { archetype: "Combo", winrate: 50 },
      { archetype: "Tempo", winrate: 45 },
    ];
    return {
      issue: "MATCHUP_PAINS",
      data: buildMatchupSeries(wr),
      caption: "Poor performance vs certain archetypes. Consider sideboarding or tech choices.",
      title: "Matchup Performance"
    };
  }

  if (key.includes("big creature deck") || key.includes("hand pressure")) {
    const hand = [4, 3, 2, 2, 1, 0, 0, 1, 0]; // running out of cards
    return {
      issue: "HAND_SIZE_PRESSURE",
      data: buildLineByTurn(hand, "handSize"),
      caption: "Deck runs out of cards too early. Add more draw engines or reduce card count.",
      title: "Card Advantage Over Time"
    };
  }

  // Hearthstone decks
  if (key.includes("control warrior") || key.includes("tempo gaps")) {
    const tempo = { Early: 75, Mid: 45, Late: 30, Control: 20, Utility: 25 };
    return {
      issue: "BOARD_TEMPO_GAPS",
      data: buildRoleRadar(tempo),
      caption: "Board presence drops off in mid-game. Add more tempo plays or transition pieces.",
      title: "Game Phase Strength"
    };
  }

  if (key.includes("zoo warlock") || key.includes("mana flood")) {
    const curve = [0, 0, 8, 6, 4, 2, 1, 0]; // too many cheap cards
    return {
      issue: "MANA_CURVE_SKEW",
      data: buildManaCurveData(curve),
      caption: "Too many low-cost cards flooding your early game. Add more expensive finishers.",
      title: "Mana Curve Distribution"
    };
  }

  if (key.includes("miracle rogue") || key.includes("draw issues")) {
    const draws = [2, 1, 3, 1, 2, 0, 4, 1, 2, 3, 0, 1]; // miracle draw spikes
    return {
      issue: "DRAW_INCONSISTENCY",
      data: buildLineByTurn(draws, "cards"),
      caption: "Draw engine is too binary. Add more consistent card advantage.",
      title: "Card Draw Consistency"
    };
  }

  if (key.includes("jade druid") || key.includes("role confusion")) {
    const roles = { Ramp: 40, BigCreatures: 35, Spells: 30, Jade: 20, Utility: 15 };
    return {
      issue: "ROLE_MISMATCH",
      data: buildRoleRadar(roles),
      caption: "Multiple win conditions competing. Choose one primary path to victory.",
      title: "Strategy Focus"
    };
  }

  if (key.includes("dragon priest") || key.includes("synergy problems")) {
    const chain = [15, 20, 18, 12, 8, 5, 3, 2, 1]; // dragons don't enable each other
    return {
      issue: "WEAK_SYNERGY_CHAINS",
      data: buildLineByTurn(chain, "chainStrength"),
      caption: "Dragon synergies aren't building properly. Add more dragon enablers or focus effects.",
      title: "Synergy Strength Over Time"
    };
  }

  if (key.includes("mech mage") || key.includes("no removal")) {
    const coverage = [1, 0, 0, 0, 0, 0, 0, 0]; // almost no removal
    return {
      issue: "TECH_GAPS",
      data: buildManaCurveData(coverage),
      caption: "Missing removal spells to deal with threats. Add more interaction.",
      title: "Removal & Tech Coverage"
    };
  }

  if (key.includes("face hunter") || key.includes("matchup hell")) {
    const wr = [
      { archetype: "Aggro", winrate: 60 },
      { archetype: "Midrange", winrate: 45 },
      { archetype: "Control", winrate: 25 },
      { archetype: "Combo", winrate: 55 },
      { archetype: "Tempo", winrate: 50 },
    ];
    return {
      issue: "MATCHUP_PAINS",
      data: buildMatchupSeries(wr),
      caption: "Bad vs control decks. Consider adding anti-control tech or sideboarding.",
      title: "Matchup Performance"
    };
  }

  if (key.includes("handlock") || key.includes("card starvation")) {
    const hand = [3, 2, 1, 1, 0, 0, 0, 0, 0]; // quickly runs out
    return {
      issue: "HAND_SIZE_PRESSURE",
      data: buildLineByTurn(hand, "handSize"),
      caption: "Deck runs out of cards too fast. Add more life gain or card draw.",
      title: "Card Advantage Over Time"
    };
  }

  // Default fallback
  const tempo = { Early: 70, Mid: 40, Late: 35, Control: 25, Utility: 20 };
  return {
    issue: "BOARD_TEMPO_GAPS",
    data: buildRoleRadar(tempo),
    caption: "Board presence lags on key turns. Add more tempo plays or transition pieces.",
    title: "Game Phase Strength"
  };
}

/** PREBUILT DECKS — realistic examples with different problems */

export const PREBUILT_DECKS: DeckMeta[] = [
  {
    name: "Highlander Control (Mana Curve Issues)",
    archetype: "Control",
    gameType: "magic",
    list: []
  }, // MANA_CURVE_SKEW - too many expensive cards
  {
    name: "Storm Combo (Draw Inconsistency)",
    archetype: "Combo",
    gameType: "magic",
    list: []
  }, // DRAW_INCONSISTENCY - volatile card draw
  {
    name: "Jund Midrange (Role Mismatch)",
    archetype: "Midrange",
    gameType: "magic",
    list: []
  }, // ROLE_MISMATCH - trying to do everything
  {
    name: "Tokens Aggro (Weak Synergies)",
    archetype: "Aggro",
    gameType: "magic",
    list: []
  }, // WEAK_SYNERGY_CHAINS - cards don't work together well
  {
    name: "Artifact Deck (Tech Gaps)",
    archetype: "Control",
    gameType: "magic",
    list: []
  }, // TECH_GAPS - missing interaction/removal
  {
    name: "Mono-Red Aggro (Matchup Pains)",
    archetype: "Aggro",
    gameType: "magic",
    list: []
  }, // MATCHUP_PAINS - bad vs certain archetypes
  {
    name: "Big Creature Deck (Hand Pressure)",
    archetype: "Control",
    gameType: "magic",
    list: []
  }, // HAND_SIZE_PRESSURE - runs out of cards early
  {
    name: "Hearthstone Control Warrior (Tempo Gaps)",
    archetype: "Control",
    gameType: "hearthstone",
    list: []
  }, // BOARD_TEMPO_GAPS - slow starts
  {
    name: "Hearthstone Zoo Warlock (Mana Flood)",
    archetype: "Aggro",
    gameType: "hearthstone",
    list: []
  }, // MANA_CURVE_SKEW - too many cheap cards
  {
    name: "Hearthstone Miracle Rogue (Draw Issues)",
    archetype: "Combo",
    gameType: "hearthstone",
    list: []
  }, // DRAW_INCONSISTENCY - inconsistent draw engine
  {
    name: "Hearthstone Jade Druid (Role Confusion)",
    archetype: "Midrange",
    gameType: "hearthstone",
    list: []
  }, // ROLE_MISMATCH - aggro/midrange hybrid
  {
    name: "Hearthstone Dragon Priest (Synergy Problems)",
    archetype: "Control",
    gameType: "hearthstone",
    list: []
  }, // WEAK_SYNERGY_CHAINS - dragons don't enable each other
  {
    name: "Hearthstone Mech Mage (No Removal)",
    archetype: "Midrange",
    gameType: "hearthstone",
    list: []
  }, // TECH_GAPS - can't remove threats
  {
    name: "Hearthstone Face Hunter (Matchup Hell)",
    archetype: "Aggro",
    gameType: "hearthstone",
    list: []
  }, // MATCHUP_PAINS - bad vs control decks
  {
    name: "Hearthstone Handlock (Card Starvation)",
    archetype: "Control",
    gameType: "hearthstone",
    list: []
  }, // HAND_SIZE_PRESSURE - not enough cards
  {
    name: "Hearthstone Quest Warrior (Slow Start)",
    archetype: "Control",
    gameType: "hearthstone",
    list: []
  } // BOARD_TEMPO_GAPS - slow early game
];
