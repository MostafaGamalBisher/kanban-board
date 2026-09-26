'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { BoardId, ColumnId } from '@/core/board/ids';
import type { Task } from '@/core/board/schema';
import { TaskCard } from '@/features/tasks/TaskCard';
import { useI18n } from '@/i18n/provider';

import type { DndData } from './BoardDnd';

/**
 * A task card that can be dragged. The card's title button is the drag
 * handle (activator); its stretched click area covers the whole card, so
 * the whole card can be grabbed. While dragging, the original stays in
 * place, faded, and a copy follows the pointer (DragOverlay).
 */
export function SortableTaskCard({
  boardId,
  columnId,
  task,
}: {
  boardId: BoardId;
  columnId: ColumnId;
  task: Task;
}) {
  const { dict } = useI18n();
  const data: DndData = { type: 'task', columnId };
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data,
    attributes: { roleDescription: dict.dnd.roleDescription },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <TaskCard
        boardId={boardId}
        task={task}
        dragging={isDragging}
        activator={{ ref: setActivatorNodeRef, attributes, listeners }}
      />
    </div>
  );
}
