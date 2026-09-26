# Kanban Board — Rewrite Plan

> Revision 5 · front-end first · approved 2026-09-26

## Context

The current app is a Vite + React + JavaScript SPA. Its data file is never imported, state mutations live inside
components, there is no type safety, and there is no i18n, RTL, dark mode or responsive layout.

- **Part A (now):** a complete, professionally structured front-end on Next.js + TypeScript.
- **Part B (later):** the backend. It is outlined here and planned in detail after you sign off Part A.
- **No data is hard-coded in components.** It comes from JSON/TS files through a data-access layer.
- **Reads follow Next.js best practice:** Server Components import data from its source directly. There are no HTTP
  calls to our own API.
- **An API only where needed.** Part A needs none.
- **TanStack Query is dropped.** Next.js built-ins cover its role.

---

## Progress

Each node is one commit. A box is ticked in the same commit that completes its node, after review.

**Part A — Front-end**

- [x] **0.1** Commit this plan as `docs/PLAN.md`
- [x] **1.1** Scaffold Next 16 + TS 6.0; remove the Vite app; icons, fonts, Node version pin
- [x] **1.2** Strict TS, ESLint (layer rules, `jsx-no-literals`), Prettier, `check` script
- [x] **1.3** shadcn/ui init, Kanban tokens, dark by default, primitives
- [x] **1.4** Vercel connected; first preview build verified
- [x] **2.1** Domain schemas (`core/board/schema.ts`)
- [x] **2.2** Seed data (`data/boards.json`) + server queries (`server-only`)
- [x] **2.3** Pure board operations + HTTP-safe ids
- [x] **2.4** `node:test` suite for the operations
- [x] **2.5** `config/` constants
- [x] **3.1** `[locale]` root layout + `proxy.ts` negotiation
- [x] **3.2** Typed dictionaries, `useT()`, Arabic plurals
- [x] **3.3** RTL rules + physical-class check
- [x] **3.4** Theme cookie + toggle; language switcher
- [x] **4.1** `BoardsProvider` seeded from the server
- [x] **4.2** Header + mobile board switcher
- [x] **4.3** Sidebar with hide/show
- [x] **4.4** Board view, empty and not-found states
- [x] **5.1** Board form + Add Board + language-switch guard
- [x] **5.2** Edit Board
- [x] **5.3** Delete Board
- [x] **6.1** View Task (subtasks, status)
- [x] **6.2** Add / Edit Task
- [x] **6.3** Delete Task
- [x] **7.1** DnD context, sensors, overlay
- [x] **7.2** Moves within and across columns
- [x] **7.3** RTL behavior, announcements, keyboard walkthrough
- [x] **8.1** Accessibility and Lighthouse audit
- [x] **8.1b** Mobile column navigation (owner's request)
- [x] **8.2** README + `docs/ARCHITECTURE.md`
- [x] **8.3** Production deploy — Part A sign-off

**Part B — Backend:** planned in detail after Part A sign-off.

---

## Revision history

| Rev | Change                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | **Language lives in the URL** (`/en`, `/ar`), per your decision. The known consequence: before Part B, switching language resets in-session edits. It is handled explicitly (§2.1): a confirmation dialog appears when there are edits, and there is a safe landing page if the current board was created in the session. `server-only` approved. Design source defined (no Figma available). |
| 4   | `dir="auto"` on user content; `core/` may import `zod`; HTTP-safe id generation for phone testing over LAN; stable `DndContext` id (hydration); Node ≥ 22.18 pinned for native TS tests; `jsx-no-literals` scope stated honestly, plus an attribute-literal grep; node 4.2 split; plan tracked in `docs/PLAN.md`.                                                                             |
| 3   | Front-end first; server-side direct reads; TanStack Query dropped.                                                                                                                                                                                                                                                                                                                            |

---

## 1. What the app needs

### 1.1 Routes

| Route                        | Purpose                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/`                          | `proxy.ts` redirects to `/en` or `/ar`, using: the remembered choice (cookie) → browser language → `en`. |
| `/[locale]`                  | Redirects to the first board, or shows the "no boards yet" empty state. An unknown locale gives a 404.   |
| `/[locale]/boards/[boardId]` | The board view. The main screen.                                                                         |
| `not-found` / `error`        | Unknown board or locale; unexpected render error.                                                        |

### 1.2 Layout

| Piece                               | Behavior                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Header**                          | Logo, current board name, "+ Add New Task" (icon-only on mobile), board menu (Edit / Delete).            |
| **Sidebar** (≥ 768px)               | "All boards (n)", board links, "+ Create New Board", theme toggle, language switch, hide-sidebar button. |
| **Show-sidebar button**             | Floating button, shown when the sidebar is hidden.                                                       |
| **Mobile board switcher** (< 768px) | Header dropdown containing the sidebar's content.                                                        |

### 1.3 Board screen

| Piece              | Behavior                                                    |
| ------------------ | ----------------------------------------------------------- |
| **Column**         | Colored dot, name, task count, list of task cards.          |
| **Task card**      | Title, "x of y subtasks". Opens the task detail. Draggable. |
| **"+ New Column"** | Opens Edit Board with a new empty column row.               |
| **Empty board**    | Message plus a "+ Add New Column" button.                   |

### 1.4 Dialogs (8, built on 2 shared forms)

- View Task
- Add Task / Edit Task (both use `TaskForm`)
- Delete Task
- Add Board / Edit Board (both use `BoardForm`)
- Delete Board
- **Confirm language switch** — appears only when there are in-session edits.

### 1.5 Behaviors

- **Boards:** create, edit, delete. Removing a column also removes its tasks.
- **Tasks:** create, edit, delete; tick subtasks; change status through a select, which moves the task to that column.
- **Drag and drop:** tasks within and across columns, using mouse, touch or keyboard.
- **Forms:** required fields show "Can't be empty", in the current language.
- **Preferences:** dark by default with a theme toggle; Arabic/English with a full right-to-left mirror; show/hide
  the sidebar.

### 1.6 Data, content and config — none of it in components

| What                                                        | Where                                      | Format                                                              |
| ----------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Boards / columns / tasks / subtasks                         | `src/data/boards.json`                     | JSON seed. Replaceable by a database without touching TypeScript.   |
| Shape and validation                                        | `src/core/board/schema.ts`                 | zod schemas → inferred types.                                       |
| UI text (labels, messages, aria text)                       | `src/i18n/dictionaries/{en,ar}.ts`         | TS. `ar` is typed from `en`, so a missing key is a compile error.   |
| Column dot colors, layout constants, locales, default theme | `src/config/*.ts`                          | Typed constants.                                                    |
| Colors, fonts, type scale                                   | `src/app/globals.css`                      | Tailwind v4 + shadcn tokens.                                        |
| Icons                                                       | `src/components/icons.tsx`, `lucide-react` | Components painted with `currentColor`; favicon `src/app/icon.svg`. |

### 1.7 Dependencies — the complete Part A list

| Package                                                                                                                                                                                              | Why                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next` 16.3, `react` / `react-dom` 19                                                                                                                                                                | Framework.                                                                                                                                                                                                                                                        |
| `typescript` **~6.0.3**                                                                                                                                                                              | Pinned: npm `latest` is 7.0, which the ESLint TypeScript parser does not support (`<6.1`).                                                                                                                                                                        |
| `tailwindcss` 4.3 + `@tailwindcss/postcss`                                                                                                                                                           | Styling.                                                                                                                                                                                                                                                          |
| shadcn/ui on Radix → `radix-ui` 1.6, `class-variance-authority`, `cn`, `lucide-react`, `tw-animate-css`                                                                                              | Accessible primitives. `cn` is shadcn's own class merger; it replaces `clsx` + `tailwind-merge`. `tw-animate-css` provides the open/close animations (CSS only). The `shadcn` package is a **dev** dependency: its `tailwind.css` is consumed at build time only. |
| `@dnd-kit/core` 6.3, `@dnd-kit/sortable` 10, `@dnd-kit/utilities`                                                                                                                                    | Drag and drop with touch and keyboard support.                                                                                                                                                                                                                    |
| `zod` 4                                                                                                                                                                                              | Validates the seed at load and forms at submit, with one schema per shape.                                                                                                                                                                                        |
| `server-only` 0.0.1                                                                                                                                                                                  | First line of every `server/` module. If browser code imports it, directly or through a chain of imports, the **build fails**. Zero runtime cost.                                                                                                                 |
| dev: `eslint` **9.39** (the react/import/jsx-a11y plugins bundled by `eslint-config-next` do not support ESLint 10 yet), `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`, `@types/*` | Tooling.                                                                                                                                                                                                                                                          |

**Built in, no dependency:** `next/font` (Plus Jakarta Sans + IBM Plex Sans Arabic), `Intl.PluralRules`,
`useReducer`, `node:test`, Web Crypto.

**Removed:** `vite`, `@vitejs/plugin-react`, `gh-pages`, `sass`, `react-router-dom`, `@tanstack/react-query`.

### 1.8 Design source (no Figma file available)

The challenge's design files are Pro tier. The design is rebuilt from what the repo already holds, which came from the
challenge's style guide:

| Source in the current repo                                                                                                              | Carried into                    |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Palette in `src/index.css`: main-purple, dark-grey, very-dark-grey, lines, lines-light, light-grey, medium-grey, red, plus hover shades | `globals.css` tokens (node 1.3) |
| Type scale in `src/index.css` (`heading-xl/l/m/s`, `body-l/m`)                                                                          | `globals.css` (node 1.3)        |
| Header 97px (`Header.jsx`), sidebar 300px (`SideMenu.jsx`), column 288px (`Column.jsx`), dialog 480px (`DialogPrimitive.jsx`)           | `config/layout.ts` (node 2.5)   |
| 11 SVG icons in `src/assets/img/icons/`                                                                                                 | `public/icons/` (node 1.1)      |

The layout follows the brief's structure. **It will be close to the original, but not pixel-exact.** Wherever the brief
is silent (spacing, the Arabic layout, focus states), I decide and flag each decision in that node's report.

---

## 2. Architecture

### 2.1 Data flow in Part A

```
src/data/boards.json
      │ imported on the server only
      ▼
server/boards/queries.ts          getBoards(): zod-validated, 'server-only'
      │ direct function call, no HTTP
      ▼
app/[locale]/layout.tsx (Server)  root layout: <html lang dir class>, dictionary, getBoards()
      │ props
      ▼
features/boards/BoardsProvider    (Client) useReducer, seeded from the server data
      │                           boardsReducer (core/board/actions.ts) delegates to core/board/operations.ts
      ▼
UI components                     read via useBoards() / useBoard(id), change via useBoardActions()
```

**Navigating between boards keeps edits.** The `[locale]` layout stays mounted while the locale stays the same.

**Switching language resets edits, and the app handles that explicitly.** `/en/…` and `/ar/…` are two different
instances of the `[locale]` layout, so switching discards the provider's in-memory state. Two measures make this
behave predictably:

1. **A guard.** The provider tracks `hasSessionChanges`. If it is true, the language switch opens a confirmation
   dialog ("Switching language will discard changes made in this session"). If it is false, the switch happens
   immediately.
2. **A safe landing page.** If the current board was created during the session, it does not exist after the reset.
   So the switcher sends you to `/[newLocale]` (the first board) instead of a 404.

The switcher also stores the choice in a `NEXT_LOCALE` cookie, so the next visit to `/` opens in that language. That
cookie is a _preference_; the URL remains the source of truth.

**Other limitation of front-end-only:** a hard refresh restores the seed. Part B removes both limitations. Once the
data lives on the server, a language switch reloads the _same_ data, and the guard dialog is deleted.

**Why the reducer delegates to `core/`:** in Part B, the same pure functions run on the server inside Server Actions,
and on the client inside `useOptimistic`. The UI does not change.

### 2.2 Layers

```
app/ (routes)  ──►  features/ (UI)  ──►  core/ (pure domain)  ◄──  server/ (data access)
```

| Layer       | Contains                                          | May import                                         | May not import         |
| ----------- | ------------------------------------------------- | -------------------------------------------------- | ---------------------- |
| `core/`     | schemas, types, pure operations, errors           | `core/` (relative imports), `zod`                  | `react`, `next`, `@/…` |
| `server/`   | queries (in Part B also actions and repositories) | `core/`, `data/`                                   | `features/`, `react`   |
| `features/` | components, hooks, providers                      | `core/`, `components/`, `config/`, `i18n/`, `lib/` | `server/`, `data/`     |
| `app/`      | routes and layouts; thin composition only         | all of the above                                   | —                      |

There are two guards. ESLint `no-restricted-imports` blocks direct imports that cross a layer. `server-only` catches
indirect import chains at build time.

### 2.3 Folder structure

```
src/
  proxy.ts                      # / → /en or /ar (Next 16's name for middleware); skips _next, icons, static files
  app/
    globals.css
    [locale]/
      layout.tsx                # root layout: <html lang dir class>, fonts, providers, getBoards()
      (app)/layout.tsx          # AppShell: header (and sidebar), kept mounted across boards
      (app)/page.tsx            # → first board or empty state
      (app)/boards/[boardId]/page.tsx
      (app)/[...notFound]/page.tsx  # localized not-found view (status 200, noindex)
    icon.svg                    # favicon
  core/board/
    ids.ts  limits.ts  schema.ts  parse.ts  operations.ts  actions.ts  (+ *.test.ts)
  core/errors.ts  core/validation.ts
  data/boards.json
  server/boards/queries.ts
  config/                       # site.ts, board.ts (column-dot mapping), theme.ts, i18n.ts (locales, direction, cookie)
  i18n/                         # dictionaries/{en,ar}.ts, get-dictionary.ts, provider.tsx, plural.ts
  features/
    preferences/                # ThemeToggle, useTheme, preferences-script, sidebar, LanguageSwitcher, cookies
    shell/                      # Header, Sidebar, MobileBoardSwitcher
    boards/                     # BoardsProvider, useBoards, BoardView, Column, BoardForm, dialogs
    tasks/                      # TaskCard, TaskDetail, TaskForm, dialogs
    dnd/                        # DndBoard, sensors, localized announcements
  components/ui/                # shadcn primitives only, never edited for feature logic
  lib/                          # cn.ts, ids.ts, cookies.ts
docs/PLAN.md                    # this plan, with a status checkbox per node
```

---

## 3. Working protocol

- **One node = one commit** on `claude/exciting-volta-koqz8t`, pushed. Each diff should be readable in one sitting.
- **After each node I stop and report:** what changed, why, what to check (with the preview URL once Vercel is
  connected), and one review question on the concept the node introduces.
- **You reply** "approved" or with changes. Changes land as follow-up commits; history is never rewritten.
- **Every node must pass** `npm run check`: typecheck, lint, custom greps, tests and build.

---

## PART A — FRONT-END

### Phase 0 — Tracking

| Node | Work                                                                | Done when                                         |
| ---- | ------------------------------------------------------------------- | ------------------------------------------------- |
| 0.1  | Commit this plan as `docs/PLAN.md` with a status checkbox per node. | The plan is in the repo and reviewable on GitHub. |

### Phase 1 — Foundation

| Node | Work                                                                                                                                                                                           | Done when                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1.1  | Scaffold Next 16 + TS 6.0 in place. Delete the Vite app (it stays in git history). Move icons → `public/icons/`. Fonts via `next/font`. Add `engines` + `.nvmrc`.                              | `npm run dev` serves a placeholder page.                                    |
| 1.2  | Strict `tsconfig`. ESLint: `eslint-config-next` + layer rules + `jsx-no-literals`. Prettier. Scripts: `dev` `build` `lint` `typecheck` `test` `format` `check`.                                | `check` is green; a planted violation of each rule fails, then is reverted. |
| 1.3  | `shadcn init`; map the Kanban palette and type scale onto shadcn tokens; dark by default. Add primitives: Button, Dialog, AlertDialog, DropdownMenu, Input, Textarea, Label, Checkbox, Select. | The placeholder shows the palette and every primitive, in dark and light.   |
| 1.4  | Vercel project `kanban-board` created through the Vercel connector (framework Next.js, linked to this GitHub repo, Node 24). First build of `7dd36db` succeeded.                               | The deployment reaches `READY`; you confirm it loads on your phone.         |

### Phase 2 — Data and domain

| Node | Work                                                                                                                                                                                                                                                                                                      | Done when                                                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | `core/board/schema.ts`: entity schemas + form input schemas. A task's status **is** its column.                                                                                                                                                                                                           | `typecheck` passes.                                                                                                           |
| 2.2  | `data/boards.json` (three seed boards) + `server/boards/queries.ts` (validated at load, `import 'server-only'` on line 1).                                                                                                                                                                                | A broken seed fails with a readable error. A planted client-side import of `queries.ts` fails `build` (shown, then reverted). |
| 2.3  | `core/board/operations.ts`: createBoard, updateBoard, deleteBoard, addTask, updateTask, deleteTask, moveTask, setSubtaskCompleted — all pure functions. `lib/ids.ts` with a fallback that works over plain HTTP.                                                                                          | `typecheck` passes; `core/` has no React or Next imports.                                                                     |
| 2.4  | `operations.test.ts` (`node:test`): moves (same column, across columns, edge positions), column-removal cascade, subtask toggle, not-found cases, **input immutability**.                                                                                                                                 | `npm test` green.                                                                                                             |
| 2.5  | `config/`: languages + direction + cookie (`i18n.ts`), themes + cookie (`theme.ts`), column-dot mapping (`board.ts`). Layout sizes and dot colours are Tailwind tokens in `globals.css` (`w-sidebar`, `h-header`, `bg-column-1`…) because components use them as classes; `config/layout.ts` was dropped. | Tests pass; the dots render on the showcase.                                                                                  |

### Phase 3 — Language, direction, theme

| Node | Work                                                                                                                                                                                                                                                                                                                                                       | Done when                                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 3.1  | `[locale]` segment as the root layout (`<html lang dir>` rendered on the server); an unknown locale gives a 404. `proxy.ts`: `NEXT_LOCALE` cookie → `Accept-Language` → `en`, excluding `_next`, icons and static files.                                                                                                                                   | `/` redirects correctly; `/ar` renders `dir="rtl"`; `/xx` gives a 404.                                       |
| 3.2  | Typed dictionaries; `getDictionary()` on the server; `I18nProvider` + `useT()` on the client; Arabic plurals via `Intl.PluralRules`.                                                                                                                                                                                                                       | A missing `ar` key fails `typecheck`; Arabic counts 0 / 1 / 2 / 3 / 11 / 100 read correctly.                 |
| 3.3  | RTL rules: the ESLint rule `rtl/no-physical-direction` (rejects `ml-`/`left-`/`text-right`… anywhere in UI code and suggests the logical class, keeping variants); Radix `Direction.Provider` in `AppProviders`; text inserted by `format()` is bidi-isolated (FSI/PDI); `Input`/`Textarea` default to `dir="auto"`; standalone user content uses `<bdi>`. | A planted `ml-4` fails lint; on `/ar` `align="end"` menus open on the left.                                  |
| 3.4  | Theme: the server always renders dark (pages stay static); an inline `<head>` script applies the `theme` cookie before the first paint. `useTheme` (useSyncExternalStore) + `ThemeToggle` (shadcn Switch). `LanguageSwitcher`: same path in the other language, named by `Intl.DisplayNames`, saves `NEXT_LOCALE`. All in `features/preferences/`.         | No flash (verified with JS bundles blocked); both preferences survive a reload; `/en` and `/ar` stay static. |

**Decided at 3.2:** Arabic-Indic digits (٣ ١١ ١٠٠) in the Arabic interface.

### Phase 4 — Shell and board view (read-only)

| Node | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Done when                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 4.1  | `BoardsProvider` seeded in the `[locale]` layout; `useBoards()`; `/[locale]` → first board. **Delivered:** `boardsReducer` in `core/board/actions.ts` (actions carry a pre-generated `idSeed`, so the reducer stays pure under Strict Mode); `useBoards` / `useBoard` / `useBoardActions`; `/[locale]/boards/[boardId]`; `lib/routes.ts`. The layout no longer sets `dynamicParams = false`: child segments inherit it, which made session-created boards 404. An unknown board renders an in-page view (HTTP 200) in Part A, because only the browser knows the session's boards. The showcase moved to `/[locale]/showcase` until 8.1.                                                                                                                                                                                                                                                                                                                                                                    | Board names render from the JSON via the provider.             |
| 4.2  | Header + mobile board switcher, built at 375px first. **Delivered:** an `(app)` route group whose layout holds `AppShell` (above `[boardId]`, so the header is not remounted between boards; the board comes from `useParams()`); `features/shell/` Header + MobileBoardSwitcher (a Radix dialog: focus starts on the current board, Esc returns focus to the trigger); the brief's icons as `currentColor` components (`components/icons.tsx`); an inline logo mark. Add task, Edit and Delete render disabled until 6.2 / 5.2 / 5.3. Dialog backdrops darkened to 50% (brief).                                                                                                                                                                                                                                                                                                                                                                                                                            | Correct at 375px in both languages.                            |
| 4.3  | Sidebar with hide/show at ≥ 768px. The board switcher trigger becomes a plain title from `md` up; the logo gains its wordmark. **Delivered:** `features/shell/Sidebar` + `ShowSidebarButton`; the header's logo cell lines up with the sidebar and gains the wordmark (`components/brand/Logo`, not mirrored in Arabic). The hidden/shown choice is a preference: a `sidebar` cookie applied before paint as `data-sidebar` on `<html>` by `preferencesScript` (renamed from `themeScript`), and a `sidebar-hidden:` CSS variant does the hiding, so React holds no state for it. Hide and Show hand focus to each other.                                                                                                                                                                                                                                                                                                                                                                                   | Correct at 768px and 1440px in both languages.                 |
| 4.4  | Board view: columns (dot, name, count), task cards, horizontal scroll with snap on mobile, empty-board and not-found views. **Localized 404:** a catch-all `[locale]/[...notFound]/page.tsx` that calls `notFound()`, plus `[locale]/not-found.tsx`, because unmatched URLs otherwise get Next's bare default 404 outside our layout (found in 3.1). **Delivered:** `BoardView` / `BoardColumn` / `TaskCard`, the empty-board view, and a shared `NotFoundView` (unknown board, unknown page). **404 decision (owner):** with the root layout under `[locale]`, Next.js cannot server-render `notFound()` inside it (it sends a blank error shell and the browser draws the page). So the catch-all renders the localized view directly: complete server HTML inside the app frame, status 200, `noindex`. No `not-found.tsx`. "+ New Column" and "+ Add New Column" render disabled until 5.2. Tasks without subtasks show no progress line. An empty column shows a dashed area (a drop target from 7.1). | Matches the brief; no string or data literal in any component. |

### Phase 5 — Board CRUD

| Node | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Done when                                                                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5.1  | Shared `BoardForm` (name + dynamic columns, zod, localized errors); Add Board dialog; "+ New Column" → Edit Board. **Language-switch guard:** `hasSessionChanges` in the provider, the confirmation dialog, and the safe landing page for session-created boards. **Delivered:** `BoardFormSchema` (core, shared by Add and Edit) + `fieldErrors()`; `BoardForm` (errors after the first submit, focus on the first invalid field, focus follows added/removed columns; messages inside the field at its end, direction from `lib/text-direction.ts`); `AddBoardDialog` via `BoardDialogsProvider` (sidebar, mobile switcher, empty home); `useSessionChanges()` + the guard in `LanguageSwitcher`. **Deviation:** "+ New Column" → Edit Board moves to 5.2, where Edit Board exists. | A new board appears and opens; the dialog closes and resets. Switching language with edits asks first. Switching from a session-created board lands on the first board, never a 404. |
| 5.2  | Edit Board: rename; add, remove or rename columns, with the removal cascade. Also enables "+ New Column" and "+ Add New Column" (open Edit Board with a new empty row). **Delivered:** `BoardFormDialog` (shared by Add and Edit, replaces `AddBoardDialog`); Edit Board from the header menu, "+ New Column" and "+ Add New Column" (the last two start with a focused empty column). Focus returns to the element that opened a dialog (Radix only restores it to its own Trigger).                                                                                                                                                                                                                                                                                                 | Edits show immediately.                                                                                                                                                              |
| 5.3  | Delete Board confirmation, then navigate to the next board or the empty state. **Delivered:** Delete Board from the header menu (Cancel focused by default); `boardToOpenAfterDeleting()` in `core/board/navigation.ts` (next, else previous, else the "no boards" page; tested). Navigation and the change run in one React transition (also for Create), so no in-between "not found" frame; `router.replace`, so Back never returns to a deleted board. Alert-dialog primitive aligned to the brief (start-aligned text; buttons side by side, stacked on phones with the action first).                                                                                                                                                                                           | Never shows the wrong board afterwards.                                                                                                                                              |

### Phase 6 — Tasks

| Node | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Done when                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 6.1  | View Task: description, subtask checkboxes, status select (also the non-drag path for accessibility). **Delivered:** the whole card opens the task (title button stretched over the card, so cards keep their `<h3>`); `ViewTaskDialog` via `TaskDialogsProvider` (focus starts on the dialog; returns to the card, also after it moved column); `findTask()` / `subtaskProgress()` in `core/board/selectors.ts` (tested). Status change moves the task to the end of the chosen column. Edit/Delete Task menu items disabled until 6.2/6.3. Select primitive sized to the brief. | Toggles and moves update the card counts live.           |
| 6.2  | Shared `TaskForm`: Add Task and Edit Task, dynamic subtasks, status. **Delivered:** `TaskFormSchema` (core; `UpdateTaskInputSchema` derives from it; tested); `TaskForm`; Add Task (header, disabled without columns; first column, two empty subtasks) and Edit Task (from the View Task menu, replacing it). Shared form layer in `features/forms/`: `useSchemaForm`, `useEditableList`, `FieldInput` / `FieldTextarea` / `RemoveButton`, `FormDialog` (BoardForm refactored onto it; `BoardFormDialog` removed).                                                               | Create and edit work; validation messages are localized. |
| 6.3  | Delete Task confirmation. **Delivered:** Delete Task from the View Task menu (replacing it; Cancel focused by default). Focus after a delete: the next card in the column, else the previous one, else "+ Add New Task". `neighbourAfterRemoving()` in `core/board/navigation.ts` now backs both `boardToOpenAfterDeleting()` and the new `taskToFocusAfterDeleting()` (tested).                                                                                                                                                                                                  | The task is removed; counts update.                      |

### Phase 7 — Drag and drop

| Node | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Done when                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 7.1  | `DndContext` with a **stable `id`**; pointer, touch (press delay, so scrolling isn't hijacked) and keyboard sensors; one `SortableContext` per column; `DragOverlay`. **Delivered:** owner chose classic `@dnd-kit/core` 6.3.1 / `sortable` 10.0.0 / `utilities` 3.2.2 (exact) over the pre-1.0 `@dnd-kit/react`. `features/dnd/BoardDnd` (context with `useId()`, mouse 5px / touch 250ms press / keyboard Space-arrows-Esc, Enter still opens), `SortableTaskCard`, `DragOverlay`, droppable columns; snap scrolling off while dragging. dnd-kit's English instructions, role description and announcements replaced from the dictionaries. A drop does not change data yet (7.2). | Cards lift and drop visually; no hydration warning in the console. |
| 7.2  | Moves within and across columns dispatch `moveTask`. **Delivered:** no board copy during a drag: state holds only the intended drop position and the board shown is `previewMove()` (the pure `moveTask`); the drop dispatches the same move, cancel clears it. `dropPosition()` / `previewMove()` in `core/board/drag.ts` (tested); `moveTask` returns the same array for a no-op move. Column-first collision detection (whole columns are drop targets); Left/Right keys move by whole columns on screen (also in RTL), measured live; focus returns to the moved card; drop announced with column and position.                                                                  | Order is correct after moves in both directions.                   |
| 7.3  | Correct horizontal behavior under RTL; localized screen-reader announcements; keyboard-only walkthrough. **Delivered** (most of it landed in 7.2: screen-direction Left/Right in RTL, localized announcements, keyboard moves): the hover announcement now gives the column, position and total; after a drop the moved card's column is scrolled into view (on phones, snap scrolling otherwise pulled the board back and left the focused card off screen). Keyboard-only walkthrough verified in `/en` 1440px and `/ar` 375px: Tab to a card, Space, arrows, Space, Enter opens, Esc returns focus.                                                                               | A complete move with keyboard alone, in `/en` and `/ar`.           |

### Phase 8 — Hardening and sign-off

| Node | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Done when                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 8.1  | Audit: labels, dialog focus, contrast in both themes, 44px touch targets, Lighthouse mobile. Delete the `/[locale]/showcase` route. **Delivered:** AA text colours (owner's choice: text only, fills keep the brief's colours): `text-primary-text`, `text-destructive-text` and a darker/lighter `muted-foreground` per theme. 44px hit areas via a `touch-target` utility (icon buttons, switch, selects, remove buttons) and taller menu items and subtask rows. Favicon (`app/icon.svg`); theme-toggle icons as `currentColor` components; `/showcase` and the unused `public/icons` deleted. Lighthouse mobile (board page): en/ar, dark/light, all categories ≥ 93, accessibility 100. axe-core on every dialog (2 languages × 2 themes × 2 widths): focus starts inside each dialog; no contrast violations. **Follow-up (owner's decision):** fills that carry labels also reach AA, at rest and on hover: red #ea5555 → #cf4444 (white label 3.5 → 4.6:1), hovers darken instead of lighten (red #b83535, purple #524eb9), and the secondary button's label darkens on its hover tint (3.7 → 4.7:1). Known, not fixed: Radix's portalled menu trips axe's best-practice `region` rule (not a WCAG criterion). | Lighthouse mobile ≥ 90, or each shortfall explained.                                                      |
| 8.1b | Phones: the board is swiped sideways but shared one vertical scroll, so a long column left a short one scrolled to empty space and headings scrolled away; only a sliver hinted at more columns. **Delivered (owner chose swipe + strip):** below `md`, each column's task list scrolls on its own (heading stays in view); a column strip (`ColumnStrip`) under the header shows every column with its count, marks the one in view (`aria-current`, from an `IntersectionObserver` via the tested `mostVisibleIndex()` in `lib/visibility.ts`) and jumps to a column on tap. After a drop, the card itself is scrolled into view. Desktop unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Long columns scroll independently; the strip follows swipes in both directions; DnD still works at 375px. |
| 8.2  | Replace the template `README.md`; add `docs/ARCHITECTURE.md` (layers, data flow, the no-hard-coding rule). **Delivered:** README (features, requirements, getting started, scripts, where content lives, structure) and `docs/ARCHITECTURE.md` (principles, layers and their enforcement, request-to-screen flow, domain decisions, where things live, i18n/RTL, preferences, interface, drag and drop, quality gate, Part A limits vs Part B). Verified from a fresh clone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Someone else can clone and run the project.                                                               |
| 8.3  | Production deploy on Vercel. **Delivered:** a pull request from the working branch into `main` (owner's choice; the owner merges), which Vercel builds as production at https://mostafa-kanban.vercel.app. The README links the live site. (The `cn` package, first taken for unused, is the class merger behind `lib/utils.ts`; it stays.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | **You sign off Part A.** That unlocks the detailed Part B plan.                                           |

**Environment variables in Part A:** none. Nothing reads a secret or an environment-specific value.

---

## PART B — BACKEND (outline; planned in detail after Part A sign-off)

| Step | Work                                                                                                                                                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1   | **Mutations via Server Actions.** They reuse the same zod schemas and `core/` operations, persist the result, and call `revalidatePath`.                                                                                                                                                                                       |
| B2   | **`useOptimistic`** replaces the Part A reducer as the instant-UI layer, running the same `core/` operations. The language-switch guard is deleted, since data now survives the switch. The board route answers a real 404 (`notFound()` on the server) for unknown IDs.                                                       |
| B3   | **A repository port + adapter** behind `server/`; the queries read through it.                                                                                                                                                                                                                                                 |
| B4   | **Environment variables**, zod-validated in `lib/env.ts`: `DATA_DRIVER`, then `DATABASE_URL` / `DATABASE_AUTH_TOKEN`. Set per environment in Vercel.                                                                                                                                                                           |
| B5   | **Route handlers only where genuinely needed** (e.g. an external client). None planned by default.                                                                                                                                                                                                                             |
| B6   | **Persistence, after deployment is confirmed.** A local SQLite file **does not work on Vercel**: the filesystem is read-only, and `/tmp` is temporary and separate per instance. The SQLite-compatible option on Vercel is **Turso (libSQL)**; the alternative is Postgres (Neon). Either one means one adapter plus env vars. |

---

## Verification

- **Every node:** `npm run check` — typecheck; lint (layer rules, `jsx-no-literals`); the RTL rule (physical direction classes); `node:test`; build (which includes the `server-only` guard).
- **From 1.4 on:** the preview URL on a phone (375px) and on desktop (1440px), in `/en` and `/ar`, in dark and light.

---

## Decisions locked

| Decision        | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sequencing      | Part A front-end completed and signed off before any backend work.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Reads           | Server Components import from the data layer directly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Data source     | `data/boards.json`, zod-validated; nothing hard-coded in components.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Client state    | A `useReducer` provider in the `[locale]` layout, over pure `core/` operations. No TanStack Query.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Locale          | **In the URL** (`/en`, `/ar`), with a `NEXT_LOCALE` cookie remembering the preference. In-session edits reset on a language switch, behind a confirmation guard, until Part B.                                                                                                                                                                                                                                                                                                                                                            |
| Server boundary | `server-only` + ESLint layer rules.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| User content    | Not translated; rendered with `dir="auto"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Writes (Part B) | Server Actions + `useOptimistic`; route handlers only if needed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| DnD             | `@dnd-kit/core` + `sortable`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| UI primitives   | shadcn/ui on **Radix** (style `radix-vega`, generated with `--rtl`); `tw-animate-css` approved.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Palette         | Dark background `#20212C` (style guide, as recalled), replacing the repo's `#1e1e1e`.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Arabic digits   | Arabic-Indic (٣ ١١ ١٠٠), pinned explicitly (`NUMBERING_SYSTEM` in `config/i18n.ts`) because the default for plain `ar` differs between browsers.                                                                                                                                                                                                                                                                                                                                                                                          |
| Theme           | Dark by default. The preference lives in a cookie and is applied by an inline script before paint, **not** read on the server: reading cookies server-side would make every page dynamic. No localStorage.                                                                                                                                                                                                                                                                                                                                |
| Design          | Rebuilt from the repo's existing tokens, dimensions and icons; close to the original, not pixel-exact.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Scope           | Full Frontend Mentor brief.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Tests           | `node:test` over the pure domain operations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Migration       | Clean rewrite; the old code stays in git history.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Deploy          | Vercel project `kanban-board`. Every push to the working branch builds a **preview** automatically; its stable branch URL is `kanban-board-git-claude-9d1137-mostafa-gamal-bisher-s-projects.vercel.app` (always the latest push). Vercel's production branch is `main`. The production domain `kanban-board-bice-seven-69.vercel.app` holds a one-off build of `7dd36db` (a manual API deployment defaults to production) and changes only when `main` deploys, at node 8.3. All deployments require Vercel login except custom domains. |
