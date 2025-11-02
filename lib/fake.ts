// lib/fake.ts

type Feature = { icon: string; title: string; body: string };

type Insight = { title: string; body: string };

type SectionContent = {
  hero: { kicker?: string; headline: string; sub: string; primaryCta: string; secondaryCta?: string };
  features: Feature[];
  workbench: {
    leftTitle: string;
    leftSubtitle?: string;
    items: { label: string; meta?: string }[];
    leftPrimary: { label: string; icon: string };
    leftSecondary?: { label: string; icon: string };
  };
  insightsTitle: string;
  insights: Insight[];
  analyticsTitle: string;
  analyticsLeftTitle: string;
  analyticsRightTitle: string;
  footerCtas: { primary: string; secondary?: string };
};

export const COPY: Record<'forge' | 'earth' | 'air' | 'water' | 'aether', SectionContent> = {
  forge: {
    hero: {
      kicker: "Arcane Simulation",
      headline: "Where strategy is tempered in fire.",
      sub: "Run experiments, evolve ideas, and harden your deck through thousands of simulated trials.",
      primaryCta: "Start a Simulation",
      secondaryCta: "Load a Deck",
    },
    features: [
      { icon: "FlaskConical", title: "Simulation Engine", body: "Spin up fast trials across archetypes to probe weak spots." },
      { icon: "Network", title: "Synergy Analyzer", body: "Reveal hidden links and anti-synergies that drag performance." },
      { icon: "LineChart", title: "Balance Heatmap", body: "See curve, roles, and risk concentration at a glance." },
      { icon: "Scale", title: "Meta Comparator", body: "Benchmark outcomes against snapshot meta decks." },
    ],
    workbench: {
      leftTitle: "Your Deck",
      leftSubtitle: "Sample list",
      items: [
        { label: "Phoenix Spark", meta: "Burst" },
        { label: "Runed Anvil", meta: "Value" },
        { label: "Ember Apprentice", meta: "Tempo" },
        { label: "Scorched Path", meta: "Control" },
        { label: "Molten Blast", meta: "Finisher" },
      ],
      leftPrimary: { label: "Refine Deck", icon: "Sparkles" },
      leftSecondary: { label: "Suggest Improvements", icon: "Wand2" },
    },
    insightsTitle: "From Fire, Understanding",
    insights: [
      { title: "Opening Hand Friction", body: "Curve shows a soft dip at 2 mana; add one early stabilizer to increase board hold by ~5%." },
      { title: "Overlapping Combos", body: "Phoenix Spark + Apprentice spikes burst turns; add protection or draw to sustain the line." },
      { title: "Projected Matchups", body: "+3.8% vs Aggro Pala, +2.2% vs Big Druid after two-slot refinement." },
    ],
    analyticsTitle: "Crucible of Data",
    analyticsLeftTitle: "Simulated Winrate",
    analyticsRightTitle: "Matchup Deltas",
    footerCtas: { primary: "Continue Forging", secondary: "Compare with Meta" },
  },

  earth: {
    hero: {
      kicker: "Structural Analysis",
      headline: "Root your strategy in wisdom.",
      sub: "Map composition, synergy lines, and archetype identity with scholarly clarity.",
      primaryCta: "Analyze a Deck",
      secondaryCta: "Import Deck Code",
    },
    features: [
      { icon: "Table2", title: "Composition Map", body: "Minion, spell, weapon ratios and role density." },
      { icon: "Network", title: "Synergy Graph", body: "Clusters that define your plan—and the cards that anchor them." },
      { icon: "Layers", title: "Archetype Fit", body: "How your list aligns to canonical patterns." },
      { icon: "Library", title: "Legality & Sets", body: "Rotation timing and set compliance, all flagged." },
    ],
    workbench: {
      leftTitle: "Deck Snapshot",
      leftSubtitle: "Structural overview",
      items: [
        { label: "Core Engine: Stonecaller + Wayfinder" },
        { label: "Support Line: Binding Roots (x2)" },
        { label: "Flex Slot: Verdant Tactician" },
        { label: "Tech: Burrow Ward" },
      ],
      leftPrimary: { label: "Run Analysis", icon: "PlayCircle" },
      leftSecondary: { label: "Export Report", icon: "Upload" },
    },
    insightsTitle: "The Library Speaks",
    insights: [
      { title: "Curve Integrity", body: "Healthy 3–4 band; early anchor missing. Add a 1-drop or cheap interaction." },
      { title: "Role Imbalance", body: "Value/control skewed; include one additional pressure card to avoid stall." },
      { title: "Archetype Identity", body: "Leans Midrange Control; two swaps clarify the plan." },
    ],
    analyticsTitle: "Table of Proof",
    analyticsLeftTitle: "Curve Health",
    analyticsRightTitle: "Synergy Strength",
    footerCtas: { primary: "Publish Analysis", secondary: "Open in Deck Library" },
  },

  air: {
    hero: {
      kicker: "Performance Optics",
      headline: "In motion lies mastery.",
      sub: "Turn timing, initiative, and action density into competitive clarity.",
      primaryCta: "View Play Insights",
      secondaryCta: "Upload Replay",
    },
    features: [
      { icon: "Eye", title: "Vision Moments", body: "Auto-detect pivotal turns and decision forks." },
      { icon: "Timer", title: "Tempo Timeline", body: "Who had initiative and when, across the match." },
      { icon: "ScanLine", title: "Action Density", body: "APM and card actions per turn visualized cleanly." },
      { icon: "Gauge", title: "Efficiency Score", body: "Curve usage and resource waste summarized." },
    ],
    workbench: {
      leftTitle: "Recent Replays",
      items: [
        { label: "vs Totem Shaman — W 2–1", meta: "Tempo favored" },
        { label: "vs Control Priest — L 0–2", meta: "Value loss" },
        { label: "vs Big Druid — W 2–0", meta: "Pressure line" },
      ],
      leftPrimary: { label: "Analyze Selected", icon: "PlayCircle" },
      leftSecondary: { label: "Batch Upload", icon: "Upload" },
    },
    insightsTitle: "Clarity in the Current",
    insights: [
      { title: "Attack Windows", body: "Turn 5–6 is your strongest swing; conserve for that window." },
      { title: "Fatigue Drift", body: "Action density fades post-T8; streamline finishers." },
      { title: "Mulligan Uplift", body: "Keeping Wayfinder increases WR by +3.1% on the play." },
    ],
    analyticsTitle: "Optical Readouts",
    analyticsLeftTitle: "Tempo Over Time",
    analyticsRightTitle: "Action Density",
    footerCtas: { primary: "Optimize Openers", secondary: "Export Timeline" },
  },

  water: {
    hero: {
      kicker: "Meta Reflection",
      headline: "Reflection reveals the tide.",
      sub: "Read the movements of the ladder and predict the currents ahead.",
      primaryCta: "Open Meta Snapshot",
      secondaryCta: "Class Filters",
    },
    features: [
      { icon: "LineChart", title: "Winrate Trendlines", body: "Risers and fallers across brackets." },
      { icon: "BarChart", title: "Popularity Bars", body: "Deck and card usage by MMR bands." },
      { icon: "Waves", title: "Matchup Matrix", body: "Class vs class outcomes at a glance." },
      { icon: "LineChart", title: "Forecast", body: "Projected tides for the coming week." },
    ],
    workbench: {
      leftTitle: "Snapshot Filters",
      items: [
        { label: "Region: Global" },
        { label: "Bracket: Diamond–Legend" },
        { label: "Sample Size: 120k matches" },
      ],
      leftPrimary: { label: "Refresh Snapshot", icon: "PlayCircle" },
      leftSecondary: { label: "Export CSV", icon: "Upload" },
    },
    insightsTitle: "Signals Beneath the Surface",
    insights: [
      { title: "Aggro Cooling", body: "Aggro Paladin down 1.8% as control tech spreads." },
      { title: "Midrange Rising", body: "Big Druid climbs on the back of greed punish." },
      { title: "Blue Chips", body: "Wayfinder remains top 5 by draw-WR delta." },
    ],
    analyticsTitle: "Tidal Instruments",
    analyticsLeftTitle: "Meta Momentum",
    analyticsRightTitle: "Class Popularity",
    footerCtas: { primary: "Open Snapshot", secondary: "Compare Weeks" },
  },

  aether: {
    hero: {
      kicker: "Foresight Engine",
      headline: "All knowledge flows to the center.",
      sub: "AI insight unifies deck, play, and meta into one readable mind.",
      primaryCta: "Consult The Oracle",
      secondaryCta: "Ask a Question",
    },
    features: [
      { icon: "BrainCircuit", title: "Unify Signals", body: "Fuse composition, performance, and meta context." },
      { icon: "Lightbulb", title: "Predictive Hints", body: "Likely matchups, card swaps, and mulligans." },
      { icon: "Sparkles", title: "Auto-Tune", body: "One-click deck tuning with rationale." },
      { icon: "BrainCircuit", title: "Explain", body: "Readable summaries grounded in your data." },
    ],
    workbench: {
      leftTitle: "Questions for the Oracle",
      items: [
        { label: "Which two swaps increase WR the most?" },
        { label: "What's my best mulligan vs Aggro Pala?" },
        { label: "Which archetype punishes my curve?" },
      ],
      leftPrimary: { label: "Ask The Oracle", icon: "Sparkles" },
      leftSecondary: { label: "Show Rationale", icon: "Lightbulb" },
    },
    insightsTitle: "Answers from the Center",
    insights: [
      { title: "Two-Slot Gain", body: "Swap Outrider for Ember Scholar and add Shielding Sigil (+2.7% overall)." },
      { title: "Mulligan Edge", body: "Keep Wayfinder on coin; toss heavy 4s (+1.9% vs aggro)." },
      { title: "Archetype Note", body: "Weak to tall threats; add single-target check." },
    ],
    analyticsTitle: "Confidence & Uplift",
    analyticsLeftTitle: "Oracle Confidence",
    analyticsRightTitle: "Projected Uplift",
    footerCtas: { primary: "Open The Oracle", secondary: "Create Share Link" },
  },
};

// Simple demo chart helpers (if you want more specific series later)
export const DEMO_SERIES = (hex: string) => ({
  sparkline: Array.from({ length: 16 }, (_, i) => ({ x: i + 1, y: 48 + Math.sin(i / 2.3) * 6 + (i > 8 ? 2 : 0) })),
  bars: [{ k: '0-1', v: 4 }, { k: '2', v: 6 }, { k: '3', v: 7 }, { k: '4', v: 5 }, { k: '5', v: 3 }],
});

