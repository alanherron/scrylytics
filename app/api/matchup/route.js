// Matchup Analysis API for Scrylytics
// Analyzes deck matchups and predicts win probabilities

import { analyzeMatchup } from '../../../lib/simulation/matchup.js';
import { parseDeckCode, validateDeck, calculateDeckStats } from '../../../lib/hearthstone.js';
import { parseMagicDeckList, validateMagicDeck, calculateMagicStats } from '../../../lib/magic.js';

export async function POST(request) {
  try {
    const { deck1, deck2, gameType } = await request.json();

    if (!deck1 || !deck2 || !gameType) {
      return Response.json({ error: 'Deck codes and game type are required' }, { status: 400 });
    }

    // Parse and validate decks
    let parsedDeck1, parsedDeck2;
    let validation1, validation2;

    if (gameType === 'hearthstone') {
      parsedDeck1 = await parseDeckCode(deck1);
      parsedDeck2 = await parseDeckCode(deck2);
      validation1 = await validateDeck(parsedDeck1);
      validation2 = await validateDeck(parsedDeck2);

      parsedDeck1.stats = calculateDeckStats(parsedDeck1);
      parsedDeck2.stats = calculateDeckStats(parsedDeck2);
    } else if (gameType === 'magic') {
      parsedDeck1 = parseMagicDeckList(deck1);
      parsedDeck2 = parseMagicDeckList(deck2);
      validation1 = validateMagicDeck(parsedDeck1);
      validation2 = validateMagicDeck(parsedDeck2);

      parsedDeck1.stats = await calculateMagicStats(parsedDeck1);
      parsedDeck2.stats = await calculateMagicStats(parsedDeck2);
    } else {
      return Response.json({ error: 'Unsupported game type' }, { status: 400 });
    }

    // Analyze matchup
    const analysis = analyzeMatchup(parsedDeck1, parsedDeck2, gameType);

    // Add deck information to response
    analysis.deck1 = {
      name: parsedDeck1.hero || parsedDeck1.format || 'Deck 1',
      valid: validation1.valid,
      issues: validation1.issues || []
    };

    analysis.deck2 = {
      name: parsedDeck2.hero || parsedDeck2.format || 'Deck 2',
      valid: validation2.valid,
      issues: validation2.issues || []
    };

    return Response.json(analysis);
  } catch (error) {
    console.error('Matchup analysis error:', error);
    return Response.json({ error: 'Failed to analyze matchup' }, { status: 500 });
  }
}
