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

/** Lightweight issue selector (rule-based):
 * Replace with your real ML/LLM logic later.
 */

export function analyzeDeck(deck: DeckMeta): InsightResult {
  // Naive, deterministic selector using deck.name to branch different examples:

  const key = deck.name.toLowerCase();

  if (key.includes("top-heavy") || key.includes("greed")) {
    const curve = [6, 5, 4, 3, 2, 1, 0, 0]; // heavy 4-7+
    return {
      issue: "MANA_CURVE_SKEW",
      data: buildManaCurveData(curve),
      caption: "Curve leans too high; add early plays (1–3 mana) to avoid dead turns.",
      title: "Mana Curve Distribution"
    };
  }

  if (key.includes("rng") || key.includes("inconsistent draw")) {
    const draws = [1, 0, 2, 1, 0, 3, 0, 2, 1, 0, 4, 1]; // volatile draw
    return {
      issue: "DRAW_INCONSISTENCY",
      data: buildLineByTurn(draws, "cards"),
      caption: "Draw pattern is volatile; add cantrips/tutors to stabilize.",
      title: "Card Draw Over Time"
    };
  }

  if (key.includes("role clash") || key.includes("mismatch")) {
    const roles = { Aggro: 30, Midrange: 50, Control: 60, Combo: 10, Utility: 12 };
    return {
      issue: "ROLE_MISMATCH",
      data: buildRoleRadar(roles),
      caption: "Game plan mixes roles; tighten curve/finishers to one primary role.",
      title: "Role Distribution"
    };
  }

  if (key.includes("no synergy") || key.includes("weak chain")) {
    const chain = [20, 25, 18, 22, 15, 12, 10, 8, 5]; // chain strength by turn
    return {
      issue: "WEAK_SYNERGY_CHAINS",
      data: buildLineByTurn(chain, "chainStrength"),
      caption: "Synergy chains fizzle mid-game; add enablers that bridge turns 4–6.",
      title: "Synergy Flow Strength"
    };
  }

  if (key.includes("no tech") || key.includes("tech gap")) {
    // Using a "tech coverage by mana bucket" trick so we can reuse the BarChart
    const coverage = [1, 1, 0, 0, 0, 0, 0, 0]; // almost no tech/removal
    return {
      issue: "TECH_GAPS",
      data: buildManaCurveData(coverage),
      caption: "Low counter/removal density; add cheap interaction and flexible answers.",
      title: "Tech Coverage (Counters/Removal)"
    };
  }

  if (key.includes("matchup pain") || key.includes("vs meta")) {
    const wr = [
      { archetype: "Aggro",    winrate: 42 },
      { archetype: "Midrange", winrate: 48 },
      { archetype: "Control",  winrate: 39 },
      { archetype: "Combo",    winrate: 46 },
      { archetype: "Tempo",    winrate: 44 },
    ];
    return {
      issue: "MATCHUP_PAINS",
      data: buildMatchupSeries(wr),
      caption: "Target tech for Control/Aggro; sideboard/slots should address those dips.",
      title: "Matchup Winrate by Archetype"
    };
  }

  if (key.includes("low hand") || key.includes("runs dry")) {
    const hand = [4, 3, 2, 2, 1, 1, 0, 1, 1]; // average hand size
    return {
      issue: "HAND_SIZE_PRESSURE",
      data: buildLineByTurn(hand, "handSize"),
      caption: "Deck runs dry by mid-game; add draw engines or value generators.",
      title: "Average Hand Size by Turn"
    };
  }

  // default → tempo gaps
  const tempo = { Aggro: 70, Midrange: 40, Control: 35, Combo: 20, Utility: 25 };
  return {
    issue: "BOARD_TEMPO_GAPS",
    data: buildRoleRadar(tempo),
    caption: "Board presence lags on key turns; add cheap minions or sticky threats.",
    title: "Board Tempo/Presence by Turn"
  };
}

/** PREBUILT DECKS — each leads to a different issue & chart */

export const PREBUILT_DECKS: DeckMeta[] = [
  { name: "Top-Heavy Greed Control", archetype: "Control", list: [] },           // MANA_CURVE_SKEW
  { name: "RNG Draw Casino",          archetype: "Combo",   list: [] },           // DRAW_INCONSISTENCY
  { name: "Role Clash Midrange",      archetype: "Midrange",list: [] },           // ROLE_MISMATCH
  { name: "Weak Chain Synergy",       archetype: "Tempo",   list: [] },           // WEAK_SYNERGY_CHAINS
  { name: "Tech Gap Specialist",      archetype: "Midrange",list: [] },           // TECH_GAPS
  { name: "Matchup Pains vs Meta",    archetype: "Control", list: [] },           // MATCHUP_PAINS
  { name: "Runs Dry Low Hand",        archetype: "Aggro",   list: [] },           // HAND_SIZE_PRESSURE
  { name: "Default Tempo Gaps",       archetype: "Tempo",   list: [] },           // BOARD_TEMPO_GAPS (fallback)
];
