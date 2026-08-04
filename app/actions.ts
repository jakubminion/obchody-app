'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { processLogotype } from '@/lib/processLogotype';
import type { Category, Location, PrimaryCategory, WeekdayHours } from '@/lib/types';

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface ShopFormFields {
  name: string;
  primaryCategory: PrimaryCategory;
  tags: Category[];
  keywordDescription: string;
  curatorNote: string | null;
  giftPriceMin: number | null;
  giftPriceMax: number | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  published: boolean;
}

export async function saveShop(id: string, fields: ShopFormFields): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin
    .from('shops')
    .update({
      name: fields.name,
      primary_category: fields.primaryCategory,
      tags: fields.tags,
      keyword_description: fields.keywordDescription,
      curator_note: fields.curatorNote,
      gift_price_min: fields.giftPriceMin,
      gift_price_max: fields.giftPriceMax,
      website_url: fields.websiteUrl,
      instagram_url: fields.instagramUrl,
      published: fields.published,
    })
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  revalidatePath(`/shops/${id}`);
}

export async function createShop(fields: ShopFormFields): Promise<never> {
  await requireAuth();
  let id = slugify(fields.name);
  if (!id) throw new Error('Zadejte prosím název obchodu.');

  const { data: existing } = await supabaseAdmin.from('shops').select('id').eq('id', id).maybeSingle();
  if (existing) {
    id = `${id}-${Date.now().toString(36)}`;
  }

  const { error: shopError } = await supabaseAdmin.from('shops').insert({
    id,
    slug: id,
    name: fields.name,
    primary_category: fields.primaryCategory,
    tags: fields.tags,
    keyword_description: fields.keywordDescription,
    curator_note: fields.curatorNote,
    gift_price_min: fields.giftPriceMin,
    gift_price_max: fields.giftPriceMax,
    website_url: fields.websiteUrl,
    instagram_url: fields.instagramUrl,
    published: fields.published,
    photos: [],
  });
  if (shopError) throw shopError;

  const { error: locationError } = await supabaseAdmin.from('locations').insert({
    id: `${id}-main`,
    shop_id: id,
    label: null,
    address: '',
    lat: 50.0755,
    lng: 14.4378,
    city: 'Praha',
    hours_unverified: true,
    opening_hours: null,
  });
  if (locationError) throw locationError;

  revalidatePath('/');
  redirect(`/shops/${id}`);
}

export async function deleteShop(id: string): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin.from('shops').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  redirect('/');
}

async function uploadToBucket(bucket: string, path: string, buffer: Buffer, contentType: string): Promise<string> {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, { contentType, upsert: true });
  if (error) throw error;
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function extFromMime(mime: string): string {
  if (mime.includes('svg')) return 'svg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  return 'png';
}

export async function uploadLogo(shopId: string, file: File): Promise<string> {
  await requireAuth();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extFromMime(file.type);
  const url = await uploadToBucket('logos', `${shopId}.${ext}`, buffer, file.type || 'image/png');
  const { error } = await supabaseAdmin.from('shops').update({ logo_url: url }).eq('id', shopId);
  if (error) throw error;
  revalidatePath(`/shops/${shopId}`);
  return url;
}

export interface UploadLogotypeResult {
  url: string;
  recolored: boolean;
  strippedBg: boolean;
  uncertainBg: boolean;
}

export async function uploadLogotype(shopId: string, file: File): Promise<UploadLogotypeResult> {
  await requireAuth();
  const input = Buffer.from(await file.arrayBuffer());
  const { buffer, recolored, strippedBg, uncertainBg } = await processLogotype(input);
  const url = await uploadToBucket('logotypes', `${shopId}.png`, buffer, 'image/png');
  const { error } = await supabaseAdmin.from('shops').update({ logotype_url: url }).eq('id', shopId);
  if (error) throw error;
  revalidatePath(`/shops/${shopId}`);
  return { url, recolored, strippedBg, uncertainBg };
}

export async function uploadPhoto(shopId: string, file: File, currentPhotos: string[]): Promise<void> {
  await requireAuth();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extFromMime(file.type);
  const path = `${shopId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const url = await uploadToBucket('photos', path, buffer, file.type || 'image/jpeg');
  const { error } = await supabaseAdmin
    .from('shops')
    .update({ photos: [...currentPhotos, url] })
    .eq('id', shopId);
  if (error) throw error;
  revalidatePath(`/shops/${shopId}`);
}

export async function removePhoto(shopId: string, photoUrl: string, currentPhotos: string[]): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin
    .from('shops')
    .update({ photos: currentPhotos.filter((p) => p !== photoUrl) })
    .eq('id', shopId);
  if (error) throw error;
  revalidatePath(`/shops/${shopId}`);
}

export interface LocationFormFields {
  label: string | null;
  address: string;
  lat: number;
  lng: number;
  city: string;
  googlePlaceId: string | null;
  hoursUnverified: boolean;
  openingHours: WeekdayHours[] | null;
}

export async function saveLocation(locationId: string, fields: LocationFormFields, shopId: string): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin
    .from('locations')
    .update({
      label: fields.label,
      address: fields.address,
      lat: fields.lat,
      lng: fields.lng,
      city: fields.city,
      google_place_id: fields.googlePlaceId,
      hours_unverified: fields.hoursUnverified,
      opening_hours: fields.openingHours,
    })
    .eq('id', locationId);
  if (error) throw error;
  revalidatePath(`/shops/${shopId}`);
}

export async function addLocation(shopId: string): Promise<Location> {
  await requireAuth();
  const id = `${shopId}-${Date.now().toString(36)}`;
  const { data, error } = await supabaseAdmin
    .from('locations')
    .insert({
      id,
      shop_id: shopId,
      label: null,
      address: '',
      lat: 50.0755,
      lng: 14.4378,
      city: 'Praha',
      hours_unverified: true,
      opening_hours: null,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath(`/shops/${shopId}`);
  return {
    id: data.id,
    label: data.label,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    googlePlaceId: data.google_place_id,
    openingHours: data.opening_hours,
    hoursUnverified: data.hours_unverified,
    city: data.city,
  };
}

export async function deleteLocation(locationId: string, shopId: string): Promise<void> {
  await requireAuth();
  const { count } = await supabaseAdmin
    .from('locations')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', shopId);
  if ((count ?? 0) <= 1) {
    throw new Error('Obchod musí mít alespoň jednu pobočku.');
  }
  const { error } = await supabaseAdmin.from('locations').delete().eq('id', locationId);
  if (error) throw error;
  revalidatePath(`/shops/${shopId}`);
}
