import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';
import { correctionSchema } from '@/lib/validation';
import { findRouteById } from '@/lib/routes';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = correctionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', code: 'INVALID_BODY', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { route_id, leg_id, issue_type, description } = parsed.data;

    const route = findRouteById(route_id);
    if (!route) {
      return NextResponse.json(
        { error: 'Route not found', code: 'INVALID_ROUTE_ID' },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const ipHash = createHash('sha256').update(ip).digest('hex');

    const allowed = checkRateLimit(ipHash, 3, 3600);
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many submissions. Please wait before submitting again.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from('corrections')
      .insert({
        route_id,
        leg_id: leg_id ?? null,
        issue_type,
        description: description ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
        ip_hash: ipHash,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[corrections] Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Could not save correction. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for the correction. We'll review and update this route.",
        correction_id: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[corrections] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
