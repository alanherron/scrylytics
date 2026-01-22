import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { decode as decodeDeck } from 'deckstrings';
import { parseDeckCode, validateDeck, calculateDeckStats } from '@/lib/hearthstone';
import { parseMagicDeckList, validateMagicDeck, calculateMagicStats } from '@/lib/magic';

// Initialize OpenAI client lazily
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface HowToPlayRequest {
  deckCode: string;
  gameType: 'hearthstone' | 'magic';
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HowToPlayRequest;
    const { deckCode, gameType } = body;

    if (!deckCode || !deckCode.trim()) {
      return NextResponse.json(
        { error: 'Deck code is required' },
        { status: 400 }
      );
    }

    if (!gameType || !['hearthstone', 'magic'].includes(gameType)) {
      return NextResponse.json(
        { error: 'gameType must be "hearthstone" or "magic"' },
        { status: 400 }
      );
    }

    // Parse and validate deck using rules engine
    let deckData: any = null;
    let validation: any = null;
    let stats: any = null;
    let cardDetails: any[] = [];

    try {
      if (gameType === 'hearthstone') {
        // Try to decode the deck code using deckstrings library
        try {
          const decoded = decodeDeck(deckCode.trim());
          const cards = Array.isArray(decoded.cards) ? decoded.cards : [];
          const heroes = Array.isArray(decoded.heroes) ? decoded.heroes : [];
          
          // Build deck data from decoded information
          deckData = {
            hero: heroes.length > 0 ? `Hero (DBF: ${heroes[0]})` : 'Unknown',
            cards: cards.map(([dbfId, count]) => ({
              id: `DBF_${dbfId}`,
              dbfId,
              count,
              name: `Card ${dbfId}`, // Will be enriched if we have card data
            })),
            totalCards: cards.reduce((sum, [, count]) => sum + count, 0),
            valid: true,
            format: decoded.format || 1,
          };
          
          // Try to get card names from the card map if available
          const { getCard } = await import('@/lib/hearthstone');
          for (const card of deckData.cards) {
            try {
              const cardInfo = await getCard(card.dbfId.toString());
              if (cardInfo) {
                card.name = cardInfo.name || card.name;
                card.cost = cardInfo.cost || 0;
                card.type = cardInfo.type || 'Unknown';
                card.rarity = cardInfo.rarity || 'Common';
              }
            } catch (e) {
              // Continue without card details
            }
          }
        } catch (decodeError) {
          // Fall back to the mock parser
          deckData = await parseDeckCode(deckCode.trim());
        }
        
        validation = await validateDeck(deckData);
        stats = calculateDeckStats(deckData);
        cardDetails = deckData.cards || [];
      } else {
        deckData = parseMagicDeckList(deckCode.trim());
        validation = validateMagicDeck(deckData);
        stats = await calculateMagicStats(deckData);
        cardDetails = deckData.mainDeck || [];
      }
    } catch (parseError) {
      console.error('Deck parsing error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse deck. Please check your deck code format.' },
        { status: 400 }
      );
    }

    // Build comprehensive prompt with deck data and rules validation
    const prompt = buildHowToPlayPrompt(deckCode, gameType, deckData, validation, stats, cardDetails);

    // Generate gameplay guide using ChatGPT
    let guide = '';
    try {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${gameType} player and teacher. Your goal is to explain how to play decks in a clear, actionable way that helps players understand strategy, sequencing, and decision-making.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      });

      guide = response.choices[0]?.message?.content?.trim() ?? '';
    } catch (openaiError: unknown) {
      const errorMsg = openaiError instanceof Error ? openaiError.message : String(openaiError);
      
      // Handle OpenAI API errors with fallback
      if (errorMsg.includes('429') || errorMsg.includes('quota')) {
        console.warn('OpenAI API quota exceeded, using fallback guide');
        guide = generateFallbackGuide(deckData, gameType, validation, stats, cardDetails);
      } else if (errorMsg.includes('401') || errorMsg.includes('authentication')) {
        return NextResponse.json(
          { error: 'OpenAI API authentication failed. Please check your API key.' },
          { status: 400 }
        );
      } else {
        console.warn('OpenAI API error, using fallback guide:', errorMsg);
        guide = generateFallbackGuide(deckData, gameType, validation, stats, cardDetails);
      }
    }

    // Ensure we have a guide
    if (!guide) {
      guide = generateFallbackGuide(deckData, gameType, validation, stats, cardDetails);
    }

    return NextResponse.json({
      guide,
      deckInfo: {
        name: deckData.hero || deckData.format || 'Unknown Deck',
        class: deckData.hero || deckData.format || 'Unknown',
        totalCards: deckData.totalCards || 0,
        valid: validation?.valid ?? false,
        issues: validation?.issues || []
      },
      stats: stats || {}
    });

  } catch (err) {
    console.error('How to play API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to generate gameplay guide', details: errorMessage },
      { status: 500 }
    );
  }
}

