'use client';

import { useRef, type ReactNode } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

/**
 * The dialog around a form (Add/Edit Board, Add/Edit Task). The form is a
 * child of the dialog content, which unmounts on close, so every opening
 * starts from the form's initial values.
 *
 * `initialFocus`: the `name` of the field to focus on opening (e.g. the
 * empty column added by "+ New Column"); by default Radix focuses the
 * first field.
 */
export function FormDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  title,
  initialFocus,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  title: string;
  initialFocus?: string | undefined;
  children: ReactNode;
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
        {children}
      </DialogContent>
    </Dialog>
  );
}
