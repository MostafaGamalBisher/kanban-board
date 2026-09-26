'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LOCALE_COOKIE, LOCALES, type Locale } from '@/config/i18n';
import { useSessionChanges } from '@/features/boards/BoardsProvider';
import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';

import { writePreferenceCookie } from './cookies';

/** "العربية", "English": each language named in itself, by the browser. */
const nativeName = (locale: Locale) =>
  new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;

/**
 * Links to the same page in the other language(s), and remembers the choice
 * in the locale cookie so that `/` opens in it next time. The URL is the
 * source of truth; the cookie is only a preference.
 *
 * Until Part B, each language is a separate instance of the app's state:
 * switching discards this session's changes. So:
 * - with changes, the switch asks for confirmation first;
 * - on a board created in this session (which will not exist after the
 *   switch), it lands on the first board instead of a "not found" page.
 */
export function LanguageSwitcher() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { boardId } = useParams<{ boardId?: string }>();
  const { hasChanges, isSeedBoard } = useSessionChanges();
  const [pending, setPending] = useState<Locale | null>(null);

  const hrefFor = (target: Locale) =>
    boardId !== undefined && !isSeedBoard(boardId)
      ? routes.home(target)
      : `/${target}${pathname.slice(`/${locale}`.length)}`;

  const switchTo = (target: Locale) => {
    writePreferenceCookie(LOCALE_COOKIE, target);
    router.push(hrefFor(target));
  };

  return (
    <>
      <nav className="flex gap-2">
        {LOCALES.filter((target) => target !== locale).map((target) => (
          <Link
            key={target}
            href={hrefFor(target)}
            hrefLang={target}
            lang={target}
            onClick={(event) => {
              if (hasChanges) {
                event.preventDefault();
                setPending(target);
              } else {
                writePreferenceCookie(LOCALE_COOKIE, target);
              }
            }}
            className="text-body-l text-primary-text hover:bg-secondary hover:text-primary touch-target rounded-full px-4 py-2 font-bold"
          >
            {nativeName(target)}
          </Link>
        ))}
      </nav>
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dict.preferences.switchLanguageTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dict.preferences.switchLanguageBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              variant="destructive"
              onClick={() => pending && switchTo(pending)}
            >
              {dict.preferences.switchLanguageConfirm}
            </AlertDialogAction>
            <AlertDialogCancel variant="secondary">
              {dict.common.cancel}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
