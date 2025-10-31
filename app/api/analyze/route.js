// AI-powered deck analysis API for Scrylytics
// Uses OpenAI GPT-4 with HearthstoneJSON data for intelligent deck analysis

import OpenAI from 'openai';
import { fetchAllCards, parseDeckCode, validateDeck, getCardSynergies, calculateDeckStats } from '../../../lib/hearthstone.js';
import { parseMagicDeckList, validateMagicDeck, calculateMagicStats, getMagicSynergies, getCardByName, getCardImageUrl } from '../../../lib/magic.js';
import guard from '../../../src/analyzer/guard.cjs';

let openai = null;

export async function POST(request) {
  try {
    const { deckCode, gameType } = await request.json();

    if (!deckCode || !deckCode.trim()) {
      return Response.json({ error: 'Deck code is required' }, { status: 400 });
    }

    console.log('Analyzing deck:', { gameType, deckCodeLength: deckCode.length, firstLine: deckCode.split('\n')[0] });
    console.log('OpenAI API key available:', !!process.env.OPENAI_API_KEY);
    console.log('CI mode:', guard.isCI ? 'enabled' : 'disabled');

    // In CI mode, skip expensive operations and return basic analysis immediately
    if (guard.shouldSkipAnalysis) {
      console.log('🔇 Using basic analysis in CI/safe mode');
      const analysis = analyzeDeckBasic(deckCode.trim(), gameType);
      analysis.fallbackReason = 'ci_mode';
      analysis.cardImages = []; // No images in CI mode
      return Response.json(analysis);
    }

    // Always try AI analysis first, fallback to basic if it fails
    try {
      const analysis = await analyzeDeckWithAI(deckCode.trim(), gameType);
      console.log('AI analysis completed successfully');
      return Response.json(analysis);
    } catch (aiError) {
      console.warn('AI analysis failed, falling back to basic:', aiError.message);
      const analysis = analyzeDeckBasic(deckCode.trim(), gameType);
      analysis.fallbackReason = 'AI analysis unavailable';

      // Still try to get basic card images in development mode
      try {
        // Try to parse the deck for card images even if AI failed
        let parsedDeckData = null;
        if (gameType === 'magic') {
          try {
            parsedDeckData = parseMagicDeckList(deckCode.trim());
          } catch (parseError) {
            console.warn('Deck parsing failed for card images:', parseError.message);
          }
        } else if (gameType === 'hearthstone') {
          try {
            parsedDeckData = await parseDeckCode(deckCode.trim());
          } catch (parseError) {
            console.warn('Hearthstone deck parsing failed for card images:', parseError.message);
          }
        }
        analysis.cardImages = await getCardImages(deckCode.trim(), gameType, parsedDeckData);
      } catch (imageError) {
        console.warn('Card image fetching also failed:', imageError.message);
        analysis.cardImages = [];
      }

      return Response.json(analysis);
    }
  } catch (error) {
    console.error('Deck analysis error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ error: 'Failed to analyze deck', details: error.message }, { status: 500 });
  }
}

async function analyzeDeckWithAI(deckCode, gameType) {
  try {
    // Parse and analyze deck based on game type
    let deckData = null;
    let validation = null;

    if (gameType === 'hearthstone') {
      try {
        deckData = await parseDeckCode(deckCode);
        validation = await validateDeck(deckData);
        deckData.stats = calculateDeckStats(deckData);
        deckData.synergies = await getCardSynergies(null, deckData);
      } catch (parseError) {
        console.warn('Hearthstone deck parsing failed, proceeding with basic analysis:', parseError);
      }
    } else if (gameType === 'magic') {
      try {
        deckData = parseMagicDeckList(deckCode);
        validation = validateMagicDeck(deckData);
        deckData.stats = await calculateMagicStats(deckData);
        deckData.synergies = getMagicSynergies(deckData);
      } catch (parseError) {
        console.warn('Magic deck parsing failed, proceeding with basic analysis:', parseError);
      }
    }

    const prompt = createAnalysisPrompt(deckCode, gameType, deckData, validation);

    // Initialize OpenAI client lazily to avoid build-time issues
    if (!openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    console.log('Making OpenAI API call...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${gameType} deck analyst with deep knowledge of game mechanics, meta strategies, and card interactions. Analyze the provided deck data and return a detailed JSON response. Use real game knowledge to provide accurate, actionable analysis.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    console.log('OpenAI API call completed successfully');

    const analysisText = response.choices[0].message.content;
    const analysis = parseAIAnalysis(analysisText, gameType);

    // Add card images to the analysis
    if (analysis) {
      analysis.cardImages = await getCardImages(deckCode, gameType, deckData);
    }

    return analysis;

  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback to basic analysis
    return analyzeDeckBasic(deckCode, gameType);
  }
}

function createAnalysisPrompt(deckCode, gameType, deckData = null, validation = null) {
  const basePrompt = `You are a professional ${gameType} deck analyst. Analyze this deck and provide expert-level feedback.`;

  if (gameType === 'hearthstone') {
    let prompt = `Analyze this Hearthstone deck code: ${deckCode}\n\n`;

    if (deckData) {
      prompt += `Parsed deck data:\n`;
      prompt += `- Class: ${deckData.hero || 'Unknown'}\n`;
      prompt += `- Total cards: ${deckData.totalCards}\n`;
      prompt += `- Mana curve: ${JSON.stringify(deckData.stats?.manaCurve || [])}\n`;
      prompt += `- Average cost: ${deckData.stats?.averageCost?.toFixed(1) || 'N/A'}\n`;

      if (validation && !validation.valid) {
        prompt += `\nValidation issues: ${validation.issues.join(', ')}\n`;
      }

      if (deckData.synergies) {
        prompt += `\nDetected synergies:\n`;
        Object.entries(deckData.synergies).forEach(([type, cards]) => {
          if (cards.length > 0) {
            prompt += `- ${type}: ${cards.join(', ')}\n`;
          }
        });
      }
    }

    prompt += `\nAs a Hearthstone expert, provide detailed analysis including:
1. Overall score (1-10 scale) considering current meta
2. Letter grade (S, A, B, C, D, F) with reasoning
3. Key strengths (3-5 specific advantages)
4. Major weaknesses (2-4 areas needing improvement)
5. Specific improvement suggestions (3-5 actionable changes)
6. Card synergies grouped by mechanic (taunts, removal, buffs, damage, card draw, etc.)

Consider current Hearthstone meta, card interactions, and strategic viability.
Format your response as JSON with these exact keys: score, grade, strengths (array), weaknesses (array), suggestions (array), synergies (object with arrays)`;
    return prompt;
  } else if (gameType === 'magic') {
    let prompt = `Analyze this Magic: The Gathering deck list: ${deckCode}\n\n`;

    if (deckData) {
      prompt += `Parsed deck data:\n`;
      prompt += `- Format: ${deckData.format}\n`;
      prompt += `- Total cards: ${deckData.totalCards}\n`;
      prompt += `- Main deck: ${deckData.mainDeck.length} cards\n`;
      prompt += `- Sideboard: ${deckData.sideboard.length} cards\n`;
      prompt += `- Commander: ${deckData.commander.length} cards\n`;
      prompt += `- Mana curve: ${JSON.stringify(deckData.stats?.manaCurve || [])}\n`;
      prompt += `- Average CMC: ${deckData.stats?.averageCmc || 'N/A'}\n`;
      prompt += `- Color distribution: ${JSON.stringify(deckData.stats?.colorDistribution || {})}\n`;

      if (deckData.synergies?.primaryArchetype) {
        prompt += `- Primary archetype: ${deckData.synergies.primaryArchetype}\n`;
      }

      if (validation && !validation.valid) {
        prompt += `\nValidation issues: ${validation.issues.join(', ')}\n`;
      }
    }

    prompt += `\nAs an expert Magic analyst, provide detailed analysis including:
1. Overall score (1-10 scale) for competitive viability
2. Letter grade (S, A, B, C, D, F) with strategic assessment
3. Key strengths (3-5 competitive advantages)
4. Major weaknesses (2-4 strategic vulnerabilities)
5. Specific improvement suggestions (3-5 concrete changes)
6. Card synergies grouped by type (creatures, spells, lands, artifacts, enchantments, planeswalkers)

Consider format legality, mana efficiency, combo potential, and metagame positioning.
Format your response as JSON with these exact keys: score, grade, strengths (array), weaknesses (array), suggestions (array), synergies (object with arrays)`;
    return prompt;
  }

  return `${basePrompt}\n\nDeck: ${deckCode}\n\nProvide analysis in the same JSON format.`;
}

function parseAIAnalysis(analysisText, gameType) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateAnalysis(parsed, gameType);
    }

    // If no JSON found, create a structured response from text
    return createFallbackAnalysis(analysisText, gameType);

  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return analyzeDeckBasic('', gameType); // Fallback
  }
}

