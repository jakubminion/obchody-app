'use client';

import type { PrimaryCategory } from '@kousek/db';
import { PRIMARY_CATEGORIES, PRIMARY_CATEGORY_ORDER } from '../lib/primaryCategories';

interface Props {
  selected: PrimaryCategory[];
  onToggle: (category: PrimaryCategory) => void;
  onClear: () => void;
}

// Ported from moje-aplikace/src/components/CategoryFilterChips.tsx (the
// favorites chip is dropped — favorites aren't part of this web pass yet).
export function CategoryFilterChips({ selected, onToggle, onClear }: Props) {
  const allActive = selected.length === 0;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
      <Chip label="Vše" active={allActive} onClick={onClear} />
      {PRIMARY_CATEGORY_ORDER.map((category) => (
        <Chip
          key={category}
          label={PRIMARY_CATEGORIES[category].label}
          color={PRIMARY_CATEGORIES[category].color}
          active={selected.includes(category)}
          onClick={() => onToggle(category)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 whitespace-nowrap rounded-full border border-border px-3.5 py-2 text-[13px] font-medium text-ink-secondary"
      style={active ? { backgroundColor: color ?? 'var(--ink)', borderColor: color ?? 'var(--ink)', color: 'var(--surface)' } : undefined}
    >
      {label}
    </button>
  );
}
