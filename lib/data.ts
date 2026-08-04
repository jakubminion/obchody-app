import 'server-only';
import { supabaseAdmin } from './supabase';
import { mapShopRow } from './mapRow';
import type { Shop } from './types';

export async function getShops(): Promise<Shop[]> {
  const { data, error } = await supabaseAdmin
    .from('shops')
    .select('*, locations(*)')
    .order('name');
  if (error) throw error;
  return (data ?? []).map(mapShopRow);
}

export async function getShop(id: string): Promise<Shop | null> {
  const { data, error } = await supabaseAdmin
    .from('shops')
    .select('*, locations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapShopRow(data) : null;
}
