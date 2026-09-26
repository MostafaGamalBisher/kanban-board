import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { siteConfig } from '@/config/site';

import { fontArabic, fontSans } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

/**
 * Temporary root layout. Node 3.1 moves it to app/[locale]/layout.tsx,
 * where `lang` and `dir` come from the URL.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontArabic.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
