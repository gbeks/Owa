import { NextRequest, NextResponse } from 'next/server';
import { findRoute } from '@/lib/routes';
import { formatLegProseWithTimeout } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.trim();
  const to = searchParams.get('to')?.trim();

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Both from and to parameters are required', code: 'MISSING_PARAMS' },
      { status: 400 }
    );
  }

  if (from === to) {
    return NextResponse.json(
      { error: 'Origin and destination cannot be the same', code: 'SAME_LOCATION' },
      { status: 400 }
    );
  }

  const route = findRoute(from, to);

  if (!route) {
    return NextResponse.json(
      {
        error: 'No route found between these locations',
        code: 'ROUTE_NOT_FOUND',
        suggestion: 'Try searching for a nearby landmark or area instead',
      },
      { status: 404 }
    );
  }

  let aiFormatted = true;

  const legsWithProse = await Promise.all(
    route.legs.map(async (leg) => {
      try {
        const formatted_prose = await formatLegProseWithTimeout(leg);
        return { ...leg, formatted_prose };
      } catch {
        aiFormatted = false;
        return { ...leg, formatted_prose: leg.board_instruction };
      }
    })
  );

  const body: Record<string, unknown> = {
    route: { ...route, legs: legsWithProse },
    ai_formatted: aiFormatted,
  };
  if (!aiFormatted) {
    body.fallback_notice = 'Showing simplified directions. Prose formatting temporarily unavailable.';
  }

  return NextResponse.json(body);
}
