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
  list: any[];
  gameType?: 'hearthstone' | 'magic';
  chartType?: string;
}

export interface InsightResult {
  issue: DeckIssueType;
  data: any[];
  caption: string;
  title?: string;
  grade?: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
}

// Build mana curve data with balance calculation (surplus/deficit vs ideal)
function buildManaCurveData(curve: number[]): { mana: number; value: number; ideal: number }[] {
  // Ideal curve: balanced distribution favoring mid-range (2-4 mana)
  const idealCurve = [1, 2, 3, 3, 2, 1, 1, 0]; // Example ideal distribution

  return curve.map((count, mana) => ({
    mana,
    value: count - (idealCurve[mana] || 0), // Balance: actual - ideal
    ideal: idealCurve[mana] || 0,
  }));
}

export function analyzeDeck(deck: DeckMeta): InsightResult {
  const key = deck.name.toLowerCase();

  if (key.includes("highlander control") || key.includes("mana curve")) {
    const curve = [8, 6, 4, 3, 2, 1, 0, 0];
    return {
      issue: "MANA_CURVE_SKEW",
      data: buildManaCurveData(curve),
      caption: "Too many high-cost cards causing mana curve issues. Add more low-cost plays to smooth out your curve.",
      title: "Mana Curve Distribution",
      grade: "Needs Work",
      score: 6,
      strengths: ["Strong finishers", "Good board control"],
      weaknesses: ["Slow early game", "Mana curve issues"]
    };
  }

  if (key.includes("zoo warlock") || key.includes("mana flood")) {
    const curve = [0, 0, 8, 6, 4, 2, 1, 0];
    return {
      issue: "MANA_CURVE_SKEW",
      data: buildManaCurveData(curve),
      caption: "Too many low-cost cards flooding your early game. Add more expensive finishers.",
      title: "Mana Curve Distribution",
      grade: "Poor",
      score: 4,
      strengths: ["Fast starts"],
      weaknesses: ["No finishers", "Mana flood issues"]
    };
  }

  if (key.includes("draw-go control") || key.includes("inconsistent draws")) {
    // Sample draw rhythm data: turns 1-10 with actual vs target draws
    const drawRhythmData = [
      { turn: 1, hand: 1, target: 2 },
      { turn: 2, hand: 1, target: 2 },
      { turn: 3, hand: 2, target: 2 },
      { turn: 4, hand: 1, target: 2 },
      { turn: 5, hand: 3, target: 2 },
      { turn: 6, hand: 2, target: 2 },
      { turn: 7, hand: 4, target: 3 },
      { turn: 8, hand: 1, target: 3 },
      { turn: 9, hand: 2, target: 3 },
      { turn: 10, hand: 5, target: 3 },
    ];
    return {
      issue: "DRAW_INCONSISTENCY",
      data: drawRhythmData,
      caption: "Inconsistent card draw prevents reliable game plans. Consider adding more consistent draw engines.",
      title: "Draw Rhythm Analysis",
      grade: "Needs Work",
      score: 5,
      strengths: ["Strong late game"],
      weaknesses: ["Inconsistent draws", "Slow early game"]
    };
  }

  if (key.includes("ramp druid") || key.includes("role mismatch")) {
    // Arcane balance data: ideal vs current percentages (0-100 scale)
    const balanceData = [
      { metric: "Ramp", ideal: 60, current: 85 },
      { metric: "Removal", ideal: 60, current: 20 },
      { metric: "Win Cons", ideal: 55, current: 15 },
      { metric: "Draw", ideal: 65, current: 35 },
      { metric: "Protection", ideal: 50, current: 10 }
    ];
    return {
      issue: "ROLE_MISMATCH",
      data: balanceData,
      caption: "Deck focuses heavily on ramping but lacks removal and protection. Add more interaction.",
      title: "Arcane Balance Analysis",
      grade: "Poor",
      score: 3,
      strengths: ["Excellent ramp"],
      weaknesses: ["No removal", "No protection"]
    };
  }

  if (key.includes("synergy combo") || key.includes("weak chains")) {
    const synergyData = [1, 2, 4, 6, 8, 6, 4, 2];
    return {
      issue: "WEAK_SYNERGY_CHAINS",
      data: buildManaCurveData(synergyData),
      caption: "Combo pieces don't synergize well together. Focus on strengthening key interactions.",
      title: "Synergy Flow Strength",
      grade: "Needs Work",
      score: 5,
      strengths: ["Interesting combo"],
      weaknesses: ["Weak synergy", "Hard to execute"]
    };
  }

  if (key.includes("removal-light aggro") || key.includes("tech gaps")) {
    // Tech gaps data: threats vs coverage (0-10 scale)
    const techGapsData = [
      { threat: "Token Swarm", metaLevel: 0.8, yourAnswers: 0.3, gap: 0.5 },
      { threat: "Big Minions", metaLevel: 0.7, yourAnswers: 0.4, gap: 0.3 },
      { threat: "Burn/Face", metaLevel: 0.6, yourAnswers: 0.2, gap: 0.4 },
      { threat: "Graveyard/Res", metaLevel: 0.5, yourAnswers: 0.4, gap: 0.1 },
      { threat: "Secret/Tricks", metaLevel: 0.4, yourAnswers: 0.1, gap: 0.3 },
      { threat: "Weapons", metaLevel: 0.3, yourAnswers: 0.0, gap: 0.3 },
    ];
    return {
      issue: "TECH_GAPS",
      data: techGapsData,
      caption: "Aggressive deck but missing key tech cards against popular strategies.",
      title: "Tech Coverage vs. Meta Threats",
      grade: "Poor",
      score: 4,
      strengths: ["Aggressive curve"],
      weaknesses: ["Missing tech", "Vulnerable to hate"]
    };
  }

  if (key.includes("matchup warrior") || key.includes("pain points")) {
    // Matchup pains data: score from -5 (poor) to +5 (strong)
    const matchupPainsData = [
      { matchup: "Aggro", score: 3 },      // Strong vs aggro
      { matchup: "Control", score: -3 },   // Weak vs control
      { matchup: "Combo", score: -1 },     // Slightly weak vs combo
      { matchup: "Midrange", score: 1 },   // Slightly strong vs midrange
      { matchup: "Ramp", score: 0 },       // Neutral vs ramp
    ];
    return {
      issue: "MATCHUP_PAINS",
      data: matchupPainsData,
      caption: "Strong vs aggro but weak vs control. Needs better late game tools.",
      title: "Matchup Pain Index",
      grade: "Needs Work",
      score: 6,
      strengths: ["vs Aggro"],
      weaknesses: ["vs Control"]
    };
  }

  if (key.includes("hand disruption") || key.includes("size pressure")) {
    const handData = [7, 6, 5, 4, 3, 2, 1, 0];
    return {
      issue: "HAND_SIZE_PRESSURE",
      data: handData.map((size, turn) => ({ mana: turn + 1, count: size })),
      caption: "Hand disruption cards are pressuring your hand size. Consider hand protection.",
      title: "Average Hand Size by Turn",
      grade: "Poor",
      score: 4,
      strengths: ["Good disruption"],
      weaknesses: ["Hand pressure", "Hard to stabilize"]
    };
  }

  if (key.includes("board control") || key.includes("tempo gaps")) {
    const tempoData = [0, 2, 4, 6, 8, 6, 4, 2];
    return {
      issue: "BOARD_TEMPO_GAPS",
      data: buildManaCurveData(tempoData),
      caption: "Strong board presence but tempo gaps allow opponents to stabilize.",
      title: "Board Tempo/Presence by Turn",
      grade: "Good",
      score: 7,
      strengths: ["Strong board"],
      weaknesses: ["Tempo gaps"]
    };
  }

  if (key.includes("balanced deck")) {
    // Arcane balance data: ideal vs current percentages (0-100 scale)
    const balanceData = [
      { metric: "Ramp", ideal: 60, current: 60 },
      { metric: "Removal", ideal: 60, current: 60 },
      { metric: "Win Cons", ideal: 55, current: 55 },
      { metric: "Draw", ideal: 65, current: 65 },
      { metric: "Protection", ideal: 50, current: 50 }
    ];
    return {
      issue: "ROLE_MISMATCH",
      data: balanceData,
      caption: "Perfectly balanced deck with all roles represented equally.",
      title: "Arcane Balance Analysis",
      grade: "Excellent",
      score: 9,
      strengths: ["Perfectly balanced", "All roles covered"],
      weaknesses: ["May lack focus"]
    };
  }

  // Default fallback
  const curve = [2, 4, 6, 4, 2, 1, 0, 0];
  return {
    issue: "MANA_CURVE_SKEW",
    data: buildManaCurveData(curve),
    caption: "Balanced curve with room for optimization.",
    title: "Mana Curve Distribution",
    grade: "Good",
    score: 8,
    strengths: ["Balanced curve"],
    weaknesses: ["Could be more optimized"]
  };
}

