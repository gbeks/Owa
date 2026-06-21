import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/search';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const rawLimit = searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(rawLimit ?? '8', 10) || 8, 1), 20);

  if (q.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters', code: 'QUERY_TOO_SHORT' },
      { status: 400 }
    );
  }

  const results = searchLocations(q, limit);

  if (results.length === 0) {
    console.log(JSON.stringify({ event: 'zero_result_search', query: q }));
  }

  return NextResponse.json(
    { results, query: q, total: results.length },
    {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' },
    }
  );
}
