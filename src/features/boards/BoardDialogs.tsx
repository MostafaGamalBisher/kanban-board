'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { BoardId } from '@/core/board/ids';
import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';

import { BoardFormDialog } from './BoardFormDialog';
import { useBoard, useBoardActions } from './BoardsProvider';

/**
 * Opens the board dialogs from anywhere in the app frame.
 *
 * `returnFocusTo`: where focus goes when the dialog closes, for callers
 * that disappear themselves (the mobile switcher and the board menu close
 * as the dialog opens). By default focus returns to the element that was
 * focused when the dialog opened. (Radix only restores focus to its own
 * Trigger, and these dialogs are opened from code.)
 */
export interface BoardDialogs {
  openCreateBoard(returnFocusTo?: HTMLElement | null): void;
  /** `addColumn`: start with a new, focused, empty column ("+ New Column"). */
  openEditBoard(
    boardId: BoardId,
    options?: { addColumn?: boolean; returnFocusTo?: HTMLElement | null }
  ): void;
}

type OpenDialog =
  | { type: 'createBoard' }
  | { type: 'editBoard'; boardId: BoardId; addColumn: boolean }
  | null;

const BoardDialogsContext = createContext<BoardDialogs | null>(null);

/**
 * One instance of each board dialog for the whole frame, opened from the
 * sidebar, the mobile switcher, the header menu or the board itself.
 * Delete Board joins it in node 5.3.
 */
export function BoardDialogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenDialog>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dialogs = useMemo<BoardDialogs>(() => {
    const rememberFocus = (target: HTMLElement | null | undefined) => {
      returnFocus.current =
        target ??
        (document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null);
    };
    return {
      openCreateBoard: (returnFocusTo) => {
        rememberFocus(returnFocusTo);
        setOpen({ type: 'createBoard' });
      },
      openEditBoard: (boardId, options) => {
        rememberFocus(options?.returnFocusTo);
        setOpen({
          type: 'editBoard',
          boardId,
          addColumn: options?.addColumn ?? false,
        });
      },
    };
  }, []);

  const close = (isOpen: boolean) => !isOpen && setOpen(null);
  const restoreFocus = (event: Event) => {
    const target = returnFocus.current;
    if (target?.isConnected) {
      event.preventDefault();
      target.focus();
    }
  };

  return (
    <BoardDialogsContext value={dialogs}>
      {children}
      <CreateBoardDialog
        open={open?.type === 'createBoard'}
        onOpenChange={close}
        onCloseAutoFocus={restoreFocus}
      />
      <EditBoardDialog
        boardId={open?.type === 'editBoard' ? open.boardId : undefined}
        addColumn={open?.type === 'editBoard' && open.addColumn}
        onOpenChange={close}
        onCloseAutoFocus={restoreFocus}
      />
    </BoardDialogsContext>
  );
}

export function useBoardDialogs(): BoardDialogs {
  const dialogs = useContext(BoardDialogsContext);
  if (!dialogs) {
    throw new Error(
      'useBoardDialogs() must be used inside <BoardDialogsProvider>.'
    );
  }
  return dialogs;
}

interface DialogProps {
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}

/**
 * Add New Board, prefilled with the brief's two default columns (in the
 * interface language). On success the new board opens.
 */
function CreateBoardDialog({
  open,
  ...props
}: DialogProps & { open: boolean }) {
  const { dict, locale } = useI18n();
  const { createBoard } = useBoardActions();
  const router = useRouter();

  return (
    <BoardFormDialog
      {...props}
      open={open}
      title={dict.board.addBoardTitle}
      submitLabel={dict.board.createBoardSubmit}
      initial={{
        name: '',
        columns: dict.board.defaultColumns.map((name) => ({ name })),
      }}
      onSubmit={(values) => {
        const id = createBoard({
          name: values.name,
          columns: values.columns.map(({ name }) => ({ name })),
        });
        props.onOpenChange(false);
        router.push(routes.board(locale, id));
      }}
    />
  );
}

/**
 * Edit Board: rename the board; add, rename or remove columns. Removing a
 * column removes its tasks (updateBoard in core/).
 */
function EditBoardDialog({
  boardId,
  addColumn,
  ...props
}: DialogProps & { boardId: BoardId | undefined; addColumn: boolean }) {
  const { dict } = useI18n();
  const { updateBoard } = useBoardActions();
  const board = useBoard(boardId);

  const columns = board
    ? board.columns.map(({ id, name }) => ({ id, name }))
    : [];

  return (
    <BoardFormDialog
      {...props}
      open={board !== undefined}
      title={dict.board.edit}
      submitLabel={dict.common.save}
      initial={{
        name: board?.name ?? '',
        columns: addColumn ? [...columns, { name: '' }] : columns,
      }}
      initialFocus={addColumn ? `columns.${columns.length}.name` : undefined}
      onSubmit={(values) => {
        if (!board) return;
        updateBoard({ boardId: board.id, ...values });
        props.onOpenChange(false);
      }}
    />
  );
}
