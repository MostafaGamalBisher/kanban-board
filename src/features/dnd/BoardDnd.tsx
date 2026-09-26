'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDndContext,
  useSensor,
  useSensors,
  type Announcements,
  type Over,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useId, useState, type ComponentProps, type ReactNode } from 'react';

import type { Board } from '@/core/board/schema';
import { findTask } from '@/core/board/selectors';
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
 * Node 7.1: a drop does not change the data yet (the card returns to its
 * place). Node 7.2 commits moves.
 */
export function BoardDnd({
  board,
  children,
}: {
  board: Board;
  children: ReactNode;
}) {
  const id = useId();
  const { dict, format } = useI18n();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ['Space'],
        cancel: ['Escape'],
        end: ['Space', 'Enter'],
      },
    })
  );

  const titleOf = (taskId: UniqueIdentifier) =>
    findTask(board, String(taskId))?.task.title ?? '';
  const columnOf = (over: Over | null) => {
    const data = over?.data.current as DndData | undefined;
    return board.columns.find((column) => column.id === data?.columnId)?.name;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      format(dict.dnd.pickedUp, { title: titleOf(active.id) }),
    onDragOver: ({ active, over }) => {
      const column = columnOf(over);
      return column === undefined
        ? undefined
        : format(dict.dnd.over, { title: titleOf(active.id), column });
    },
    onDragEnd: ({ active }) =>
      format(dict.dnd.dropped, { title: titleOf(active.id) }),
    onDragCancel: ({ active }) =>
      format(dict.dnd.cancelled, { title: titleOf(active.id) }),
  };

  const activeTask =
    activeId === null ? undefined : findTask(board, String(activeId))?.task;

  return (
    <DndContext
      id={id}
      sensors={sensors}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: dict.dnd.instructions },
      }}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={() => setActiveId(null)}
      onDragCancel={() => setActiveId(null)}
    >
      {children}
      <DragOverlay>
        {activeTask && (
          <TaskCard boardId={board.id} task={activeTask} overlay />
        )}
      </DragOverlay>
    </DndContext>
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
