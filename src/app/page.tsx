import { siteConfig } from '@/config/site';

/** Icons carried over from the Vite app, now served from /public/icons. */
const ICONS = [
  'icon-add-task-mobile',
  'icon-board',
  'icon-check',
  'icon-chevron-down',
  'icon-chevron-up',
  'icon-cross',
  'icon-dark-theme',
  'icon-hide-sidebar',
  'icon-light-theme',
  'icon-show-sidebar',
  'icon-vertical-ellipsis',
] as const;

/**
 * Scaffold placeholder for node 1.1. It proves three things: the app
 * renders, the font loads, and the static icons resolve. Replaced by
 * the real board route in Phase 4.
 */
export default function PlaceholderPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-2xl font-bold">{siteConfig.name}</h1>
      <ul className="flex flex-wrap justify-center gap-6">
        {ICONS.map((name) => (
          <li key={name}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVGs; next/image adds nothing here */}
            <img src={`/icons/${name}.svg`} alt="" width={24} height={24} />
          </li>
        ))}
      </ul>
    </main>
  );
}
