// One-off script — seeds the `watch_sources` table with the Tier-1 sources
// from the Event Watchdog brief. Safe to re-run (upserts by name).
// Run: node --env-file=.env.local scripts/seed-watch-sources.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// All type: 'website' — no per-source RSS-availability research was done;
// edit the type later from the Sources manager if a feed turns out to exist.
const SOURCES = [
  { name: 'CZECHDESIGN kalendář akcí', type: 'website', url: 'https://www.czechdesign.cz/kalendar-akci' },
  { name: 'GoOut Prague', type: 'website', url: 'https://goout.net/cs/praha/' },
  { name: 'Dyzajn market', type: 'website', url: 'https://www.dyzajnmarket.com' },
  { name: 'MINT Market Prague', type: 'website', url: 'https://www.mint-market.cz' },
  { name: 'Designblok', type: 'website', url: 'https://www.designblok.cz' },
  { name: 'LUSTR festival', type: 'website', url: 'https://www.lustrfestival.cz' },
  { name: 'Knihex', type: 'website', url: 'https://www.knihex.cz' },
  { name: 'UMPRUM events', type: 'website', url: 'https://www.umprum.cz/web/cs/akce' },
  { name: 'Holešovická tržnice', type: 'website', url: 'https://www.holesovickatrznice.cz' },
  { name: 'Vnitroblock', type: 'website', url: 'https://vnitroblock.cz' },
  { name: 'DOX', type: 'website', url: 'https://www.dox.cz' },
  { name: 'CAMP', type: 'website', url: 'https://camp.iprpraha.cz' },
  { name: 'Kunsthalle Praha', type: 'website', url: 'https://kunsthallepraha.org' },
  { name: 'Pragovka', type: 'website', url: 'https://pragovka.com' },
  { name: 'Manifesto Market', type: 'website', url: 'https://www.manifestomarket.com' },
];

// No unique constraint on `name` in the schema, so dedup here instead of
// relying on upsert-on-conflict.
const { data: existing, error: fetchError } = await supabase.from('watch_sources').select('name');
if (fetchError) throw fetchError;
const existingNames = new Set((existing ?? []).map((s) => s.name));

const toInsert = SOURCES.filter((s) => !existingNames.has(s.name)).map((s) => ({ ...s, active: true }));

if (toInsert.length === 0) {
  console.log('All sources already seeded.');
} else {
  const { error } = await supabase.from('watch_sources').insert(toInsert);
  if (error) throw error;
  console.log(`Seeded ${toInsert.length} new watch source(s) (${existingNames.size} already existed).`);
}
