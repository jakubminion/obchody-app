import 'server-only';
import { supabaseAdmin } from '@kousek/db/admin';
import { mapShopRow, type Shop } from '@kousek/db';

export async function getShops(): Promise<Shop[]> {
  const { data, error } = await supabaseAdmin()
    .from('shops')
    .select('*, locations(*)')
    .order('name');
  if (error) throw error;
  return (data ?? []).map(mapShopRow);
}

// Seed photos are all picsum.photos placeholders — anything else uploaded
// through the photo manager is a real photo.
export function hasRealPhotos(photos: string[]): boolean {
  return photos.length > 0 && photos.every((url) => !url.includes('picsum.photos'));
}

export async function getShop(id: string): Promise<Shop | null> {
  const { data, error } = await supabaseAdmin()
    .from('shops')
    .select('*, locations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapShopRow(data) : null;
}