function buildHowToPlayPrompt(
  deckCode: string,
  gameType: string,
  deckData: any,
  validation: any,
  stats: any,
  cardDetails: any[]
): string {
  if (gameType === 'hearthstone') {
    let prompt = `You are an expert Hearthstone player. Analyze this deck and provide a detailed gameplay guide.\n\n`;
    
    // Full deck list with card names
    prompt += `## Complete Deck List:\n`;
    if (cardDetails && cardDetails.length > 0) {
      // Group cards by cost for better analysis
      const cardsByCost: { [key: number]: any[] } = {};
      cardDetails.forEach((card: any) => {
        const cost = card.cost || 0;
        if (!cardsByCost[cost]) cardsByCost[cost] = [];
        cardsByCost[cost].push(card);
      });
      
      Object.keys(cardsByCost).sort((a, b) => parseInt(a) - parseInt(b)).forEach(cost => {
        const cards = cardsByCost[parseInt(cost)];
        prompt += `\n**Mana ${cost}:**\n`;
        cards.forEach((card: any) => {
          prompt += `- ${card.count}x ${card.name || `Card ${card.id || card.dbfId}`}${card.type ? ` (${card.type})` : ''}${card.rarity ? ` [${card.rarity}]` : ''}\n`;
        });
      });
    } else {
      prompt += `Deck Code: ${deckCode.substring(0, 100)}\n`;
    }
    
    prompt += `\n## Deck Statistics:\n`;
    prompt += `- Total Cards: ${deckData?.totalCards || 30}\n`;
    prompt += `- Hero/Class: ${deckData?.hero || 'Unknown'}\n`;
    
    if (stats) {
      prompt += `- Average Mana Cost: ${stats.averageCost?.toFixed(2) || 'N/A'}\n`;
      if (stats.manaCurve) {
        prompt += `- Mana Curve: `;
        stats.manaCurve.forEach((count: number, cost: number) => {
          if (count > 0) prompt += `${cost}-cost: ${count} cards, `;
        });
        prompt += `\n`;
      }
    }
    
    // Analyze deck composition
    if (cardDetails && cardDetails.length > 0) {
      const totalCards = cardDetails.reduce((sum: number, c: any) => sum + (c.count || 1), 0);
      const minions = cardDetails.filter((c: any) => c.type === 'Minion' || c.name?.toLowerCase().includes('minion')).length;
      const spells = cardDetails.filter((c: any) => c.type === 'Spell' || c.name?.toLowerCase().includes('spell')).length;
      const weapons = cardDetails.filter((c: any) => c.type === 'Weapon' || c.name?.toLowerCase().includes('weapon')).length;
      
      prompt += `\n## Deck Composition:\n`;
      prompt += `- Minions: ${minions} different cards\n`;
      prompt += `- Spells: ${spells} different cards\n`;
      prompt += `- Weapons: ${weapons} different cards\n`;
      
      // Identify key cards (high cost, legendary, or multiple copies)
      const keyCards = cardDetails
        .filter((c: any) => (c.count >= 2) || (c.cost >= 5) || (c.rarity === 'Legendary'))
        .slice(0, 10)
        .map((c: any) => `${c.count}x ${c.name || `Card ${c.id}`}`)
        .join(', ');
      if (keyCards) {
        prompt += `- Key Cards: ${keyCards}\n`;
      }
    }
    
    if (validation && !validation.valid && validation.issues) {
      prompt += `\n## Deck Validation Issues:\n`;
      validation.issues.forEach((issue: string) => {
        prompt += `- ${issue}\n`;
      });
    }
    
    prompt += `\n## Your Task:\n`;
    prompt += `Provide a comprehensive, actionable gameplay guide for this deck. Be specific and practical. Include:\n\n`;
    prompt += `1. **Deck Archetype & Overall Strategy**\n`;
    prompt += `   - Identify the deck archetype (Aggro, Control, Combo, Midrange, Tempo)\n`;
    prompt += `   - Explain the primary win condition\n`;
    prompt += `   - Describe the general game plan\n\n`;
    
    prompt += `2. **Mulligan Strategy**\n`;
    prompt += `   - What cards to keep in the opening hand (be specific with card names)\n`;
    prompt += `   - What to mulligan away\n`;
    prompt += `   - How mulligan changes based on going first vs second\n\n`;
    
    prompt += `3. **Early Game (Turns 1-4)**\n`;
    prompt += `   - Optimal turn-by-turn plays\n`;
    prompt += `   - When to trade vs go face\n`;
    prompt += `   - Resource management priorities\n\n`;
    
    prompt += `4. **Mid Game (Turns 5-8)**\n`;
    prompt += `   - Key decision points\n`;
    prompt += `   - When to use removal vs save it\n`;
    prompt += `   - Board control vs face damage\n\n`;
    
    prompt += `5. **Late Game (Turns 9+)**\n`;
    prompt += `   - How to close out the game\n`;
    prompt += `   - Finisher combos or win conditions\n`;
    prompt += `   - Resource management in long games\n\n`;
    
    prompt += `6. **Key Combos & Synergies**\n`;
    prompt += `   - Important card interactions\n`;
    prompt += `   - Combo sequences to look for\n`;
    prompt += `   - Synergy cards that work together\n\n`;
    
    prompt += `7. **Common Mistakes to Avoid**\n`;
    prompt += `   - Typical errors when playing this deck\n`;
    prompt += `   - Overextending into board clears\n`;
    prompt += `   - Mismanaging resources\n\n`;
    
    prompt += `8. **Matchup Tips**\n`;
    prompt += `   - How to play against aggressive decks\n`;
    prompt += `   - How to play against control decks\n`;
    prompt += `   - Key cards to watch for from opponents\n\n`;
    
    prompt += `\nWrite in a clear, instructional tone. Use markdown formatting with headers, bullet points, and bold text for key concepts. Be specific with card names and mana costs when giving examples.`;
    
    return prompt;
  } else {
    // Magic: The Gathering
    let prompt = `You are an expert Magic: The Gathering player. Analyze this deck and provide a detailed gameplay guide.\n\n`;
    
    prompt += `## Complete Deck List:\n`;
    prompt += `${deckCode}\n\n`;
    
    if (deckData) {
      prompt += `## Deck Information:\n`;
      prompt += `- Format: ${deckData.format || 'Unknown'}\n`;
      prompt += `- Total Cards: ${deckData.totalCards || 0}\n`;
      
      if (cardDetails && cardDetails.length > 0) {
        prompt += `\n## Main Deck Cards:\n`;
        cardDetails.slice(0, 30).forEach((card: any) => {
          prompt += `- ${card.count}x ${card.name}\n`;
        });
        if (cardDetails.length > 30) {
          prompt += `- ... and ${cardDetails.length - 30} more cards\n`;
        }
        
        if (deckData.sideboard && deckData.sideboard.length > 0) {
          prompt += `\n## Sideboard:\n`;
          deckData.sideboard.forEach((card: any) => {
            prompt += `- ${card.count}x ${card.name}\n`;
          });
        }
      }
      
      if (stats) {
        prompt += `\n## Deck Statistics:\n`;
        prompt += `- Average CMC: ${stats.averageCMC?.toFixed(2) || 'N/A'}\n`;
        if (stats.manaCurve) {
          prompt += `- Mana Curve: ${JSON.stringify(stats.manaCurve)}\n`;
        }
      }
      
      if (validation && !validation.valid && validation.issues) {
        prompt += `\n## Deck Validation Issues:\n`;
        validation.issues.forEach((issue: string) => {
          prompt += `- ${issue}\n`;
        });
      }
    }
    
    prompt += `\n## Your Task:\n`;
    prompt += `Provide a comprehensive, actionable gameplay guide for this Magic: The Gathering deck. Include:\n\n`;
    prompt += `1. **Deck Archetype & Strategy** - Identify archetype and win condition\n`;
    prompt += `2. **Mulligan Strategy** - What hands to keep vs mulligan\n`;
    prompt += `3. **Early Game** - Turn-by-turn plays for first few turns\n`;
    prompt += `4. **Mid Game** - Key decision points and plays\n`;
    prompt += `5. **Late Game** - How to win and close out games\n`;
    prompt += `6. **Key Combos & Synergies** - Important card interactions\n`;
    prompt += `7. **Sideboard Guide** - What to bring in/out against different matchups\n`;
    prompt += `8. **Common Mistakes** - What to avoid when playing this deck\n\n`;
    prompt += `Write in a clear, instructional tone. Use markdown formatting with headers, bullet points, and bold text. Be specific with card names when giving examples.`;
    
    return prompt;
  }
}

