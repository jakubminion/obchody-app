'use client';

import { useTransition } from 'react';
import { unpublishShop } from '@/app/actions';

export function UnpublishButton({ shopId, shopName }: { shopId: string; shopName: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Skrýt „${shopName}“ před beta testery?`)) return;
    startTransition(async () => {
      await unpublishShop(shopId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-neutral-400 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? 'Skrývám…' : 'Skrýt'}
    </button>
  );
}
