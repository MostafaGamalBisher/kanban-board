import { InvalidDataError } from '../errors.ts';
import { BoardsSchema, type Boards } from './schema.ts';

/**
 * Validates untyped data (e.g. parsed JSON) as a list of boards.
 * Returns branded, trimmed, frozen boards, or throws InvalidDataError
 * naming `source` and every problem found.
 */
export function parseBoards(data: unknown, source: string): Boards {
  const result = BoardsSchema.safeParse(data);
  if (!result.success) {
    throw new InvalidDataError(source, result.error.issues);
  }
  return result.data;
}
