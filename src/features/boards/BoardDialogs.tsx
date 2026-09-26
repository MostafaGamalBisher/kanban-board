'use client';

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { AddBoardDialog } from './AddBoardDialog';

/** Opens the board dialogs from anywhere in the app frame. */
export interface BoardDialogs {
  /**
   * `returnFocusTo`: where focus goes when the dialog closes, for callers
   * that disappear themselves (the mobile switcher closes as the dialog
   * opens). By default focus returns to the element that opened it.
   */
  openCreateBoard(returnFocusTo?: HTMLElement | null): void;
}

type OpenDialog = 'createBoard' | null;

const BoardDialogsContext = createContext<BoardDialogs | null>(null);

/**
 * One instance of each board dialog for the whole frame, opened from the
 * sidebar, the mobile switcher or an empty page alike. Edit and Delete
 * Board join it in nodes 5.2 and 5.3.
 */
export function BoardDialogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenDialog>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dialogs = useMemo<BoardDialogs>(
    () => ({
      openCreateBoard: (returnFocusTo) => {
        returnFocus.current = returnFocusTo ?? null;
        setOpen('createBoard');
      },
    }),
    []
  );

  return (
    <BoardDialogsContext value={dialogs}>
      {children}
      <AddBoardDialog
        open={open === 'createBoard'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'createBoard' : null)}
        onCloseAutoFocus={(event) => {
          const target = returnFocus.current;
          if (target?.isConnected) {
            event.preventDefault();
            target.focus();
          }
        }}
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
