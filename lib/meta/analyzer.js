// Meta Analysis System for Scrylytics
// Tracks tournament data and analyzes meta trends

// Mock tournament data - in production, this would come from APIs
const MOCK_TOURNAMENT_DATA = {
  hearthstone: {
    standard: {
      totalTournaments: 156,
      totalDecks: 2340,
      lastUpdated: '2025-10-31',
      topDecks: [
        {
          archetype: 'Control Warrior',
          winRate: 68.5,
          pickRate: 12.3,
          decksPlayed: 287,
          trend: 'up',
          keyCards: ['Saurfang', 'Bloodboil Brute', 'Supercollider']
        },
        {
          archetype: 'Tempo Rogue',
          winRate: 65.2,
          pickRate: 10.8,
          decksPlayed: 253,
          trend: 'stable',
          keyCards: ['Preparation', 'Shadowstep', 'Edwin VanCleef']
        },
        {
          archetype: 'Aggro Druid',
          winRate: 63.8,
          pickRate: 9.4,
          decksPlayed: 220,
          trend: 'down',
          keyCards: ['Innervate', 'Savage Roar', 'Druid of the Claw']
        },
        {
          archetype: 'Spell Hunter',
          winRate: 61.9,
          pickRate: 8.7,
          decksPlayed: 204,
          trend: 'up',
          keyCards: ['Hunter\'s Mark', 'Explosive Trap', 'Deathstalker Rexxar']
        },
        {
          archetype: 'Control Priest',
          winRate: 60.1,
          pickRate: 7.2,
          decksPlayed: 168,
          trend: 'stable',
          keyCards: ['Holy Nova', 'Shadow Word: Death', 'Cairne Bloodhoof']
        }
      ],
      metaEfficiency: {
        aggro: 45.2,
        control: 32.8,
        midrange: 22.0
      },
      cardPopularity: [
        { name: 'Bloodboil Brute', pickRate: 24.5, winRate: 72.1 },
        { name: 'Supercollider', pickRate: 21.8, winRate: 69.3 },
        { name: 'Preparation', pickRate: 19.2, winRate: 67.8 },
        { name: 'Innervate', pickRate: 18.7, winRate: 65.4 },
        { name: 'Hunter\'s Mark', pickRate: 16.9, winRate: 63.2 }
      ]
    }
  },
  magic: {
    pioneer: {
      totalTournaments: 89,
      totalDecks: 1424,
      lastUpdated: '2025-10-31',
      topDecks: [
        {
          archetype: 'Izzet Phoenix',
          winRate: 72.3,
          pickRate: 15.2,
          decksPlayed: 216,
          trend: 'up',
          keyCards: ['Arclight Phoenix', 'Lightning Helix', 'Treasure Cruise']
        },
        {
          archetype: 'Abzan Greasefang',
          winRate: 69.8,
          pickRate: 13.8,
          decksPlayed: 196,
          trend: 'stable',
          keyCards: ['Greasefang, Okiba Boss', 'Esika\'s Chariot', 'March of Swirling Mist']
        }
      ],
      metaEfficiency: {
        aggro: 38.5,
        control: 35.2,
        combo: 26.3
      }
    }
  }
};

/**
 * Get meta analysis for a specific game and format
 */
export function getMetaAnalysis(gameType = 'hearthstone', format = 'standard') {
  const data = MOCK_TOURNAMENT_DATA[gameType]?.[format];

  if (!data) {
    return {
      error: `No data available for ${gameType} ${format}`,
      availableFormats: Object.keys(MOCK_TOURNAMENT_DATA[gameType] || {})
    };
  }

  return {
    gameType,
    format,
    ...data,
    analysis: analyzeMetaTrends(data),
    recommendations: generateMetaRecommendations(data)
  };
}

/**
 * Analyze meta trends and patterns
 */
