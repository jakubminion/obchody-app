import { notFound } from 'next/navigation';
import { getShop } from '@/lib/data';
import { ShopEditor } from '../ShopEditor';

export default async function EditShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shop = await getShop(id);
  if (!shop) notFound();
  return <ShopEditor shop={shop} />;
}
