import 'server-only';
import { supabaseAdmin } from '@kousek/db/admin';

export async function uploadToBucket(bucket: string, path: string, buffer: Buffer, contentType: string): Promise<string> {
  const { error } = await supabaseAdmin().storage.from(bucket).upload(path, buffer, { contentType, upsert: true });
  if (error) throw error;
  const { data } = supabaseAdmin().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function extFromMime(mime: string): string {
  if (mime.includes('svg')) return 'svg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  return 'png';
}
