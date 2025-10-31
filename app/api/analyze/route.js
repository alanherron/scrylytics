// AI-powered deck analysis API for Scrylytics
// Uses OpenAI GPT-4 with HearthstoneJSON data for intelligent deck analysis

import OpenAI from 'openai';
import { fetchAllCards, parseDeckCode, validateDeck, getCardSynergies, calculateDeckStats } from '../../../lib/hearthstone.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { deckCode, gameType } = await request.json();

    if (!deckCode || !deckCode.trim()) {
      return Response.json({ error: 'Deck code is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback to basic analysis if no API key
      console.warn('No OpenAI API key found, using basic analysis');
      const analysis = analyzeDeckBasic(deckCode.trim(), gameType);
      return Response.json(analysis);
    }

    // Use AI for advanced analysis
    const analysis = await analyzeDeckWithAI(deckCode.trim(), gameType);

    return Response.json(analysis);
  } catch (error) {
    console.error('Deck analysis error:', error);
    return Response.json({ error: 'Failed to analyze deck' }, { status: 500 });
  }
}

async function analyzeDeckWithAI(deckCode, gameType) {
  try {
    // For Hearthstone, try to parse the deck code and get real data
    let deckData = null;
    let validation = null;

    if (gameType === 'hearthstone') {
      try {
        deckData = await parseDeckCode(deckCode);
        validation = await validateDeck(deckData);
        deckData.stats = calculateDeckStats(deckData);
        deckData.synergies = await getCardSynergies(null, deckData);
      } catch (parseError) {
        console.warn('Deck parsing failed, proceeding with basic analysis:', parseError);
      }
    }

    const prompt = createAnalysisPrompt(deckCode, gameType, deckData, validation);

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

    const analysisText = response.choices[0].message.content;
    return parseAIAnalysis(analysisText, gameType);

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
      prompt += `- Class: ${deckData.hero}\n`;
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
  } else {
    return `Analyze this Magic: The Gathering deck list: ${deckCode}

As an expert Magic analyst, provide detailed analysis including:
1. Overall score (1-10 scale) for competitive viability
2. Letter grade (S, A, B, C, D, F) with strategic assessment
3. Key strengths (3-5 competitive advantages)
4. Major weaknesses (2-4 strategic vulnerabilities)
5. Specific improvement suggestions (3-5 concrete changes)
6. Card synergies grouped by type (creatures, spells, lands, artifacts, enchantments, planeswalkers)

Consider format legality, mana efficiency, combo potential, and metagame positioning.
Format your response as JSON with these exact keys: score, grade, strengths (array), weaknesses (array), suggestions (array), synergies (object with arrays)`;
  }
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
    }
  };

  // Basic heuristic improvements
  if (deckCode.length > 50) {
    analysis.score = 6;
    analysis.grade = 'Decent Structure';
    analysis.strengths.push('Good card diversity');
  }

  return analysis;
}
