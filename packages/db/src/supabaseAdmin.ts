import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-only client using the service_role key — bypasses RLS. Admin-only:
// this whole app is the trusted write path for the shops/locations tables
// that the public site and mobile app read from as anon/public.
//
// Built lazily for the same reason as supabasePublic() in the sibling
// file — importing this module for its types shouldn't require the
// service-role env vars to already be set.
let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}
