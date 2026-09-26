'use client';

import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n/provider';

import { useTheme } from './use-theme';

/** Light ⟷ dark switch. The choice is saved in a cookie (see useTheme). */
export function ThemeToggle() {
  const { dict } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-background flex items-center justify-center gap-6 rounded-md py-3.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
      <img src="/icons/icon-light-theme.svg" alt="" width={19} height={19} />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label={dict.preferences.darkTheme}
        className="data-unchecked:bg-primary"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
      <img src="/icons/icon-dark-theme.svg" alt="" width={16} height={16} />
    </div>
  );
}
