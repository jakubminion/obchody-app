import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kousek — kurátorský průvodce obchody v Praze',
  description:
    'Kousek je kurátorský průvodce krásnými nezávislými obchody v Praze. Žádné uživatelské recenze ani hodnocení — jen to, co by kurátor sám doporučil.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets content extend under the iPhone notch/home-indicator area so the
  // env(safe-area-inset-*) padding used on the map's floating controls
  // (see HomeApp/ViewToggle) actually has something to react to.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2E6C2' },
    { media: '(prefers-color-scheme: dark)', color: '#252426' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="cs">
      <body className="antialiased">{children}</body>
    </html>
  );
}
