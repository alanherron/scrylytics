// HearthstoneJSON API integration for Scrylytics
// Provides card data, validation, and analysis utilities

const HEARTHSTONE_API_URL = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.json';

// Cache for card data to avoid repeated API calls
let cardCache = null;
let cardMap = null;

/**
 * Fetch all Hearthstone cards from the API
 */
export async function fetchAllCards() {
  if (cardCache) {
    return cardCache;
  }

  try {
    const response = await fetch(HEARTHSTONE_API_URL);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    cardCache = await response.json();

    // Create a map for quick card lookups by ID
    cardMap = new Map();
    cardCache.forEach(card => {
      if (card.id) {
        cardMap.set(card.id.toLowerCase(), card);
      }
      if (card.dbfId) {
        cardMap.set(card.dbfId.toString(), card);
      }
      if (card.name) {
        cardMap.set(card.name.toLowerCase(), card);
      }
    });

    return cardCache;
  } catch (error) {
    console.error('Failed to fetch Hearthstone cards:', error);
    return [];
  }
}

/**
 * Get a specific card by ID, DBF ID, or name
 */
export async function getCard(identifier) {
  if (!cardMap) {
    await fetchAllCards();
  }

  if (!cardMap) {
    return null;
  }

  const searchTerm = identifier.toString().toLowerCase();
  return cardMap.get(searchTerm) || null;
}

/**
 * Parse a Hearthstone deck code and return card details
 * Note: This is a simplified parser. Real deck codes need proper decoding.
 */
export async function parseDeckCode(deckCode) {
  // For now, return a mock structure
  // In a real implementation, you'd decode the base64 deck code
  // and validate against actual card data

  const mockDeck = {
    hero: 'WARRIOR',
    cards: [
      { id: 'CS2_106', count: 2, name: 'Fiery War Axe', cost: 3 },
      { id: 'CS2_108', count: 2, name: 'Execute', cost: 1 },
      { id: 'EX1_400', count: 2, name: 'Whirlwind', cost: 1 },
      // ... more cards would be parsed from real deck code
    ],
    totalCards: 30,
    valid: true
  };

  return mockDeck;
}

/**
 * Validate a deck against game rules
 */
export async function validateDeck(deck) {
  const issues = [];

  // Check total cards
  if (deck.totalCards !== 30) {
    issues.push(`Deck must have exactly 30 cards (currently ${deck.totalCards})`);
  }

  // Check for legendary duplicates (should be 1 each)
  const cardCounts = {};
  deck.cards.forEach(card => {
    cardCounts[card.id] = (cardCounts[card.id] || 0) + card.count;
  });

  Object.entries(cardCounts).forEach(([cardId, count]) => {
    if (count > 2) {
      issues.push(`Card ${cardId} appears ${count} times (max 2)`);
    }
  });

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Get card synergies and interactions
 */
export async function getCardSynergies(cardId, deck) {
  // This would analyze card interactions, archetypes, etc.
  // For now, return basic categorization

  const synergies = {
    taunts: [],
    removals: [],
    buffs: [],
    damage: [],
    draws: []
  };

  // Mock synergy detection based on card names/types
  deck.cards.forEach(card => {
    if (card.name?.toLowerCase().includes('taunt')) {
      synergies.taunts.push(card.name);
    }
    if (card.name?.toLowerCase().includes('destroy') || card.name?.toLowerCase().includes('silence')) {
      synergies.removals.push(card.name);
    }
    // Add more synergy detection logic here
  });

  return synergies;
}

/**
 * Calculate deck statistics
 */
export function calculateDeckStats(deck) {
  let totalCost = 0;
  let cardCount = 0;
  const manaCurve = new Array(8).fill(0); // Mana costs 0-7+

  deck.cards.forEach(card => {
    totalCost += card.cost * card.count;
    cardCount += card.count;

    if (card.cost <= 6) {
      manaCurve[card.cost] += card.count;
    } else {
      manaCurve[7] += card.count; // 7+ costs
    }
  });

  return {
    totalCards: cardCount,
    averageCost: totalCost / cardCount,
    manaCurve,
    totalCost
  };
}
