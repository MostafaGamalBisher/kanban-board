import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from 'next/font/google';

/**
 * Fonts are self-hosted by next/font at build time: no runtime request to
 * Google, no layout shift. Each font is exposed as a CSS variable and wired
 * into Tailwind in globals.css.
 */

/** Latin UI font, from the challenge's style guide. Variable font. */
export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

/**
 * Arabic glyphs. Plus Jakarta Sans has none, so the shared font stack in
 * globals.css falls through to this font for Arabic characters only.
 * Not preloaded: it is fetched only when Arabic text is on the page.
 */
export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['500', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
  preload: false,
});
