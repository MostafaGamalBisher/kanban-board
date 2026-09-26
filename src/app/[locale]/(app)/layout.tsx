import { AppShell } from '@/features/shell/AppShell';

/**
 * Layout of the (app) route group: the board pages. A route group adds no
 * URL segment (/en, /en/boards/…), and this layout is not remounted when
 * the board changes, so the header keeps its state.
 */
export default function AppLayout({ children }: LayoutProps<'/[locale]'>) {
  return <AppShell>{children}</AppShell>;
}
