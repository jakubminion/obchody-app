import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Server-only client using the service_role key — bypasses RLS. This whole
// app *is* the trusted write path for the shops/locations tables that the
// Expo app (moje-aplikace) reads from as anon/public.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
