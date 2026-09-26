import {
  addTask,
  createBoard,
  deleteBoard,
  deleteTask,
  moveTask,
  setSubtaskCompleted,
  updateBoard,
  updateTask,
  type IdFactory,
} from './operations.ts';
import type {
  Boards,
  CreateBoardInput,
  CreateTaskInput,
  DeleteBoardInput,
  DeleteTaskInput,
  MoveTaskInput,
  SetSubtaskCompletedInput,
  UpdateBoardInput,
  UpdateTaskInput,
} from './schema.ts';

/**
 * Board changes as data, applied by one reducer. The client keeps its
 * boards in `useReducer(boardsReducer, …)` (features/boards); Part B can
 * replay the same actions in `useOptimistic`.
 *
 * A reducer must be pure: React may call it twice for one dispatch (Strict
 * Mode does, on purpose, to catch impure reducers). Random IDs generated
 * inside it would differ between the two calls. So an action that creates
 * entities carries an `idSeed`, generated once by the caller before
 * dispatching, and the reducer derives every new ID from it.
 */
export type BoardsAction =
  | { type: 'createBoard'; input: CreateBoardInput; idSeed: string }
  | { type: 'updateBoard'; input: UpdateBoardInput; idSeed: string }
  | { type: 'deleteBoard'; input: DeleteBoardInput }
  | { type: 'addTask'; input: CreateTaskInput; idSeed: string }
  | { type: 'updateTask'; input: UpdateTaskInput; idSeed: string }
  | { type: 'deleteTask'; input: DeleteTaskInput }
  | { type: 'moveTask'; input: MoveTaskInput }
  | { type: 'setSubtaskCompleted'; input: SetSubtaskCompletedInput };

/**
 * A deterministic IdFactory: `seed`, then `seed-1`, `seed-2`, …
 *
 * The first ID is the seed itself. Operations give the entity they create
 * the first ID (createBoard: the board; addTask: the task), so the caller
 * knows the new entity's ID before dispatching, e.g. to navigate to it.
 * A unique seed (a UUID) makes every derived ID unique.
 */
export function seededIds(seed: string): IdFactory {
  let next = 0;
  return () => {
    const n = next++;
    return n === 0 ? seed : `${seed}-${n}`;
  };
}

export function boardsReducer(boards: Boards, action: BoardsAction): Boards {
  switch (action.type) {
    case 'createBoard':
      return createBoard(boards, action.input, seededIds(action.idSeed)).boards;
    case 'updateBoard':
      return updateBoard(boards, action.input, seededIds(action.idSeed));
    case 'deleteBoard':
      return deleteBoard(boards, action.input);
    case 'addTask':
      return addTask(boards, action.input, seededIds(action.idSeed)).boards;
    case 'updateTask':
      return updateTask(boards, action.input, seededIds(action.idSeed));
    case 'deleteTask':
      return deleteTask(boards, action.input);
    case 'moveTask':
      return moveTask(boards, action.input);
    case 'setSubtaskCompleted':
      return setSubtaskCompleted(boards, action.input);
  }
}
