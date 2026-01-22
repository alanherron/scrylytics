import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getHearthstoneMeta } from '@/lib/services/hearthstoneMeta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const format = searchParams.get('format') ?? undefined;
    const region = searchParams.get('region') ?? undefined;
    const rankRange =
      searchParams.get('rankRange') ?? searchParams.get('rank_range') ?? undefined;
    const timeRange =
      searchParams.get('timeRange') ?? searchParams.get('time_range') ?? undefined;
    const locale =
      searchParams.get('locale') ??
      searchParams.get('lang') ??
      searchParams.get('language') ??
      undefined;

    const meta = await getHearthstoneMeta({
      format: format ?? undefined,
      region: region ?? undefined,
      rankRange: rankRange ?? undefined,
      timeRange: timeRange ?? undefined,
      locale: locale ?? undefined,
    });

    return NextResponse.json(meta);
  } catch (error) {
    console.error('Meta API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve meta data' },
      { status: 500 },
    );
  }
}
