import { NextResponse } from 'next/server'

import OpenAI from 'openai'

import { prisma } from '@/lib/prisma'

// Initialize OpenAI client lazily to handle missing API key
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface SynergyLink {
  target: { id: string };
  value: number;
  info?: {
    winrate?: number;
    frequency?: number;
    type?: string;
  };
}

interface OracleRequest {
  cardName: string;
  links: SynergyLink[];
  patchVersion?: string;
}

// Handle GET requests (likely from browser prefetching or direct navigation)
export async function GET(req: Request) {
  // Check if this is a prefetch request (Next.js Link prefetching)
  const purpose = req.headers.get('purpose') || req.headers.get('x-purpose');
  const isPrefetch = purpose === 'prefetch' || req.headers.get('sec-purpose') === 'prefetch';
  
  // For prefetch requests, return a simple 405 without verbose error message
  if (isPrefetch) {
    return new NextResponse(null, { status: 405 });
  }
  
  // For direct navigation or other GET requests, return helpful error message
  return NextResponse.json(
    { 
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests. Please send a POST request with cardName and links in the request body.',
      example: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          cardName: 'string',
          links: [{ target: { id: 'string' }, value: 0.85 }],
          patchVersion: 'string (optional)'
        }
      }
    },
    { status: 405 }
  );
}

export async function POST(req: Request) {
  try {
    let body: OracleRequest;
    try {
      body = (await req.json()) as OracleRequest;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { cardName, links, patchVersion } = body;

    // Validate required fields
    if (!cardName || typeof cardName !== 'string' || !cardName.trim()) {
      return NextResponse.json(
        { error: 'cardName is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!links || !Array.isArray(links) || links.length === 0) {
      return NextResponse.json(
        { error: 'links is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // 1️⃣ Check cache first (gracefully handle DB errors)
    let cached = null;
    try {
      if (!prisma) {
        throw new Error('Prisma client not available');
      }
      cached = await prisma.oracleInsight.findFirst({
        where: { 
          cardName, 
          patchVersion: patchVersion ?? undefined 
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (dbError) {
      console.warn('Database cache check failed, continuing without cache:', dbError);
    }

    if (cached) {
      return NextResponse.json({ summary: cached.summary, cached: true });
    }

    // 2️⃣ Build synergy text for prompt (validate link structure)
    const synergyList = links
      .map((l) => {
        if (!l || !l.target || typeof l.target.id !== 'string') {
          return `- invalid-link: synergy=0%, winrate=-, freq=-, type=-`;
        }
        const value = typeof l.value === 'number' ? l.value : 0;
        return `- ${l.target.id}: synergy=${(value * 100).toFixed(0)}%, winrate=${l.info?.winrate ?? '-'}, freq=${l.info?.frequency ?? '-'}, type=${l.info?.type ?? '-'}`;
      })
      .join('\n');

    const prompt = `
You are the Oracle of Scrylytics — a fantasy-themed analytical AI that describes Hearthstone card synergies insightfully and elegantly.

Given the synergy matrix below, analyze how the center card interacts with its allies, the playstyle it supports, and what archetypes it thrives in.

Center Card: ${cardName}

Synergy Data:

${synergyList}

Respond with 1–2 short paragraphs in an analytical yet mystical tone.
`

    // 3️⃣ Generate new insight
    let summary = '';
    try {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are the Oracle of Scrylytics, a Hearthstone meta analyst with mystical insight.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 180
      });

      summary = response.choices[0]?.message?.content?.trim() ?? '';
    } catch (openaiError: unknown) {
      const errorMsg = openaiError instanceof Error ? openaiError.message : String(openaiError);
      
      // Handle OpenAI API errors
      if (errorMsg.includes('429') || errorMsg.includes('quota')) {
        console.warn('OpenAI API quota exceeded, using fallback response');
        summary = `The Oracle senses ${cardName} resonates with ${links.length} synergistic connections. This card thrives in decks that value ${links[0]?.target?.id || 'strategic'} synergies, suggesting a role in ${links.length > 2 ? 'complex' : 'focused'} archetypes.`;
      } else if (errorMsg.includes('401') || errorMsg.includes('authentication')) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      } else {
        console.warn('OpenAI API error, using fallback response:', errorMsg);
        summary = `The Oracle whispers that ${cardName} forms ${links.length} key synergy${links.length > 1 ? 'ies' : ''} with other cards. This suggests a ${links.length > 2 ? 'versatile' : 'specialized'} role in the meta.`;
      }
    }

    // 4️⃣ Save to database (gracefully handle DB errors)
    try {
      if (!prisma) {
        throw new Error('Prisma client not available');
      }
      await prisma.oracleInsight.create({
        data: {
          cardName,
          summary,
          patchVersion: patchVersion ?? 'unknown'
        }
      });
    } catch (dbError) {
      console.warn('Failed to save insight to database, but returning response:', dbError);
      // Continue even if DB save fails
    }

    // Ensure we have a summary (fallback if OpenAI failed)
    if (!summary) {
      summary = `The Oracle observes ${cardName} and its ${links.length} synergy connection${links.length > 1 ? 's' : ''}. This card appears to play a role in ${links.length > 2 ? 'multiple' : 'specific'} archetypes.`;
    }

    return NextResponse.json({ summary, cached: false });
  } catch (err) {
    console.error('Oracle API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    // Return 400 for client errors (missing API key, invalid request)
    if (errorMessage.includes('OPENAI_API_KEY') || errorMessage.includes('required') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    // Return 500 for server errors
    return NextResponse.json(
      { error: 'The Oracle is silent — insight could not be retrieved.', details: errorMessage },
      { status: 500 }
    );
  }
}

