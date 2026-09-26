import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

import { fontArabic, fontSans } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

/**
 * Temporary root layout. Node 3.1 moves it to app/[locale]/layout.tsx,
 * where `lang` and `dir` come from the URL.
 *
 * `dark` is hard-set: the app is dark by default. Node 3.4 reads the
 * user's theme preference from a cookie instead.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn('dark', fontSans.variable, fontArabic.variable)}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
