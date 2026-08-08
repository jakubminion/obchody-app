import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Anon-key client — safe to ship in a browser bundle. Reads are scoped by
// the same RLS policies the mobile app already relies on ("public read
// published shops"/"...locations of published shops"), so this never needs
// to duplicate the `published = true` filter itself to stay safe — the
// database enforces it either way.
//
// NEXT_PUBLIC_-prefixed so it's available in both server components and
// any client component that ends up needing it — Next.js inlines these at
// build time for both bundles, unlike the unprefixed vars supabaseAdmin.ts
// uses, which only ever resolve on the server.
//
// Built lazily (not a module-level `createClient(...)` call) — apps/admin
// re-exports everything from this package's main entry for its types, and
// doesn't set NEXT_PUBLIC_SUPABASE_*; an eager client construction there
// would throw "supabaseUrl is required" at build time for a page that
// never actually calls this. Only pay the (and risk the) construction cost
// when something actually uses it.
let client: SupabaseClient | null = null;

export function supabasePublic(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
  }
  return client;
}