export const PREBUILT_DECKS: DeckMeta[] = [
  {
    name: "Highlander Control (Mana Curve Issues)",
    archetype: "Control",
    gameType: "magic",
    chartType: "Mana Power Curve",
    list: []
  },
  {
    name: "Zoo Warlock (Mana Flood)",
    archetype: "Aggro",
    gameType: "hearthstone",
    chartType: "Mana Power Curve",
    list: []
  },
  {
    name: "Balanced Deck",
    archetype: "Midrange",
    gameType: "magic",
    chartType: "Arcane Balance",
    list: []
  },
  {
    name: "Draw-Go Control (Inconsistent Draws)",
    archetype: "Control",
    gameType: "magic",
    chartType: "Draw Rhythm",
    list: []
  },
  {
    name: "Ramp Druid (Role Mismatch)",
    archetype: "Ramp",
    gameType: "hearthstone",
    chartType: "Arcane Balance",
    list: []
  },
  {
    name: "Synergy Combo (Weak Chains)",
    archetype: "Combo",
    gameType: "magic",
    chartType: "Area",
    list: []
  },
  {
    name: "Removal-Light Aggro (Tech Gaps)",
    archetype: "Aggro",
    gameType: "hearthstone",
    chartType: "Tech Gaps",
    list: []
  },
  {
    name: "Matchup Warrior (Pain Points)",
    archetype: "Control",
    gameType: "hearthstone",
    chartType: "Matchup Pains",
    list: []
  },
  {
    name: "Hand Disruption Warlock (Size Pressure)",
    archetype: "Control",
    gameType: "hearthstone",
    chartType: "Hand Size Pressure",
    list: []
  },
  {
    name: "Board Control Shaman (Tempo Gaps)",
    archetype: "Midrange",
    gameType: "hearthstone",
    chartType: "Area",
    list: []
  }
];