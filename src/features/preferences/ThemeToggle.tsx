'use client';

import { IconDarkTheme, IconLightTheme } from '@/components/icons';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n/provider';

import { useTheme } from './use-theme';

/** Light ⟷ dark switch. The choice is saved in a cookie (see useTheme). */
export function ThemeToggle() {
  const { dict } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-background flex items-center justify-center gap-6 rounded-md py-3.5">
      <IconLightTheme className="text-muted-foreground" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label={dict.preferences.darkTheme}
        className="data-unchecked:bg-primary"
      />
      <IconDarkTheme className="text-muted-foreground" />
    </div>
  );
}
