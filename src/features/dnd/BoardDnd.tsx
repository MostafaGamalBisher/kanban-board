'use client';

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDndContext,
  useSensor,
  useSensors,
  type Active,
  type Announcements,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  type Over,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useId, useState, type ComponentProps, type ReactNode } from 'react';

import {
  dropPosition,
  previewMove,
  type DropPosition,
  type DropTarget,
} from '@/core/board/drag';
import type { Board } from '@/core/board/schema';
import { findTask } from '@/core/board/selectors';
import { useBoardActions } from '@/features/boards/BoardsProvider';
import { TaskCard } from '@/features/tasks/TaskCard';
import { useI18n } from '@/i18n/provider';

/** What a draggable or droppable carries, so any `over` target names its column. */
export interface DndData {
  readonly type: 'task' | 'column';
  readonly columnId: string;
}

/**
 * Drag and drop for one board's tasks.
 *
 * - `id` comes from React's useId(), which is the same on the server and in
 *   the browser; dnd-kit's own ID counter is not, and its IDs end up in
 *   `aria-describedby`, causing hydration mismatches.
 * - Mouse: starts after 5px, so a click still opens the task. Touch: starts
 *   after a 250ms press, so a swipe still scrolls the board. Keyboard, on
 *   the card's button: Space picks up and drops, arrows move, Escape
 *   cancels; Enter is not a start key, so it keeps opening the task.
 * - All text dnd-kit shows or announces comes from the dictionaries.
 *
 * During a drag no copy of the board is kept: state holds only where the
 * task would land (`intent`), and the board on screen is previewMove(),
 * the same pure move the drop then dispatches. The intent changes only
 * when the task crosses into another column; within a column, the
 * sortable list animates the reordering itself. Cancelling clears it.
 */
