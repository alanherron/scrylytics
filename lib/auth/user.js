// Simple User Management for Scrylytics
// Uses local storage for persistence (can be upgraded to database later)

// User data structure
const USER_STORAGE_KEY = 'scrylytics_user';
const DECKS_STORAGE_KEY = 'scrylytics_decks';
const ANALYSES_STORAGE_KEY = 'scrylytics_analyses';

/**
 * Create a new user account
 */
export function createUser(username, email = '') {
  const user = {
    id: generateUserId(),
    username: username.trim(),
    email: email.trim(),
    createdAt: new Date().toISOString(),
    preferences: {
      defaultGame: 'hearthstone',
      theme: 'light',
      notifications: true
    },
    stats: {
      totalAnalyses: 0,
      decksSaved: 0,
      favoriteGame: 'hearthstone'
    }
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Get current user
 */
export function getCurrentUser() {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Update user data
 */
export function updateUser(updates) {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = { ...currentUser, ...updates };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

/**
 * Save a deck for the current user
 */
export function saveDeck(deckData, name = 'Unnamed Deck') {
  const user = getCurrentUser();
  if (!user) return null;

  const decks = getUserDecks();
  const deck = {
    id: generateDeckId(),
    userId: user.id,
    name: name,
    gameType: deckData.gameType || 'hearthstone',
    deckCode: deckData.deckCode,
    parsedData: deckData,
    savedAt: new Date().toISOString(),
    tags: [],
    isPublic: false
  };

  decks.push(deck);
  localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));

  // Update user stats
  updateUser({
    stats: {
      ...user.stats,
      decksSaved: user.stats.decksSaved + 1
    }
  });

  return deck;
}

/**
 * Get all decks for the current user
 */
export function getUserDecks() {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const decksData = localStorage.getItem(DECKS_STORAGE_KEY);
    const allDecks = decksData ? JSON.parse(decksData) : [];

    // Filter decks for current user
    return allDecks.filter(deck => deck.userId === user.id);
  } catch (error) {
    console.error('Failed to get user decks:', error);
    return [];
  }
}

/**
 * Save an analysis result
 */
export function saveAnalysis(analysisData, deckName = 'Unknown Deck') {
  const user = getCurrentUser();
  if (!user) return null;

  const analyses = getUserAnalyses();
  const analysis = {
    id: generateAnalysisId(),
    userId: user.id,
    deckName: deckName,
    gameType: analysisData.gameType || 'hearthstone',
    score: analysisData.score,
    grade: analysisData.grade,
    strengths: analysisData.strengths || [],
    weaknesses: analysisData.weaknesses || [],
    suggestions: analysisData.suggestions || [],
    savedAt: new Date().toISOString()
  };

  analyses.push(analysis);
  localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(analyses));

  // Update user stats
  updateUser({
    stats: {
      ...user.stats,
      totalAnalyses: user.stats.totalAnalyses + 1
    }
  });

  return analysis;
}

/**
 * Get analysis history for the current user
 */
export function getUserAnalyses(limit = 10) {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const analysesData = localStorage.getItem(ANALYSES_STORAGE_KEY);
    const allAnalyses = analysesData ? JSON.parse(analysesData) : [];

    // Filter analyses for current user and sort by date
    return allAnalyses
      .filter(analysis => analysis.userId === user.id)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get user analyses:', error);
    return [];
  }
}

/**
 * Delete a saved deck
 */
export function deleteDeck(deckId) {
  const decks = getUserDecks();
  const filteredDecks = decks.filter(deck => deck.id !== deckId);

  if (filteredDecks.length !== decks.length) {
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(filteredDecks));
    return true;
  }
  return false;
}

/**
 * Clear all user data (for logout/reset)
 */
export function clearUserData() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(DECKS_STORAGE_KEY);
  localStorage.removeItem(ANALYSES_STORAGE_KEY);
}

/**
 * Generate unique IDs
 */
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateDeckId() {
  return 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateAnalysisId() {
  return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
