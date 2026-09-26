'use client';

import { useRouter } from 'next/navigation';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';

import { BoardForm } from './BoardForm';
import { useBoardActions } from './BoardsProvider';

/**
 * Add New Board: the shared form, prefilled with the brief's two default
 * columns (in the interface language). On success the new board opens.
 * The form lives inside the dialog content, which unmounts on close, so
 * every opening starts from a fresh form.
 */
export function AddBoardDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const { dict, locale } = useI18n();
  const { createBoard } = useBoardActions();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onCloseAutoFocus={onCloseAutoFocus}
        className="sm:p-8"
      >
        <DialogTitle>{dict.board.addBoardTitle}</DialogTitle>
        <BoardForm
          initial={{
            name: '',
            columns: dict.board.defaultColumns.map((name) => ({ name })),
          }}
          submitLabel={dict.board.createBoardSubmit}
          onSubmit={(values) => {
            const id = createBoard({
              name: values.name,
              columns: values.columns.map(({ name }) => ({ name })),
            });
            onOpenChange(false);
            router.push(routes.board(locale, id));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