function generateFallbackGuide(deckData: any, gameType: string, validation: any, stats: any, cardDetails: any[]): string {
  const deckName = deckData?.hero || deckData?.format || 'this deck';
  const avgCost = stats?.averageCost || stats?.averageCMC || 0;
  const archetype = avgCost < 3 ? 'Aggressive' : avgCost > 5 ? 'Control' : 'Midrange';
  
  let guide = `# How to Play ${deckName}

## Deck Archetype
This appears to be a **${archetype}** deck based on its mana curve (average cost: ${avgCost.toFixed(1)}).

## General Strategy
${archetype === 'Aggressive' 
  ? 'Focus on establishing early board presence and applying pressure. Prioritize playing threats over answers in the early game. Look to close out games quickly before your opponent can stabilize.'
  : archetype === 'Control'
  ? 'Focus on surviving the early game, removing threats efficiently, and winning in the late game with powerful finishers. Be patient and don\'t overcommit resources early.'
  : 'Balance between early threats and late-game value. Adapt your playstyle based on the matchup. You have flexibility to play both aggressively and defensively.'}

## Key Cards
`;

  // Add key cards if available
  if (cardDetails && cardDetails.length > 0) {
    const keyCards = cardDetails
      .filter((c: any) => (c.count >= 2) || (c.cost >= 5) || (c.rarity === 'Legendary'))
      .slice(0, 8)
      .map((c: any) => `- ${c.count}x **${c.name || `Card ${c.id || c.dbfId}`}**${c.cost ? ` (${c.cost} mana)` : ''}`);
    
    if (keyCards.length > 0) {
      guide += keyCards.join('\n') + '\n\n';
    }
  }

  guide += `## Mulligan Strategy
- Keep low-cost cards (1-3 mana) that help establish your game plan
- Prioritize cards that provide immediate value or board presence
- Mulligan away expensive cards unless they're essential to your strategy

## Early Game (Turns 1-4)
${archetype === 'Aggressive' 
  ? '- Play on curve, prioritizing minions that can attack immediately\n- Apply pressure early, forcing your opponent to react\n- Don\'t be afraid to go face if you have board control'
  : archetype === 'Control'
  ? '- Focus on removal and defensive plays\n- Don\'t overcommit to the board\n- Save resources for key removal spells'
  : '- Balance between developing board and holding answers\n- Adapt based on what your opponent is playing\n- Set up for your mid-game power plays'}

## Mid Game (Turns 5-8)
- This is where ${archetype.toLowerCase()} decks typically make their key plays
- ${archetype === 'Aggressive' ? 'Push for lethal if possible, or set up for a strong finish' : archetype === 'Control' ? 'Stabilize the board and start generating value' : 'Execute your game plan and adapt to the board state'}
- Manage your resources carefully - don't waste removal on low-value targets

## Late Game (Turns 9+)
${archetype === 'Aggressive' 
  ? '- If you haven\'t won yet, look for burst damage or reach to finish the game\n- Don\'t let the game drag on too long'
  : archetype === 'Control'
  ? '- Play your finishers and powerful late-game cards\n- Outvalue your opponent and win through card advantage'
  : '- Close out the game with your strongest threats\n- Maintain board control and pressure'}

## Common Mistakes to Avoid
- Overextending into board clears - don\'t commit everything if your opponent might have AoE
- Not respecting opponent\'s potential answers - play around key removal spells
- Mismanaging resources - balance spending mana efficiently vs holding cards for key moments
- Not identifying your win condition - know how you plan to win and play towards it

*Note: This is a basic guide generated from deck statistics. For more detailed strategy with specific card interactions, ensure your OpenAI API key is configured.*
`;

  return guide;
}



