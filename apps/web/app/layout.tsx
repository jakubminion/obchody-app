import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kousek — kurátorský průvodce obchody v Praze',
  description:
    'Kousek je kurátorský průvodce krásnými nezávislými obchody v Praze. Žádné uživatelské recenze ani hodnocení — jen to, co by kurátor sám doporučil.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="cs">
      <body className="antialiased">{children}</body>
    </html>
  );
}
