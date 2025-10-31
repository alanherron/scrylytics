// API endpoint for loading real card images
// Called after initial analysis to replace placeholders

import { fetchAllCards, parseDeckCode, validateDeck, getCardSynergies, calculateDeckStats } from '../../../../lib/hearthstone.js';
import { parseMagicDeckList, validateMagicDeck, calculateMagicStats, getMagicSynergies, getCardByName, getCardImageUrl } from '../../../../lib/magic.js';

export async function POST(request) {
  try {
    const { deckCode, gameType } = await request.json();

    if (!deckCode || !gameType) {
      return Response.json({ error: 'Deck code and game type are required' }, { status: 400 });
    }

    console.log('Loading real card images for:', { gameType, deckCodeLength: deckCode.length });

    // Parse deck data
    let deckData = null;
    if (gameType === 'hearthstone') {
      deckData = await parseDeckCode(deckCode);
    } else if (gameType === 'magic') {
      deckData = parseMagicDeckList(deckCode);
    } else {
      return Response.json({ error: 'Unsupported game type' }, { status: 400 });
    }

    // Load real card images
    const cardImages = await getCardImages(deckCode, gameType, deckData);

    return Response.json({ cardImages });

  } catch (error) {
    console.error('Image loading failed:', error);
    return Response.json({ error: 'Failed to load card images', details: error.message }, { status: 500 });
  }
}

// Reuse the getCardImages function from the main analyzer
async function getCardImages(deckCode, gameType, deckData) {
  const cardImages = [];
  console.log('Getting real card images for:', { gameType, hasDeckData: !!deckData });

  try {
    if (gameType === 'magic' && deckData?.mainDeck) {
      console.log('Processing Magic deck with', deckData.mainDeck.length, 'cards');
      const keyCards = deckData.mainDeck.slice(0, 6); // Limit to 6 key cards
      console.log('Key cards to process:', keyCards.map(c => c.name));

      for (const card of keyCards) {
        if (cardImages.length >= 6) break; // Ensure we don't exceed limit

        try {
          console.log(`Fetching image for: ${card.name}`);
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
      // Use HearthstoneJSON art API for real card images
      const hearthstoneCards = deckData.cards.slice(0, 6);
      for (const card of hearthstoneCards) {
        if (card.id) {
          // Use HearthstoneJSON render API for card images
          const imageUrl = `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${card.id}.png`;
          cardImages.push({
            name: card.name || 'Unknown Card',
            count: card.count || 1,
            imageUrl: imageUrl
          });
          console.log(`Added Hearthstone image for ${card.name}: ${imageUrl}`);
        } else {
          // Fallback to placeholder if no ID
          cardImages.push({
            name: card.name || 'Unknown Card',
            count: card.count || 1,
            imageUrl: `https://via.placeholder.com/256x/372?text=${encodeURIComponent(card.name || 'Hearthstone Card')}`
          });
        }
      }
    } else {
      console.warn('No deck data available for card images:', { gameType, hasMainDeck: !!deckData?.mainDeck, hasCards: !!deckData?.cards });
    }
  } catch (error) {
    console.error('Failed to fetch card images:', error);
  }

  console.log('Returning', cardImages.length, 'real card images');
  return cardImages;
}
