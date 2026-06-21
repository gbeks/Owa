import { NextResponse } from 'next/server';
import { submitContribution } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, route_id, origin, destination, description, submitter_contact } = body;

    if (!type || !['correction', 'new_route'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type.' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters.' }, { status: 400 });
    }
    if (type === 'new_route' && (!origin || !destination)) {
      return NextResponse.json({ error: 'Origin and destination are required for new routes.' }, { status: 400 });
    }

    const result = await submitContribution({
      type,
      route_id,
      origin,
      destination,
      description: description.trim(),
      submitter_contact,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Failed to save submission.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
