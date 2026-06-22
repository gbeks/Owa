import { NextRequest, NextResponse } from 'next/server';
import { findAllRoutes, getLocation } from '@/lib/routes';
import { logSearch } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.trim();
  const to = searchParams.get('to')?.trim();

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const toLocation = getLocation(to);

  if (toLocation?.children && toLocation.children.length > 0) {
    const items = toLocation.children.map((childId) => {
      const childLoc = getLocation(childId);
      return {
        destination_id: childId,
        destination_label: childLoc?.canonical_name ?? childId,
        routes: findAllRoutes(from, childId),
      };
    });

    const anyFound = items.some((i) => i.routes.length > 0);
    void logSearch(from, to, anyFound);

    return NextResponse.json({
      expanded: true,
      parent_label: toLocation.canonical_name,
      items,
    });
  }

  const routes = findAllRoutes(from, to);
  void logSearch(from, to, routes.length > 0);

  if (routes.length === 0) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  return NextResponse.json({ routes });
}
