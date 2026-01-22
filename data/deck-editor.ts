export type DeckCard = {
  name: string;
  count: number;
  manaValue: number;
  role: string;
  tags: string[];
  note?: string;
};

export type DeckSection = {
  key: string;
  label: string;
  cards: DeckCard[];
};

export type DeckSnapshot = {
  curve: { label: string; value: number }[];
  colorWeight: { label: string; value: number }[];
  gamePlan: string;
  strengths: string[];
  weaknesses: string[];
  winRate: number;
  metaShare: number;
  topMatchups: { archetype: string; winRate: number }[];
  techOptions: { name: string; impact: 'high' | 'medium' | 'low'; note: string }[];
};

export type DeckRecord = {
  id: string;
  name: string;
  format: 'Standard' | 'Pioneer' | 'Modern' | 'Wild' | 'Standard (HS)';
  archetype: string;
  colors: string[];
  lastUpdated: string;
  author: string;
  heroImage?: string;
  deckCode: string;
  sections: DeckSection[];
  snapshot: DeckSnapshot;
};

export type MetaDeck = {
  id: string;
  name: string;
  format: DeckRecord['format'];
  archetype: string;
  source: string;
  winRate: number;
  metaShare: number;
  trending: 'up' | 'stable' | 'down';
  colors: string[];
  deckCode: string;
  highlight: string;
  prototype?: {
    sections: DeckSection[];
    snapshot: DeckSnapshot;
  };
};

