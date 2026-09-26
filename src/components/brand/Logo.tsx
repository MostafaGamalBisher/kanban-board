import { siteConfig } from '@/config/site';

import { LogoMark } from './LogoMark';

/**
 * The mark, plus the wordmark from 768px up (the brief's mobile header
 * shows the mark alone). A brand lockup is not mirrored in Arabic, so its
 * inner order is fixed left-to-right; its place in the header still
 * follows the page direction.
 */
export function Logo() {
  return (
    <div dir="ltr" className="flex items-center gap-4">
      <LogoMark />
      <span className="text-logo hidden lowercase md:inline">
        {siteConfig.name}
      </span>
    </div>
  );
}
