// Separate entry point from the main package export on purpose — see the
// comment in index.ts. Only apps/admin (the trusted write path) imports
// from '@kousek/db/admin'.
export { supabaseAdmin } from './supabaseAdmin';
