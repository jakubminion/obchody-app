import Image from 'next/image';

interface Props {
  photos: string[];
}

// Simplified port of moje-aplikace/src/components/PhotoGallery.tsx — a
// horizontally scrollable strip (native swipe-scroll is the direct web
// equivalent of the RN version's paged ScrollView, no extra library).
export function PhotoGallery({ photos }: Props) {
  if (photos.length === 0) return null;

  return (
    <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto">
      {photos.map((url, i) => (
        <div key={url} className="relative aspect-[4/3] w-full shrink-0 snap-start bg-border">
          <Image
            src={url}
            alt=""
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