export const SAVED_DECKS: DeckRecord[] = [
  {
    id: 'control-warrior-standard-hs',
    name: 'Control Warrior',
    format: 'Standard (HS)',
    archetype: 'Control',
    colors: ['N'],
    lastUpdated: 'Today',
    author: 'Sample Deck',
    deckCode: 'AAECAQcEqgaN0gKS+AKggAMNS5EDogTUBJEG/wf7DOUPgq0CxsMCm8sCyucCnfACAAA=',
    sections: [
      {
        key: 'removal',
        label: 'Removal & Control',
        cards: [
          { name: 'Shield Slam', count: 2, manaValue: 1, role: 'Removal', tags: ['removal'], note: 'Efficient removal with armor.' },
          { name: 'Execute', count: 2, manaValue: 1, role: 'Hard removal', tags: ['removal'], note: 'Destroys damaged minions.' },
          { name: 'Brawl', count: 2, manaValue: 5, role: 'Board clear', tags: ['board clear'], note: 'Clears wide boards.' },
        ],
      },
      {
        key: 'threats',
        label: 'Threats & Win Conditions',
        cards: [
          { name: 'Dr. Boom, Mad Genius', count: 1, manaValue: 7, role: 'Hero card', tags: ['legendary'], note: 'Transforms hero power for late game.' },
          { name: 'Grommash Hellscream', count: 1, manaValue: 8, role: 'Finisher', tags: ['legendary'], note: 'Burst damage with enrage.' },
        ],
      },
      {
        key: 'defense',
        label: 'Defense & Armor',
        cards: [
          { name: 'Armorsmith', count: 2, manaValue: 2, role: 'Armor gain', tags: ['defense'], note: 'Gains armor from minion damage.' },
          { name: 'Shield Block', count: 2, manaValue: 3, role: 'Armor & draw', tags: ['defense'], note: 'Gains armor and draws a card.' },
        ],
      },
    ],
    snapshot: {
      curve: [
        { label: '1', value: 4 },
        { label: '2', value: 4 },
        { label: '3', value: 4 },
        { label: '4', value: 4 },
        { label: '5', value: 4 },
        { label: '6+', value: 10 },
      ],
      colorWeight: [{ label: 'Neutral', value: 100 }],
      gamePlan: 'Control the board with efficient removal, gain armor for survivability, then close the game with powerful late-game threats.',
      strengths: ['Excellent removal suite.', 'Strong late-game threats.', 'High survivability with armor gain.'],
      weaknesses: ['Weak to combo decks.', 'Can struggle against aggressive starts.', 'Requires careful resource management.'],
      winRate: 54.8,
      metaShare: 8.6,
      topMatchups: [
        { archetype: 'Aggro Hunter', winRate: 58 },
        { archetype: 'Midrange Paladin', winRate: 55 },
        { archetype: 'Control Priest', winRate: 52 },
      ],
      techOptions: [
        { name: 'Baron Geddon', impact: 'high', note: 'Adds board clear and pressure.' },
        { name: 'The Lich King', impact: 'medium', note: 'Provides value and threats.' },
        { name: 'Dead Man\'s Hand', impact: 'low', note: 'Enables fatigue strategy.' },
      ],
    },
  },
  {
    id: 'esper-legends-standard',
    name: 'Esper Legends',
    format: 'Standard',
    archetype: 'Proactive Midrange',
    colors: ['W', 'U', 'B'],
    lastUpdated: '2 hours ago',
    author: 'Alana H.',
    deckCode: `Deck
4 Raffine, Scheming Seer
4 Dennick, Pious Apprentice
3 Adeline, Resplendent Cathar
3 Skrelv, Defector Mite
4 Thalia, Guardian of Thraben
4 Wedding Announcement
2 Plaza of Heroes
2 Takenuma, Abandoned Mire
1 Eiganjo, Seat of the Empire
4 Shattered Sanctum
4 Deserted Beach
4 Shipwreck Marsh
4 Raffine's Tower
4 Seachrome Coast
2 Underground River
2 Plains

Sideboard
2 The Wandering Emperor
2 Disdainful Stroke
2 Duress
2 Tear Asunder
2 Destroy Evil
3 Cut Down
2 Wedding Announcement`,
    sections: [
      {
        key: 'threats',
        label: 'Threats & Pressure',
        cards: [
          { name: 'Raffine, Scheming Seer', count: 4, manaValue: 3, role: 'Scaling threat', tags: ['legendary', 'evasion'], note: 'Primary damage engine; snowballs quickly.' },
          { name: 'Adeline, Resplendent Cathar', count: 3, manaValue: 3, role: 'Wide pressure', tags: ['legendary', 'token'], note: 'Demands immediate answer; synergises with Raffine connive.' },
          { name: 'Dennick, Pious Apprentice', count: 4, manaValue: 2, role: 'Stabiliser', tags: ['legendary', 'lifegain'], note: 'Key to racing aggro; front half blanks graveyard lines.' },
          { name: 'Skrelv, Defector Mite', count: 3, manaValue: 1, role: 'Protection', tags: ['legendary', 'toxic'], note: 'Turns on Plaza of Heroes, protects key threats.' },
        ],
      },
      {
        key: 'interaction',
        label: 'Interaction & Tempo',
        cards: [
          { name: 'Thalia, Guardian of Thraben', count: 4, manaValue: 2, role: 'Tax effect', tags: ['legendary', 'hate'], note: 'Punishes spell-heavy decks; mirror breaker.' },
          { name: 'Wedding Announcement', count: 4, manaValue: 3, role: 'Card advantage', tags: ['token', 'anthem'], note: 'Bridges grind games; unstoppable vs removal-light decks.' },
        ],
      },
      {
        key: 'mana',
        label: 'Mana Base',
        cards: [
          { name: 'Raffine\'s Tower', count: 4, manaValue: 0, role: 'Tri-land', tags: ['fixing'], note: 'Enables perfect curve; fuels connive draws.' },
          { name: 'Plaza of Heroes', count: 2, manaValue: 0, role: 'Protection land', tags: ['utility'], note: 'Protects legends, unlocks color flexibility.' },
          { name: 'Takenuma, Abandoned Mire', count: 2, manaValue: 0, role: 'Utility land', tags: ['channel'], note: 'Recurs key legends when attrition hits.' },
          { name: 'Shattered Sanctum', count: 4, manaValue: 0, role: 'Fixing', tags: ['dual'], note: 'White-black base to cast early legends.' },
        ],
      },
      {
        key: 'sideboard',
        label: 'Sideboard Suite',
        cards: [
          { name: 'The Wandering Emperor', count: 2, manaValue: 4, role: 'Removal / Planeswalker', tags: ['flash'], note: 'Versatile stabiliser into control and midrange.' },
          { name: 'Disdainful Stroke', count: 2, manaValue: 2, role: 'Countermagic', tags: ['interaction'], note: 'Stops ramp payoffs and mirrors efficiently.' },
          { name: 'Tear Asunder', count: 2, manaValue: 2, role: 'Catch-all answer', tags: ['flex'], note: 'Exiles troublesome permanents, kicker usable post-board.' },
          { name: 'Cut Down', count: 3, manaValue: 1, role: 'Speed removal', tags: ['efficient'], note: 'Shifts early game vs creature decks.' },
        ],
      },
    ],
    snapshot: {
      curve: [
        { label: '1', value: 6 },
        { label: '2', value: 10 },
        { label: '3', value: 13 },
        { label: '4+', value: 5 },
      ],
      colorWeight: [
        { label: 'White', value: 38 },
        { label: 'Blue', value: 32 },
        { label: 'Black', value: 30 },
      ],
      gamePlan: 'Deploy resilient legends early, pressure life totals while taxing interaction, then close with anthem effects and repeatable card advantage.',
      strengths: ['Crushes spell-dense control with Thalia pressure.', 'Best-in-format removal resilience.', 'Exceptional mana consistency for three colors.'],
      weaknesses: ['Susceptible to sweepers post-board.', 'Limited card draw if Raffine is removed.', 'Requires sequencing discipline vs aggro.'],
      winRate: 61.4,
      metaShare: 8.7,
      topMatchups: [
        { archetype: 'Domain Ramp', winRate: 62 },
        { archetype: 'Grixis Midrange', winRate: 58 },
        { archetype: 'Mono-Red Aggro', winRate: 56 },
      ],
      techOptions: [
        { name: 'Phyrexian Missionary', impact: 'medium', note: 'Adds midrange recursion without taxing mana.' },
        { name: 'Razorlash Transmogrant', impact: 'medium', note: 'Improves grind plan vs Esper mirror and control.' },
        { name: 'Steel Seraph', impact: 'high', note: 'Transforms go-wide endgames; watch for curve tension.' },
      ],
    },
  },
  {
    id: 'greasefang-pioneer',
    name: 'Abzan Greasefang',
    format: 'Pioneer',
    archetype: 'Combo Midrange',
    colors: ['W', 'B', 'G'],
    lastUpdated: 'Yesterday',
    author: 'Deck Vault',
    deckCode: `Deck
4 Greasefang, Okiba Boss
4 Raffine\'s Informant
4 Stitcher\'s Supplier
3 Witherbloom Command
4 Liliana of the Veil
4 Traverse the Ulvenwald
4 Can\'t Stay Away
3 Parhelion II
2 Skysovereign, Consul Flagship
4 Blooming Marsh
4 Concealed Courtyard
4 Overgrown Tomb
2 Godless Shrine
2 Temple Garden
2 Boseiju, Who Endures
2 Takenuma, Abandoned Mire
4 Darkbore Pathway
2 Plains
2 Swamp

Sideboard
2 Thoughtseize
2 Duress
2 Unlicensed Hearse
2 Abrupt Decay
2 Brutal Cathar
2 Ray of Enfeeblement
3 Leyline of the Void`,
    sections: [
      {
        key: 'combo',
        label: 'Combo Core',
        cards: [
          { name: 'Greasefang, Okiba Boss', count: 4, manaValue: 3, role: 'Primary combo', tags: ['vehicles'], note: 'Turns any discarded vehicle into lethal pressure.' },
          { name: 'Parhelion II', count: 3, manaValue: 8, role: 'Payoff', tags: ['vehicle'], note: 'Classic combo partner; lethal swing on turn 3.' },
          { name: 'Skysovereign, Consul Flagship', count: 2, manaValue: 5, role: 'Alternative payoff', tags: ['vehicle'], note: 'Crushes creature decks, gives reach.' },
        ],
      },
      {
        key: 'setup',
        label: 'Setup & Redundancy',
        cards: [
          { name: 'Stitcher\'s Supplier', count: 4, manaValue: 1, role: 'Mill engine', tags: ['graveyard'], note: 'Feeds graveyard with combo pieces.' },
          { name: 'Raffine\'s Informant', count: 4, manaValue: 2, role: 'Looting', tags: ['card selection'], note: 'Smooths draws, discards vehicles cleanly.' },
          { name: 'Traverse the Ulvenwald', count: 4, manaValue: 1, role: 'Tutor', tags: ['delirium'], note: 'Tutors combo piece once graveyard stocked.' },
          { name: 'Can\'t Stay Away', count: 4, manaValue: 2, role: 'Reanimation', tags: ['recursion'], note: 'Recurs Greasefang for grindy matchups.' },
        ],
      },
      {
        key: 'interaction',
        label: 'Interaction & Protection',
        cards: [
          { name: 'Liliana of the Veil', count: 4, manaValue: 3, role: 'Disruption', tags: ['planeswalker'], note: 'Strips answers, fuels graveyard plan.' },
          { name: 'Witherbloom Command', count: 3, manaValue: 2, role: 'Utility removal', tags: ['modal'], note: 'Kills hate pieces and mills vehicles.' },
        ],
      },
      {
        key: 'mana',
        label: 'Mana Base',
        cards: [
          { name: 'Blooming Marsh', count: 4, manaValue: 0, role: 'Fast land', tags: ['fixing'], note: 'Ensures early double colors for setup spells.' },
          { name: 'Boseiju, Who Endures', count: 2, manaValue: 0, role: 'Utility land', tags: ['interaction'], note: 'Answers graveyard hate and lock pieces.' },
          { name: 'Takenuma, Abandoned Mire', count: 2, manaValue: 0, role: 'Utility land', tags: ['recursion'], note: 'Recovers Greasefang in attrition matchups.' },
        ],
      },
    ],
    snapshot: {
      curve: [
        { label: '1', value: 12 },
        { label: '2', value: 16 },
        { label: '3', value: 11 },
        { label: '4+', value: 6 },
      ],
      colorWeight: [
        { label: 'White', value: 22 },
        { label: 'Black', value: 46 },
        { label: 'Green', value: 32 },
      ],
      gamePlan: 'Fill the graveyard quickly, resolve Greasefang on turn three, and loop vehicles while leveraging hand disruption to clear the path.',
      strengths: ['Fast goldfish kills on turns 3-4.', 'Resilient recursion engine vs removal.', 'Multiple lines to victory without combo.'],
      weaknesses: ['Graveyard hate stalls plan.', 'Weak to instant-speed exile removal.', 'Mana base can stumble under Blood Moon style hate.'],
      winRate: 58.3,
      metaShare: 6.1,
      topMatchups: [
        { archetype: 'Mono-Green Devotion', winRate: 64 },
        { archetype: 'Izzet Phoenix', winRate: 55 },
        { archetype: 'Rakdos Midrange', winRate: 53 },
      ],
      techOptions: [
        { name: 'Tyvar, Jubilant Brawler', impact: 'high', note: 'Adds redundancy and untaps Greasefang immediately.' },
        { name: 'Go for the Throat', impact: 'medium', note: 'Flexible answer to early hate creatures.' },
        { name: 'Knight of Autumn', impact: 'medium', note: 'Brings artifact/enchantment interaction from sideboard.' },
      ],
    },
  },
  {
    id: 'plague-deathrattle-wild',
    name: 'Plague Deathrattle',
    format: 'Wild',
    archetype: 'Board Control Combo',
    colors: ['N'],
    lastUpdated: '5 days ago',
    author: 'Meta Snapshot',
    deckCode: `AAEBAQcI/QL6EYSxA/3jAw2KBe0F08ECi+4C5MIC6tYC+94D6ukD9dYDsvgDz4cErIoFwpoG7KcG/6gGmIoGq5EGsJEG2JEG+aMGu6MGpKQG8agG56oGj84GkIYGo5EGsrEGz7EG766ClL0EuLYEh7ME1bIEqLYE4LUEkp4E3cQC8skDk8kD8skD+skDAA==`,
    sections: [
      {
        key: 'core',
        label: 'Core Gameplan',
        cards: [
          { name: 'Plaguespreader', count: 4, manaValue: 4, role: 'Resurrection piece', tags: ['deathrattle'], note: 'Loops endless deathrattle chains with Resurrect effects.' },
          { name: 'Necrium Apothecary', count: 2, manaValue: 5, role: 'Tutor', tags: ['combo enabler'], note: 'Pulls key deathrattle minions while cheating mana.' },
          { name: 'Seance', count: 2, manaValue: 3, role: 'Recur tool', tags: ['combo'], note: 'Copies premium deathrattle cards for redundancy.' },
        ],
      },
      {
        key: 'removal',
        label: 'Removal Suite',
        cards: [
          { name: 'Plague of Flames', count: 2, manaValue: 1, role: 'Mass removal', tags: ['board wipe'], note: 'Reset button vs early aggression, synergises with deathrattles.' },
          { name: 'Defile', count: 2, manaValue: 2, role: 'Efficient removal', tags: ['board control'], note: 'Scales to clear wide boards cheaply.' },
          { name: 'Hysteria', count: 2, manaValue: 4, role: 'Removal', tags: ['control'], note: 'Handles tall threats that survive Defile.' },
        ],
      },
      {
        key: 'card-advantage',
        label: 'Card Advantage & Sustain',
        cards: [
          { name: 'Talented Arcanist', count: 2, manaValue: 3, role: 'Spell amplifier', tags: ['support'], note: 'Boosts board clears to hit larger boards.' },
          { name: 'Blood of G\'huun', count: 2, manaValue: 8, role: 'Stabiliser', tags: ['lifegain'], note: 'Massive lifesteal swing to close the door on aggro.' },
        ],
      },
    ],
    snapshot: {
      curve: [
        { label: '1', value: 6 },
        { label: '2', value: 8 },
        { label: '3', value: 8 },
        { label: '4', value: 6 },
        { label: '5+', value: 12 },
      ],
      colorWeight: [{ label: 'Hero Power', value: 100 }],
      gamePlan: 'Control the board with efficient sweepers, then loop stickiest deathrattle threats to generate overwhelming inevitability.',
      strengths: ['Dominates minion decks lacking hard silence.', 'Excellent sustain and inevitability.', 'Play patterns are flexible versus most archetypes.'],
      weaknesses: ['Vulnerable to combo decks with speed.', 'Silence effects ruin the core loop.', 'Hands can be clunky without tutors.'],
      winRate: 65.1,
      metaShare: 3.8,
      topMatchups: [
        { archetype: 'Secret Mage', winRate: 68 },
        { archetype: 'Even Shaman', winRate: 63 },
        { archetype: 'Pirate Rogue', winRate: 61 },
      ],
      techOptions: [
        { name: 'Tickatus', impact: 'high', note: 'Gives inevitability vs control mirrors.' },
        { name: 'Zola the Gorgon', impact: 'medium', note: 'Adds extra combo redundancy.' },
        { name: 'Dirty Rat', impact: 'high', note: 'Disrupts opposing combo decks early.' },
      ],
    },
  },
];

