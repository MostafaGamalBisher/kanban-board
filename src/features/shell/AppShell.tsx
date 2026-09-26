'use client';

import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

import { useBoard } from '@/features/boards/BoardsProvider';

import { Header } from './Header';

/**
 * The frame around every board page. It sits in the (app) route-group
 * layout, above the [boardId] segment, so it stays mounted while you move
 * between boards; the current board comes from the URL via useParams().
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { boardId } = useParams<{ boardId?: string }>();
  const board = useBoard(boardId);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header board={board} />
      {children}
    </div>
  );
}