export function BoardDnd({
  board,
  children,
}: {
  board: Board;
  /** Renders the columns from the board as shown (with the move previewed). */
  children: (shown: Board) => ReactNode;
}) {
  const id = useId();
  const { dict, format } = useI18n();
  const { moveTask } = useBoardActions();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [intent, setIntent] = useState<DropPosition | null>(null);

  const draggedTask =
    activeId === null ? undefined : findTask(board, String(activeId))?.task;
  const shown =
    draggedTask && intent ? previewMove(board, draggedTask.id, intent) : board;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates,
      keyboardCodes: {
        start: ['Space'],
        cancel: ['Escape'],
        end: ['Space', 'Enter'],
      },
    })
  );

  /** What the dragged task is over, in domain terms. */
  const targetOf = (active: Active, over: Over | null): DropTarget | null => {
    if (!over) return null;
    const data = over.data.current as DndData | undefined;
    if (data?.type === 'column') {
      return { kind: 'column', columnId: String(over.id) };
    }
    const dragged = active.rect.current.translated;
    const after = dragged
      ? dragged.top + dragged.height / 2 > over.rect.top + over.rect.height / 2
      : false;
    return { kind: 'task', taskId: String(over.id), after };
  };

  /** Where a drop would land, on the board as currently shown. */
  const positionOf = (active: Active, over: Over | null) => {
    const target = targetOf(active, over);
    return target ? dropPosition(shown, String(active.id), target) : undefined;
  };

  const reset = () => {
    setActiveId(null);
    setIntent(null);
  };

  const titleOf = (taskId: UniqueIdentifier) =>
    findTask(board, String(taskId))?.task.title ?? '';

  /** Column, position and total where the task would land, for announcements. */
  const landingOf = (active: Active, over: Over | null) => {
    const position = positionOf(active, over);
    const task = findTask(board, String(active.id))?.task;
    if (!position || !task) return undefined;
    const column = previewMove(shown, task.id, position).columns.find(
      (c) => c.id === position.toColumnId
    );
    return {
      title: task.title,
      column: column?.name ?? '',
      position: position.toIndex + 1,
      total: column?.tasks.length ?? 0,
    };
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      format(dict.dnd.pickedUp, { title: titleOf(active.id) }),
    onDragOver: ({ active, over }) => {
      const landing = landingOf(active, over);
      return landing && format(dict.dnd.over, landing);
    },
    onDragEnd: ({ active, over }) => {
      const landing = landingOf(active, over);
      return landing
        ? format(dict.dnd.dropped, landing)
        : format(dict.dnd.cancelled, { title: titleOf(active.id) });
    },
    onDragCancel: ({ active }) =>
      format(dict.dnd.cancelled, { title: titleOf(active.id) }),
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={boardCollisionDetection}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: dict.dnd.instructions },
      }}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragOver={({ active, over }) => {
        const position = positionOf(active, over);
        const current = findTask(shown, String(active.id))?.column.id;
        // Only a change of column is previewed; the sortable list handles
        // reordering within a column.
        if (position && position.toColumnId !== current) setIntent(position);
      }}
      onDragEnd={({ active, over }) => {
        const position = positionOf(active, over);
        const task = findTask(board, String(active.id))?.task;
        reset();
        if (!position || !task) return;
        moveTask({ boardId: board.id, taskId: task.id, ...position });
        refocusCard(task.id);
      }}
      onDragCancel={reset}
    >
      {children(shown)}
      <DragOverlay>
        {draggedTask && (
          <TaskCard boardId={board.id} task={draggedTask} overlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Which target the dragged card is over. First the column under the
 * pointer (or, for the keyboard, under the card's centre); then the
 * closest card within that column, or the column itself when it is
 * empty. Plain closestCorners compares corners with every target, and a
 * tall column loses to a smaller card in the next column even when the
 * pointer is inside it.
 */
const boardCollisionDetection: CollisionDetection = (args) => {
  const { droppableContainers, droppableRects, collisionRect } = args;
  const x =
    args.pointerCoordinates?.x ?? collisionRect.left + collisionRect.width / 2;
  const dataOf = (container: (typeof droppableContainers)[number]) =>
    container.data.current as DndData | undefined;

  const column = droppableContainers.find((container) => {
    const rect = droppableRects.get(container.id);
    return (
      dataOf(container)?.type === 'column' &&
      rect !== undefined &&
      rect.left <= x &&
      x <= rect.right
    );
  });
  if (!column) return closestCorners(args);

  const columnId = dataOf(column)?.columnId;
  const cards = droppableContainers.filter(
    (container) =>
      dataOf(container)?.type === 'task' &&
      dataOf(container)?.columnId === columnId
  );
  return cards.length > 0
    ? closestCorners({ ...args, droppableContainers: cards })
    : [{ id: column.id, data: { droppableContainer: column, value: 0 } }];
};

/**
 * Keyboard movement. Up and Down move within the column (dnd-kit's
 * sortable behaviour). Left and Right move to the neighbouring column on
 * screen, landing at its top, so in Arabic Right still goes to the column
 * on the right.
 *
 * dnd-kit's default for Left/Right picks the nearest droppable to the
 * side, which can be the card's own column (the lifted card is tilted, so
 * its edge is a pixel off), and its stored rectangles go stale once it
 * scrolls the board. Here the dragged card and the columns are measured
 * live, in one coordinate space, and the card moves by the difference.
 */
const boardKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  if (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') {
    return sortableKeyboardCoordinates(event, args);
  }
  event.preventDefault();
  const { draggingNode, droppableContainers } = args.context;
  const card = draggingNode?.getBoundingClientRect();
  if (!card) return undefined;

  const columns = droppableContainers
    .getEnabled()
    .filter(
      (container) =>
        (container.data.current as DndData | undefined)?.type === 'column'
    )
    .flatMap((container) => {
      const rect = container.node.current?.getBoundingClientRect();
      return rect ? [rect] : [];
    })
    .sort((a, b) => a.left - b.left);

  const cardCentre = card.left + card.width / 2;
  const current = columns.findIndex(
    (rect) => rect.left <= cardCentre && cardCentre <= rect.right
  );
  if (current === -1) return undefined;
  const target = columns[current + (event.code === 'ArrowRight' ? 1 : -1)];
  if (!target) return undefined;

  return {
    x: args.currentCoordinates.x + (target.left - card.left),
    y: args.currentCoordinates.y + (target.top - card.top),
  };
};

/**
 * After a drop, keep the moved card focused and on screen.
 *
 * - A card that changed column is a new element, so dnd-kit's own focus
 *   restore (to the old button) lands nowhere; the card is found again by
 *   `data-task-id`.
 * - On phones, snap scrolling comes back on after the drop and can pull
 *   the board back to where the drag started, leaving the card off screen.
 *   The card is scrolled into view, which scrolls both its column's list
 *   and the board (a no-op when already visible).
 */
function refocusCard(taskId: string) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const button = document.querySelector<HTMLElement>(
        `[data-task-id="${CSS.escape(taskId)}"] button`
      );
      if (!button) return;
      const focused = document.activeElement;
      if (!focused || focused === document.body || !focused.isConnected) {
        button.focus({ preventScroll: true });
      }
      (button.closest('li') ?? button).scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    })
  );
}

/**
 * The board's scrolling area. While a card is dragged, phone snap
 * scrolling is switched off: it would fight dnd-kit's auto-scroll.
 */
export function DndScrollArea(props: ComponentProps<'main'>) {
  const { active } = useDndContext();
  return <main data-dragging={active ? '' : undefined} {...props} />;
}
