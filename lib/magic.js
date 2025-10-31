// Scryfall API integration for Scrylytics
// Provides Magic: The Gathering card data and analysis utilities

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

// Cache for card data
let cardCache = new Map();
let cardNameCache = new Map();
let searchCache = new Map();

/**
 * Search for Magic cards by name or query
 */
export async function searchCards(query, limit = 10) {
  const cacheKey = `${query}_${limit}`;

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const url = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}&unique=cards&order=name&limit=${limit}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Scrylytics/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`Scryfall API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.data || [];

    // Cache the results
    searchCache.set(cacheKey, results);

    return results;
  } catch (error) {
    console.error('Card search failed:', error);
    return [];
  }
}

/**
 * Get a specific card by exact name
 */
export async function getCardByName(cardName) {
  if (!cardName || cardName.trim() === '') return null;

  const cacheKey = cardName.toLowerCase().trim();

  if (cardNameCache.has(cacheKey)) {
    return cardNameCache.get(cacheKey);
  }

  try {
    // Add timeout to card lookup
    const cardLookupTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Card lookup timed out')), 3000);
    });

    const cardLookupPromise = async () => {
      // Try exact match first
      let cards = await searchCards(`!"${cardName}"`, 1);

      // If no exact match, try fuzzy search
      if (cards.length === 0) {
        cards = await searchCards(cardName, 1);
      }

      return cards[0] || null;
    };

    const card = await Promise.race([cardLookupPromise(), cardLookupTimeout]);

    if (card) {
      cardNameCache.set(cacheKey, card);
    }

    return card;
  } catch (error) {
    console.error(`Failed to get card "${cardName}":`, error.message);
    return null;
  }
}

/**
 * Get card image URL (normal quality)
 */
export function getCardImageUrl(card, size = 'normal') {
  if (!card?.image_uris) return null;

  // Scryfall provides different image sizes
  const sizes = ['small', 'normal', 'large', 'png', 'art_crop', 'border_crop'];
  return card.image_uris[size] || card.image_uris.normal;
}

/**
 * Parse a Magic deck list into structured format
 */
export function parseMagicDeckList(deckText) {
  const deck = {
    mainDeck: [],
    sideboard: [],
    commander: [],
    totalCards: 0,
    format: 'Unknown',
    valid: false
  };

  try {
    const lines = deckText.split('\n').map(line => line.trim()).filter(line => line);
    let currentSection = 'mainDeck';

    for (const line of lines) {
      // Check for section headers
      if (line.toLowerCase().includes('sideboard')) {
        currentSection = 'sideboard';
        continue;
      }
      if (line.toLowerCase().includes('commander')) {
        currentSection = 'commander';
        continue;
      }

      // Parse card lines (format: "4 Lightning Bolt" or "1x Lightning Bolt")
      const cardMatch = line.match(/^(\d+)\s*[xX]?\s*(.+)$/);
      if (cardMatch) {
        const [, count, cardName] = cardMatch;
        const card = {
          name: cardName.trim(),
          count: parseInt(count),
          section: currentSection
        };

        deck[currentSection].push(card);
        deck.totalCards += parseInt(count);
      }
    }

    // Basic validation
    deck.valid = deck.totalCards >= 40; // Minimum deck size
    if (deck.commander.length > 0) {
      deck.format = 'Commander';
      deck.valid = deck.totalCards >= 60; // Commander decks need 60+ cards
    } else if (deck.totalCards >= 60) {
      deck.format = 'Standard';
    } else {
      deck.format = 'Casual';
    }

  } catch (error) {
    console.error('Deck parsing failed:', error);
  }

  return deck;
}

/**
 * Validate a Magic deck against format rules
 */
export function validateMagicDeck(deck) {
  const issues = [];

  // Format-specific validation
  if (deck.format === 'Commander') {
    if (deck.commander.length !== 1) {
      issues.push('Commander decks must have exactly 1 commander');
    }
    if (deck.totalCards < 60) {
      issues.push('Commander decks must have at least 60 cards');
    }
  } else if (deck.format === 'Standard') {
    if (deck.totalCards < 60) {
      issues.push('Standard decks should have at least 60 cards');
    }
  }

  // Check for illegal cards (basic validation)
  const illegalCards = ['Black Lotus', 'Mox Sapphire', 'Mox Jet', 'Mox Ruby', 'Mox Emerald'];
  for (const section of ['mainDeck', 'sideboard', 'commander']) {
    for (const card of deck[section]) {
      if (illegalCards.includes(card.name)) {
        issues.push(`${card.name} is restricted or banned in most formats`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    format: deck.format
  };
}

/**
 * Calculate Magic deck statistics
 */
export async function calculateMagicStats(deck) {
  let totalCmc = 0;
  let totalCards = 0;
  const manaCurve = new Array(8).fill(0); // Mana costs 0-7+
  const colorDistribution = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };

  // Analyze each card in the deck
  for (const card of [...deck.mainDeck, ...deck.sideboard, ...deck.commander]) {
    try {
      const cardData = await getCardByName(card.name);

      if (cardData) {
        const cmc = cardData.cmc || 0;
        totalCmc += cmc * card.count;
        totalCards += card.count;

        // Mana curve
        if (cmc <= 6) {
          manaCurve[Math.floor(cmc)] += card.count;
        } else {
          manaCurve[7] += card.count;
        }

        // Color analysis
        if (cardData.color_identity) {
          cardData.color_identity.forEach(color => {
            colorDistribution[color] = (colorDistribution[color] || 0) + card.count;
          });
        } else if (cardData.colors && cardData.colors.length === 0) {
          // Colorless cards
          colorDistribution.C += card.count;
        }
      }
    } catch (error) {
      console.warn(`Failed to analyze card: ${card.name}`, error);
    }
  }

  return {
    totalCards,
    averageCmc: totalCards > 0 ? (totalCmc / totalCards).toFixed(1) : 0,
    manaCurve,
    colorDistribution,
    totalCmc
  };
}

/**
 * Get Magic card synergies and archetypes
 */
export function getMagicSynergies(deck) {
  const synergies = {
    creatures: [],
    spells: [],
    lands: [],
    artifacts: [],
    enchantments: [],
    planeswalkers: []
  };

  const archetypes = {
    aggro: 0,
    control: 0,
    combo: 0,
    midrange: 0
  };

  // Simple archetype detection based on card names
  const aggroIndicators = ['burn', 'lightning', 'bolt', 'shock', 'mutagenic growth'];
  const controlIndicators = ['counterspell', 'cancel', 'wrath', 'doomskar'];
  const comboIndicators = ['tinker', 'lotus', 'petal', 'storm', 'combo'];

  for (const card of [...deck.mainDeck, ...deck.sideboard]) {
    const name = card.name.toLowerCase();

    // Categorize by type
    if (name.includes('creature') || name.match(/\b(cat|wolf|dragon|angel|demon|knight)\b/)) {
      synergies.creatures.push(card.name);
    } else if (name.includes('instant') || name.includes('sorcery') || name.match(/\b(bolt|blast|strike|kill)\b/)) {
      synergies.spells.push(card.name);
    } else if (name.includes('land') || name.match(/\b(island|forest|mountain|plains|swamp)\b/)) {
      synergies.lands.push(card.name);
    }

    // Archetype detection
    if (aggroIndicators.some(indicator => name.includes(indicator))) archetypes.aggro++;
    if (controlIndicators.some(indicator => name.includes(indicator))) archetypes.control++;
    if (comboIndicators.some(indicator => name.includes(indicator))) archetypes.combo++;
  }

  // Determine primary archetype
  const maxArchetype = Object.entries(archetypes).reduce((a, b) => archetypes[a[0]] > archetypes[b[0]] ? a : b);
  const primaryArchetype = maxArchetype[1] > 0 ? maxArchetype[0] : 'unknown';

  return {
    ...synergies,
    primaryArchetype,
    archetypeScores: archetypes
  };
}
