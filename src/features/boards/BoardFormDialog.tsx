'use client';

import { useRef } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { BoardFormValues } from '@/core/board/schema';

import { BoardForm, type BoardFormInitial } from './BoardForm';

/**
 * The dialog around BoardForm, for Add Board and Edit Board. The form lives
 * inside the dialog content, which unmounts on close, so every opening
 * starts from `initial`.
 *
 * `initialFocus`: the form field to focus on opening (e.g. the empty
 * column added by "+ New Column"); by default Radix focuses the first one.
 */
export function BoardFormDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  title,
  submitLabel,
  initial,
  initialFocus,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  title: string;
  submitLabel: string;
  initial: BoardFormInitial;
  initialFocus?: string | undefined;
  onSubmit: (values: BoardFormValues) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          if (initialFocus === undefined) return;
          const field = contentRef.current?.querySelector<HTMLElement>(
            `[name="${initialFocus}"]`
          );
          if (field) {
            event.preventDefault();
            field.focus();
          }
        }}
        onCloseAutoFocus={onCloseAutoFocus}
        className="sm:p-8"
      >
        <DialogTitle>{title}</DialogTitle>
        <BoardForm
          initial={initial}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
