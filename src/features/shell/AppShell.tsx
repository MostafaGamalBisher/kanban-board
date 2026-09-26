'use client';

import { useParams } from 'next/navigation';
import { useRef, type ReactNode } from 'react';

import { useBoard } from '@/features/boards/BoardsProvider';
import { setSidebarState } from '@/features/preferences/sidebar';

import { Header } from './Header';
import { ShowSidebarButton } from './ShowSidebarButton';
import { Sidebar } from './Sidebar';

/**
 * The frame around every board page: header on top, sidebar (≥ 768px) and
 * the page below. It sits in the (app) route-group layout, above the
 * [boardId] segment, so it stays mounted while you move between boards;
 * the current board comes from the URL via useParams().
 *
 * Hiding the sidebar removes the focused button from the page, so focus
 * moves to the button that reverses the action (and back).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { boardId } = useParams<{ boardId?: string }>();
  const board = useBoard(boardId);
  const hideButton = useRef<HTMLButtonElement>(null);
  const showButton = useRef<HTMLButtonElement>(null);

  const hideSidebar = () => {
    setSidebarState('hidden');
    showButton.current?.focus();
  };
  const showSidebar = () => {
    setSidebarState('shown');
    hideButton.current?.focus();
  };

  return (
    <div className="flex h-dvh flex-col">
      <Header board={board} />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          currentBoardId={board?.id}
          onHide={hideSidebar}
          hideButtonRef={hideButton}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-auto">
          {children}
        </div>
      </div>
      <ShowSidebarButton ref={showButton} onShow={showSidebar} />
    </div>
  );
}
