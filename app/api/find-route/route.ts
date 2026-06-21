import { NextRequest, NextResponse } from 'next/server';
import { findRoute } from '@/lib/routes';
import { logSearch } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.trim();
  const to = searchParams.get('to')?.trim();

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const route = findRoute(from, to);
  void logSearch(from, to, route !== null);

  if (!route) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  return NextResponse.json({ route });
}
