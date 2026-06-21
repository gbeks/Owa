import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

export async function logSearch(origin: string, destination: string, resultFound: boolean): Promise<void> {
  try {
    await getSupabase().from('search_logs').insert({
      origin,
      destination,
      result_found: resultFound,
    });
  } catch {
    // Non-blocking — route display must work even if logging fails
  }
}

export type ContributionType = 'correction' | 'new_route';

export async function submitContribution(payload: {
  type: ContributionType;
  route_id?: string;
  origin?: string;
  destination?: string;
  description: string;
  submitter_contact?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await getSupabase().from('route_submissions').insert(payload);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
