import { BoardScreen } from '@/features/boards/BoardScreen';
import { getBoards } from '@/server/boards/queries';

/** Prerender every seed board, in every locale, at build time. */
export function generateStaticParams() {
  return getBoards().map((board) => ({ boardId: board.id }));
}

/**
 * Other IDs render on demand: a board created in this session exists only
 * in the browser, so the server cannot know it and must not answer 404.
 * BoardScreen decides, from the session's boards, whether it exists.
 * (`true` is the default; it is written out because the parent layout
 * must not set it to false, which child segments would inherit.)
 */
export const dynamicParams = true;

export default async function BoardPage({
  params,
}: PageProps<'/[locale]/boards/[boardId]'>) {
  const { boardId } = await params;
  return <BoardScreen boardId={boardId} />;
}