export const META_DECKS: MetaDeck[] = [
  {
    id: 'standard-boros-convoke',
    name: 'Boros Convoke',
    format: 'Standard',
    archetype: 'Aggro Combo',
    source: 'MTG Meta Snapshot · 48h',
    winRate: 59.2,
    metaShare: 10.4,
    trending: 'up',
    colors: ['W', 'R'],
    deckCode: `Deck
4 Venerated Loxodon
4 Knight-Errant of Eos
4 Gleeful Demolition
4 Regal Leosaur
4 Resolute Reinforcements
4 Knight of the White Orchid
4 Imodane's Recruiter
4 Warden of the Inner Sky
4 Sacred Foundry
4 Battlefield Forge
4 Inspiring Vantage
4 Cavern of Souls
4 Plains

Sideboard
3 Destroy Evil
2 Knockout Blow
2 Lithomantic Barrage
2 Valorous Stance
2 Unlicensed Hearse
2 Wedding Announcement
2 Invasion of Gobakhan`,
    highlight: 'Convoke chains are overwhelming post-rotation; punished only by efficient sweepers.',
    prototype: {
      sections: [
        {
          key: 'engine',
          label: 'Convoke Engine',
          cards: [
            { name: 'Venerated Loxodon', count: 4, manaValue: 5, role: 'Mass pump finisher', tags: ['convoke'], note: 'Overwhelming payoff that locks combat.' },
            { name: 'Knight-Errant of Eos', count: 4, manaValue: 5, role: 'Card advantage', tags: ['convoke', 'tutor'], note: 'Finds missing pieces while adding board presence.' },
            { name: 'Imodane\'s Recruiter', count: 4, manaValue: 3, role: 'Haste finisher', tags: ['convoke', 'overrun'], note: 'Provides lethal swings post-wide board.' },
          ],
        },
        {
          key: 'support',
          label: 'Token Support',
          cards: [
            { name: 'Gleeful Demolition', count: 4, manaValue: 1, role: 'Token burst', tags: ['token'], note: 'Supercharges convoke velocity.' },
            { name: 'Resolute Reinforcements', count: 4, manaValue: 2, role: 'Instant board', tags: ['token', 'flash'], note: 'Applies pressure at instant speed.' },
            { name: 'Regal Leosaur', count: 4, manaValue: 2, role: 'Pump effect', tags: ['mutate'], note: 'Keeps tokens relevant into the mid game.' },
          ],
        },
        {
          key: 'mana',
          label: 'Mana Base',
          cards: [
            { name: 'Sacred Foundry', count: 4, manaValue: 0, role: 'Dual land', tags: ['fixing'], note: 'Enters untapped on early turns.' },
            { name: 'Inspiring Vantage', count: 4, manaValue: 0, role: 'Fast land', tags: ['aggro'], note: 'Supports explosive starts.' },
            { name: 'Cavern of Souls', count: 4, manaValue: 0, role: 'Tribal support', tags: ['protection'], note: 'Pushes threats through counter magic.' },
          ],
        },
      ],
      snapshot: {
        curve: [
          { label: '1', value: 12 },
          { label: '2', value: 12 },
          { label: '3', value: 6 },
          { label: '4+', value: 8 },
        ],
        colorWeight: [
          { label: 'White', value: 54 },
          { label: 'Red', value: 46 },
        ],
        gamePlan: 'Deploy cheap bodies, convert them into overwhelming convoke payoffs, and chain Knights to sustain pressure.',
        strengths: ['Explosive starts punish slow decks.', 'High resilience to spot removal thanks to token flood.', 'Multiple finishers ensure consistent lethals.'],
        weaknesses: ['Board wipes reset progress.', 'Limited interaction vs combo opponents.', 'Requires sequencing discipline.'],
        winRate: 59.2,
        metaShare: 10.4,
        topMatchups: [
          { archetype: 'Domain Ramp', winRate: 63 },
          { archetype: 'Esper Legends', winRate: 55 },
          { archetype: 'Mono-Red Aggro', winRate: 52 },
        ],
        techOptions: [
          { name: 'Virtue of Loyalty', impact: 'medium', note: 'Adds staying power vs sweepers.' },
          { name: 'Invasion of Gobakhan', impact: 'high', note: 'Disrupts midrange removal suites.' },
          { name: 'Wedding Announcement', impact: 'medium', note: 'Transitions into a grindy plan.' },
        ],
      },
    },
  },
  {
    id: 'pioneer-boros-heroic',
    name: 'Boros Heroic',
    format: 'Pioneer',
    archetype: 'Aggro Tempo',
    source: 'Pioneer Regional Qualifier · 1 week',
    winRate: 55.3,
    metaShare: 7.5,
    trending: 'stable',
    colors: ['W', 'R'],
    deckCode: `Deck
4 Monastery Swiftspear
4 Favored Hoplite
4 Illuminator Virtuoso
4 Dreadhorde Arcanist
4 Defiant Strike
4 Homestead Courage
4 Reckless Rage
4 Ancestral Anger
4 Gods Willing
4 Sejiri Shelter
4 Sacred Foundry
4 Inspiring Vantage
4 Battlefield Forge
4 Needleverge Pathway
2 Den of the Bugbear
2 Mountain

Sideboard
3 Rip Apart
2 Deafening Silencer
2 Rest in Peace
2 Alpine Moon
2 Giant Killer
2 Searing Blood
2 Unchained Berserker`,
    highlight: 'Still punishes slow decks; adjusted to beat Rakdos midrange with main-deck Reckless Rage.',
    prototype: {
      sections: [
        {
          key: 'threats',
          label: 'Threat Base',
          cards: [
            { name: 'Monastery Swiftspear', count: 4, manaValue: 1, role: 'Hasty threat', tags: ['prowess'], note: 'Applies pressure while scaling with spells.' },
            { name: 'Favored Hoplite', count: 4, manaValue: 1, role: 'Primary target', tags: ['heroic'], note: 'Snowballs quickly with protection spells.' },
            { name: 'Illuminator Virtuoso', count: 4, manaValue: 2, role: 'Double strike finisher', tags: ['heroic'], note: 'Creates lethal lines with pump spells.' },
          ],
        },
        {
          key: 'pump',
          label: 'Pump & Protection',
          cards: [
            { name: 'Defiant Strike', count: 4, manaValue: 1, role: 'Cantrip pump', tags: ['draw'], note: 'Keeps cards flowing while building stats.' },
            { name: 'Homestead Courage', count: 4, manaValue: 1, role: 'Sticky pump', tags: ['flashback'], note: 'Lets you double-spell early and late.' },
            { name: 'Gods Willing', count: 4, manaValue: 1, role: 'Protection', tags: ['heroic'], note: 'Blank removal and force damage through.' },
            { name: 'Sejiri Shelter', count: 4, manaValue: 2, role: 'Protection land', tags: ['modal'], note: 'Covers land drops while keeping threats safe.' },
          ],
        },
        {
          key: 'interaction',
          label: 'Interaction',
          cards: [
            { name: 'Reckless Rage', count: 4, manaValue: 2, role: 'Removal', tags: ['efficient'], note: 'Kills blockers while sparing buffed creatures.' },
            { name: 'Dreadhorde Arcanist', count: 4, manaValue: 2, role: 'Card advantage', tags: ['recursion'], note: 'Re-buys spells to extend pressure windows.' },
          ],
        },
      ],
      snapshot: {
        curve: [
          { label: '1', value: 20 },
          { label: '2', value: 14 },
          { label: '3+', value: 6 },
        ],
        colorWeight: [
          { label: 'White', value: 48 },
          { label: 'Red', value: 52 },
        ],
        gamePlan: 'Stick an early threat, stack cheap buffs while holding protection, and end the game before midrange stabilizes.',
        strengths: ['Goldfishes turn 4 consistently.', 'Excellent vs slow interactive decks.', 'Resilient through redundant protection.'],
        weaknesses: ['Struggles vs wide removal and lifegain.', 'Relies on creature density; mulligans aggressively.', 'Requires precise sequencing.'],
        winRate: 55.3,
        metaShare: 7.5,
        topMatchups: [
          { archetype: 'Azorius Control', winRate: 62 },
          { archetype: 'Lotus Field Combo', winRate: 57 },
          { archetype: 'Greasefang', winRate: 51 },
        ],
        techOptions: [
          { name: 'Tenth District Legionnaire', impact: 'medium', note: 'Adds extra haste pressure and late-game scaling.' },
          { name: 'Showdown of the Skalds', impact: 'high', note: 'Boosts grind plan vs midrange mirrors.' },
          { name: 'Loran of the Third Path', impact: 'medium', note: 'Handles troublesome artifacts and enchantments.' },
        ],
      },
    },
  },
  {
    id: 'wild-quest-demon-hunter',
    name: 'Quest Demon Hunter',
    format: 'Wild',
    archetype: 'Combo',
    source: 'HS Replay · Live',
    winRate: 63.8,
    metaShare: 4.2,
    trending: 'up',
    colors: ['N'],
    deckCode: `AAECAea5AwT9ngSuwgPj0gOlnwT3nwSnxwSsygQO2cYDo8cDwskD9d8D6/AD/eMD+eMD9fYDlfIDhYQEtpgF1ooG8IsG+p8Gi/0Gqf4Gq/4G9P4GgI0G64wG5JAG570GAA==`,
    highlight: 'Questline kill angles improved with fresh draw suites; high ceiling but APM intensive.',
    prototype: {
      sections: [
        {
          key: 'questline',
          label: 'Questline Package',
          cards: [
            { name: 'Final Showdown', count: 1, manaValue: 1, role: 'Questline', tags: ['combo'], note: 'Defines the win condition and checkpoints.' },
            { name: 'Need for Greed', count: 2, manaValue: 3, role: 'Card draw', tags: ['quest'], note: 'Pushes through quest stages quickly.' },
            { name: 'Sigil of Alacrity', count: 2, manaValue: 1, role: 'Discount', tags: ['quest'], note: 'Pairs with final stage turns.' },
          ],
        },
        {
          key: 'burst',
          label: 'Burst Finishers',
          cards: [
            { name: 'Fury (Rank 1)', count: 2, manaValue: 2, role: 'Damage', tags: ['buff'], note: 'Cheap attack boost to finish the quest.' },
            { name: 'Multi-Strike', count: 2, manaValue: 2, role: 'Extra attacks', tags: ['burst'], note: 'Enables lethal turns once the quest is complete.' },
            { name: 'Lion\'s Frenzy', count: 2, manaValue: 4, role: 'Weapon finisher', tags: ['weapon'], note: 'Scales with discounted draw to deliver lethal.' },
          ],
        },
        {
          key: 'control',
          label: 'Control & Draw',
          cards: [
            { name: 'Spectral Sight', count: 2, manaValue: 2, role: 'Card draw', tags: ['outcast'], note: 'Keeps resources flowing and advances quest ticks.' },
            { name: 'Chaos Strike', count: 2, manaValue: 2, role: 'Removal', tags: ['draw'], note: 'Controls board while advancing quest.' },
            { name: 'Felosophy', count: 2, manaValue: 1, role: 'Copy effect', tags: ['combo'], note: 'Doubles critical burst tools for kill turns.' },
          ],
        },
      ],
      snapshot: {
        curve: [
          { label: '0', value: 6 },
          { label: '1', value: 10 },
          { label: '2', value: 10 },
          { label: '3+', value: 8 },
        ],
        colorWeight: [{ label: 'Questline', value: 100 }],
        gamePlan: 'Complete the questline efficiently while controlling the board, then chain discounted extra attack spells to deliver lethal weapon swings.',
        strengths: ['Exceptional inevitability vs slow decks.', 'Flexible removal keeps aggro in check.', 'Questline rewards precise sequencing and resource management.'],
        weaknesses: ['APM intensive; mis-sequenced turns lose damage.', 'Weak to armor and heavy lifegain.', 'Silence or weapon removal disrupts kill turns.'],
        winRate: 63.8,
        metaShare: 4.2,
        topMatchups: [
          { archetype: 'Even Shaman', winRate: 66 },
          { archetype: 'Reno Priest', winRate: 60 },
          { archetype: 'Pirate Rogue', winRate: 58 },
        ],
        techOptions: [
          { name: 'Kayn Sunfury', impact: 'high', note: 'Punches through taunts for final damage push.' },
          { name: 'Rinling\'s Rifle', impact: 'medium', note: 'Adds flexible removal in grindy mirrors.' },
          { name: 'Starfish', impact: 'medium', note: 'Silence option vs giant boards.' },
        ],
      },
    },
  },
];
