// Meta Analysis API for Scrylytics
// Provides tournament data and meta trend analysis

import { getMetaAnalysis } from '../../../lib/meta/analyzer.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'hearthstone';
    const format = searchParams.get('format') || 'standard';

    const metaData = getMetaAnalysis(game, format);

    if (metaData.error) {
      return Response.json(metaData, { status: 404 });
    }

    return Response.json(metaData);
  } catch (error) {
    console.error('Meta API error:', error);
    return Response.json({ error: 'Failed to retrieve meta data' }, { status: 500 });
  }
}
