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

function buildManaCurveData(curve: number[]): { mana:number; count:number }[] {
  return curve.map((count, mana) => ({ mana, count }));
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
    const drawData = [0, 1, 2, 3, 4, 5, 6, 7];
    return {
      issue: "DRAW_INCONSISTENCY",
      data: drawData.map((count, turn) => ({ mana: turn + 1, count })),
      caption: "Inconsistent card draw prevents reliable game plans. Consider adding more consistent draw engines.",
      title: "Card Draw Over Time",
      grade: "Needs Work",
      score: 5,
      strengths: ["Strong late game"],
      weaknesses: ["Inconsistent draws", "Slow early game"]
    };
  }

  if (key.includes("ramp druid") || key.includes("role mismatch")) {
    const roleData = [
      { role: "Ramp", value: 8 },
      { role: "Removal", value: 2 },
      { role: "Win Cons", value: 6 },
      { role: "Draw", value: 4 },
      { role: "Protection", value: 1 }
    ];
    return {
      issue: "ROLE_MISMATCH",
      data: roleData,
      caption: "Deck focuses heavily on ramping but lacks removal and protection. Add more interaction.",
      title: "Role Distribution",
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
    const curve = [6, 8, 4, 2, 1, 0, 0, 0];
    return {
      issue: "TECH_GAPS",
      data: buildManaCurveData(curve),
      caption: "Aggressive deck but missing key tech cards against popular strategies.",
      title: "Tech Coverage Analysis",
      grade: "Poor",
      score: 4,
      strengths: ["Aggressive curve"],
      weaknesses: ["Missing tech", "Vulnerable to hate"]
    };
  }

  if (key.includes("matchup warrior") || key.includes("pain points")) {
    const matchupData = [
      { role: "vs Aggro", value: 9 },
      { role: "vs Control", value: 3 },
      { role: "vs Combo", value: 7 },
      { role: "vs Midrange", value: 5 },
      { role: "vs Ramp", value: 8 }
    ];
    return {
      issue: "MATCHUP_PAINS",
      data: matchupData,
      caption: "Strong vs aggro but weak vs control. Needs better late game tools.",
      title: "Matchup Winrate by Archetype",
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
    const roleData = [
      { role: "Ramp", value: 6 },
      { role: "Removal", value: 6 },
      { role: "Win Cons", value: 6 },
      { role: "Draw", value: 6 },
      { role: "Protection", value: 6 }
    ];
    return {
      issue: "ROLE_MISMATCH",
      data: roleData,
      caption: "Perfectly balanced deck with all roles represented equally.",
      title: "Role Distribution",
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
    chartType: "Bar",
    list: []
  },
  {
    name: "Zoo Warlock (Mana Flood)",
    archetype: "Aggro",
    gameType: "hearthstone",
    chartType: "Bar",
    list: []
  },
  {
    name: "Balanced Deck",
    archetype: "Midrange",
    gameType: "magic",
    chartType: "Radar",
    list: []
  },
  {
    name: "Draw-Go Control (Inconsistent Draws)",
    archetype: "Control",
    gameType: "magic",
    chartType: "Line",
    list: []
  },
  {
    name: "Ramp Druid (Role Mismatch)",
    archetype: "Ramp",
    gameType: "hearthstone",
    chartType: "Radar",
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
    chartType: "Bar",
    list: []
  },
  {
    name: "Matchup Warrior (Pain Points)",
    archetype: "Control",
    gameType: "hearthstone",
    chartType: "Radar",
    list: []
  },
  {
    name: "Hand Disruption Warlock (Size Pressure)",
    archetype: "Control",
    gameType: "hearthstone",
    chartType: "Line",
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