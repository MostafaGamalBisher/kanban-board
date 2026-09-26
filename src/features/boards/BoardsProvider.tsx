'use client';

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { boardsReducer } from '@/core/board/actions';
import {
  BoardIdSchema,
  TaskIdSchema,
  type BoardId,
  type TaskId,
} from '@/core/board/ids';
import type {
  Board,
  Boards,
  CreateBoardInput,
  CreateTaskInput,
  DeleteBoardInput,
  DeleteTaskInput,
  MoveTaskInput,
  SetSubtaskCompletedInput,
  UpdateBoardInput,
  UpdateTaskInput,
} from '@/core/board/schema';
import { createId } from '@/lib/ids';

/** Every board change the UI can make. Stable across renders. */
export interface BoardActions {
  /** Returns the new board's ID, e.g. to navigate to it. */
  createBoard(input: CreateBoardInput): BoardId;
  updateBoard(input: UpdateBoardInput): void;
  deleteBoard(input: DeleteBoardInput): void;
  /** Returns the new task's ID. */
  addTask(input: CreateTaskInput): TaskId;
  updateTask(input: UpdateTaskInput): void;
  deleteTask(input: DeleteTaskInput): void;
  moveTask(input: MoveTaskInput): void;
  setSubtaskCompleted(input: SetSubtaskCompletedInput): void;
}

const BoardsContext = createContext<Boards | null>(null);
const BoardActionsContext = createContext<BoardActions | null>(null);

/**
 * Holds the boards for the session, seeded from the server's data by the
 * [locale] layout. Changes go through the pure reducer in core/; IDs are
 * generated here, before dispatching, so the reducer stays pure.
 *
 * State and actions are separate contexts: a component that only changes
 * boards (a button) does not re-render when the boards change.
 *
 * The state lives as long as the [locale] layout: it survives navigation
 * between boards and resets on a language switch or a reload (Part B
 * moves it to the server).
 */
export function BoardsProvider({
  initialBoards,
  children,
}: {
  initialBoards: Boards;
  children: ReactNode;
}) {
  const [boards, dispatch] = useReducer(boardsReducer, initialBoards);

  const actions = useMemo<BoardActions>(
    () => ({
      createBoard(input) {
        const idSeed = createId();
        dispatch({ type: 'createBoard', input, idSeed });
        // The seed is the new board's ID (see seededIds in core/).
        return BoardIdSchema.parse(idSeed);
      },
      updateBoard(input) {
        dispatch({ type: 'updateBoard', input, idSeed: createId() });
      },
      deleteBoard(input) {
        dispatch({ type: 'deleteBoard', input });
      },
      addTask(input) {
        const idSeed = createId();
        dispatch({ type: 'addTask', input, idSeed });
        return TaskIdSchema.parse(idSeed);
      },
      updateTask(input) {
        dispatch({ type: 'updateTask', input, idSeed: createId() });
      },
      deleteTask(input) {
        dispatch({ type: 'deleteTask', input });
      },
      moveTask(input) {
        dispatch({ type: 'moveTask', input });
      },
      setSubtaskCompleted(input) {
        dispatch({ type: 'setSubtaskCompleted', input });
      },
    }),
    []
  );

  return (
    <BoardsContext value={boards}>
      <BoardActionsContext value={actions}>{children}</BoardActionsContext>
    </BoardsContext>
  );
}

/** All boards, in display order. */
export function useBoards(): Boards {
  const boards = useContext(BoardsContext);
  if (!boards) {
    throw new Error('useBoards() must be used inside <BoardsProvider>.');
  }
  return boards;
}

/**
 * One board, or `undefined` if no board has this ID (a mistyped URL, or a
 * board deleted in this session). Takes the raw URL segment.
 */
export function useBoard(id: string): Board | undefined {
  return useBoards().find((board) => board.id === id);
}

export function useBoardActions(): BoardActions {
  const actions = useContext(BoardActionsContext);
  if (!actions) {
    throw new Error('useBoardActions() must be used inside <BoardsProvider>.');
  }
  return actions;
}