function analyzeMetaTrends(data) {
  const analysis = {
    dominantStrategy: '',
    emergingDecks: [],
    decliningDecks: [],
    metaStability: 0,
    powerLevel: 0
  };

  // Find dominant strategy
  const strategies = data.metaEfficiency;
  const dominant = Object.entries(strategies).reduce((a, b) =>
    strategies[a[0]] > strategies[b[0]] ? a : b
  );
  analysis.dominantStrategy = dominant[0];

  // Find emerging and declining decks
  analysis.emergingDecks = data.topDecks
    .filter(deck => deck.trend === 'up')
    .map(deck => deck.archetype);

  analysis.decliningDecks = data.topDecks
    .filter(deck => deck.trend === 'down')
    .map(deck => deck.archetype);

  // Calculate meta stability (lower = more volatile)
  const trendVariance = data.topDecks.reduce((sum, deck) => {
    const trendScore = deck.trend === 'stable' ? 1 : deck.trend === 'up' ? 0.5 : 1.5;
    return sum + trendScore;
  }, 0) / data.topDecks.length;

  analysis.metaStability = Math.max(0, Math.min(100, (2 - trendVariance) * 50));

  // Calculate overall power level
  const avgWinRate = data.topDecks.reduce((sum, deck) => sum + deck.winRate, 0) / data.topDecks.length;
  analysis.powerLevel = Math.min(100, avgWinRate);

  return analysis;
}

/**
 * Generate meta recommendations
 */
function generateMetaRecommendations(data) {
  const recommendations = [];

  const analysis = analyzeMetaTrends(data);

  // Strategy recommendations
  if (analysis.dominantStrategy === 'aggro') {
    recommendations.push('Aggressive strategies dominate - consider control or anti-aggro decks');
    recommendations.push('Board clears and removal spells are highly valuable');
  } else if (analysis.dominantStrategy === 'control') {
    recommendations.push('Control decks are strong - focus on efficient removal and card advantage');
    recommendations.push('Aggressive starts may struggle against established boards');
  } else {
    recommendations.push('Midrange strategies are viable - balance aggression with control');
  }

  // Emerging deck recommendations
  if (analysis.emergingDecks.length > 0) {
    recommendations.push(`Watch these emerging decks: ${analysis.emergingDecks.join(', ')}`);
  }

  // Power level assessment
  if (analysis.powerLevel > 70) {
    recommendations.push('Meta is very powerful - focus on consistency and sideboarding');
  } else if (analysis.powerLevel < 50) {
    recommendations.push('Meta has room for innovation - experimental decks may succeed');
  }

  return recommendations;
}

/**
 * Get popular cards in the current meta
 */
export function getPopularCards(gameType = 'hearthstone', format = 'standard', limit = 10) {
  const data = MOCK_TOURNAMENT_DATA[gameType]?.[format];

  if (!data?.cardPopularity) {
    return [];
  }

  return data.cardPopularity.slice(0, limit);
}

/**
 * Compare deck performance against meta
 */
export function compareToMeta(deckAnalysis, gameType = 'hearthstone', format = 'standard') {
  const metaData = MOCK_TOURNAMENT_DATA[gameType]?.[format];

  if (!metaData) {
    return { error: 'Meta data not available for comparison' };
  }

  const comparison = {
    metaPosition: 'unknown',
    competitiveScore: 0,
    recommendations: []
  };

  // Simple comparison based on score
  const deckScore = deckAnalysis.score || 5;
  const metaAvgWinRate = metaData.topDecks.reduce((sum, deck) => sum + deck.winRate, 0) / metaData.topDecks.length;

  if (deckScore >= 8) {
    comparison.metaPosition = 'tier1';
    comparison.competitiveScore = 90;
    comparison.recommendations.push('This deck appears to be meta-competitive');
  } else if (deckScore >= 6) {
    comparison.metaPosition = 'tier2';
    comparison.competitiveScore = 70;
    comparison.recommendations.push('Solid deck with good meta potential');
  } else {
    comparison.metaPosition = 'casual';
    comparison.competitiveScore = 40;
    comparison.recommendations.push('Consider rebuilding for competitive play');
  }

  return comparison;
}

/**
 * Get meta statistics
 */
export function getMetaStats(gameType = 'hearthstone', format = 'standard') {
  const data = MOCK_TOURNAMENT_DATA[gameType]?.[format];

  if (!data) {
    return { error: 'No meta statistics available' };
  }

  return {
    totalTournaments: data.totalTournaments,
    totalDecks: data.totalDecks,
    averageWinRate: data.topDecks.reduce((sum, deck) => sum + deck.winRate, 0) / data.topDecks.length,
    mostPopularArchetype: data.topDecks[0]?.archetype || 'Unknown',
    metaEfficiency: data.metaEfficiency,
    lastUpdated: data.lastUpdated
  };
}