function validateAnalysis(analysis, gameType) {
  // Ensure required fields exist
  const required = ['score', 'grade', 'strengths', 'weaknesses', 'suggestions', 'synergies'];

  for (const field of required) {
    if (!(field in analysis)) {
      console.warn(`Missing field: ${field}, using fallback`);
      return analyzeDeckBasic('', gameType);
    }
  }

  // Ensure score is a number
  analysis.score = Math.max(1, Math.min(10, Number(analysis.score) || 5));

  // Ensure arrays exist
  analysis.strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  analysis.weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
  analysis.suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions : [];

  // Ensure synergies is an object
  analysis.synergies = typeof analysis.synergies === 'object' ? analysis.synergies : {};

  return analysis;
}

function createFallbackAnalysis(text, gameType) {
  // Extract information from text response if JSON parsing fails
  const analysis = analyzeDeckBasic('', gameType);

  // Try to enhance with text content
  if (text.includes('excellent') || text.includes('great')) analysis.score = Math.max(analysis.score, 8);
  if (text.includes('good')) analysis.score = Math.max(analysis.score, 6);

  return analysis;
}

// Get card images for key cards in the deck
async function getCardImages(deckCode, gameType, deckData) {
  const cardImages = [];
  console.log('Getting card images for:', { gameType, hasDeckData: !!deckData, deckCodeLength: deckCode?.length });

  // Skip expensive card image fetching in CI mode
  if (guard.shouldSkipAnalysis) {
    console.log('🔇 Skipping card image fetching in CI/safe mode');
    return [];
  }

  try {
    if (gameType === 'magic' && deckData?.mainDeck) {
      console.log('Processing Magic deck with', deckData.mainDeck.length, 'cards');
      console.log('Deck data structure:', JSON.stringify(deckData, null, 2));
      const keyCards = deckData.mainDeck.slice(0, 6); // Limit to 6 key cards
      console.log('Key cards to process:', keyCards.map(c => c.name));

      for (const card of keyCards) {
        if (cardImages.length >= 6) break; // Ensure we don't exceed limit

        try {
          console.log(`Fetching image for: ${card.name}`);
          if (cardImages.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Delay for API
          }

          const cardData = await getCardByName(card.name);
          console.log(`Card data for ${card.name}:`, !!cardData, cardData?.image_uris?.normal ? 'has image' : 'no image');

          if (cardData && cardData.image_uris?.normal) {
            cardImages.push({
              name: card.name,
              count: card.count,
              imageUrl: cardData.image_uris.normal
            });
            console.log(`Added image for ${card.name}`);
          } else {
            console.warn(`No image found for ${card.name}`);
          }
        } catch (error) {
          console.warn(`Failed to get image for ${card.name}:`, error.message);
          // Continue with other cards even if one fails
        }
      }

    } else if (gameType === 'hearthstone' && deckData?.cards) {
      console.log('Processing Hearthstone deck with', deckData.cards.length, 'cards');
      // For Hearthstone, show first few cards with placeholders
      // TODO: Implement Hearthstone card image API
      const hearthstoneCards = deckData.cards.slice(0, 6);
      for (const card of hearthstoneCards) {
        cardImages.push({
          name: card.name || 'Unknown Card',
          count: card.count || 1,
          imageUrl: `https://via.placeholder.com/200x300?text=${encodeURIComponent(card.name || 'Hearthstone Card')}`
        });
      }
    } else {
      console.warn('No deck data available for card images:', { gameType, hasMainDeck: !!deckData?.mainDeck, hasCards: !!deckData?.cards });
    }
  } catch (error) {
    console.error('Failed to fetch card images:', error);
  }

  console.log('Returning', cardImages.length, 'card images');
  return cardImages;
}

// Fallback basic analysis (original implementation)
function analyzeDeckBasic(deckCode, gameType) {
  const analysis = {
    score: 5,
    grade: 'Basic Analysis',
    strengths: ['Deck structure appears sound'],
    weaknesses: ['Advanced analysis requires AI'],
    suggestions: ['Consider upgrading to AI-powered analysis'],
    synergies: gameType === 'hearthstone' ? {
      'minions': ['Various minions'],
      'spells': ['Various spells'],
      'weapons': ['Weapon cards'],
      'heroes': ['Hero powers']
    } : {
      'creatures': ['Various creatures'],
      'spells': ['Various spells'],
      'lands': ['Various lands'],
      'artifacts': ['Various artifacts']
    },
    cardImages: [] // Will be populated by caller if needed
  };

  // Basic heuristic improvements
  if (deckCode.length > 50) {
    analysis.score = 6;
    analysis.grade = 'Decent Structure';
    analysis.strengths.push('Good card diversity');
  }

  return analysis;
}
