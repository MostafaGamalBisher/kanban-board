'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';

/** A message and a way back to the boards. Used for unknown pages and boards. */
export function NotFoundView({ message }: { message: string }) {
  const { locale, dict } = useI18n();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      <p className="text-heading-l text-muted-foreground max-w-md">{message}</p>
      <Button asChild size="lg">
        <Link href={routes.home(locale)}>{dict.common.goHome}</Link>
      </Button>
    </main>
  );
}
