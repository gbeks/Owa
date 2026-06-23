import { NextResponse } from 'next/server';
import { submitContribution } from '@/lib/supabase';

export async function POST(req: Request) {
  // Parse JSON first — isolated so a bad body returns 400, not a swallowed Supabase error
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  console.log('[/api/contribute] received body:', JSON.stringify(body, null, 2));

  const { type, route_id, origin, destination, description, submitter_contact, legs } = body as Record<string, unknown>;

  // Validate type
  if (!type || !['correction', 'new_route'].includes(type as string)) {
    const msg = `Invalid type: "${type}". Must be "correction" or "new_route".`;
    console.warn('[/api/contribute]', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Validate description
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    const msg = `Description is too short (${description?.trim().length ?? 0} chars). Minimum 10 characters.`;
    console.warn('[/api/contribute]', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // new_route requires origin + destination
  if (type === 'new_route' && (!origin || !destination)) {
    const msg = `Origin and destination are required for new route submissions (got origin="${origin}", destination="${destination}").`;
    console.warn('[/api/contribute]', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Submit to Supabase
  let result: { success: boolean; error?: string };
  try {
    result = await submitContribution({
      type: type as 'correction' | 'new_route',
      route_id: route_id as string | undefined,
      origin: origin as string | undefined,
      destination: destination as string | undefined,
      description: (description as string).trim(),
      legs: legs as object[] | undefined,
      submitter_contact: submitter_contact as string | undefined,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[/api/contribute] submitContribution threw:', msg);
    return NextResponse.json({ error: `Database error: ${msg}` }, { status: 500 });
  }

  if (!result.success) {
    console.error('[/api/contribute] submitContribution returned failure:', result.error);
    return NextResponse.json({ error: result.error ?? 'Failed to save submission.' }, { status: 500 });
  }

  console.log('[/api/contribute] submission saved successfully');
  return NextResponse.json({ success: true });
}
