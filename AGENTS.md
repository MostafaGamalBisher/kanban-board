<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules — Kanban board

Next.js 16 (App Router) · TypeScript 6.0 · Tailwind CSS 4 · AR/EN with RTL. The full plan, with per-node status, is in
[`docs/PLAN.md`](docs/PLAN.md); read it before changing structure.

## Workflow

- Work is delivered in **nodes** (see `docs/PLAN.md`). One node = one commit. Tick the node's checkbox in that commit.
- The repository owner reviews every node before the next one starts. Do not begin a node that has not been approved.
- `npm run check` must pass before every commit.

## Commands

| Command                 | Does                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Dev server on http://localhost:3000                                                                                                       |
| `npm run check`         | typecheck → lint → format:check → test → build. The gate for every commit.                                                                |
| `npm run typecheck`     | `next typegen` (fresh route types) then `tsc --noEmit` (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| `npm run lint`          | ESLint, including the architecture and i18n rules below                                                                                   |
| `npm test`              | `node:test` over `src/**/*.test.ts` — Node ≥ 22.18 runs TypeScript natively, no test framework                                            |
| `npm run test:coverage` | Same tests with Node's built-in line/branch coverage report                                                                               |
| `npm run format`        | Prettier (with the Tailwind class-sorting plugin)                                                                                         |

## Architecture — enforced by `eslint.config.mjs`

```
app/ (routes)  ->  features/ (UI)  ->  core/ (pure domain)  <-  server/ (data access)
```

- **`src/core/`** — schemas, types and pure functions. Imports only relative paths within `core/` and `zod`. No React,
  no Next.js, no `@/` aliases, no enums (tests run it with Node's type stripping). Use `.ts` extensions on relative
  imports.
- **`src/server/`** — data access. First line of every module: `import 'server-only';`. Never imports UI code.
- **`src/features/`** and **`src/components/`** — UI. Never import `server/` or `data/`. Data arrives as props from
  Server Components.
- **`src/app/`** — routes and layouts. Thin composition only; no business logic.
- **`src/components/ui/`** — shadcn/ui primitives (Radix). Do not put feature logic in them. They contain no English:
  any built-in text (e.g. a dialog's screen-reader "Close") is a required prop such as `closeLabel`. After
  `npx shadcn add`, re-check new files for text and physical direction classes.

## Routing, languages and fonts

- Every page lives under `src/app/[locale]/` (the root layout). `/en` and `/ar` are prerendered; the proxy plus the
  layout's `isLocale()` check make any other first segment a 404. The layout renders `<html lang dir>` on the server.
- Never set `dynamicParams = false` in the `[locale]` layout: child segments inherit it, and the board route must
  render IDs it did not prerender (boards created in the session). Build in-app URLs with `routes` (`src/lib/routes.ts`).
- Do not call `notFound()` under `[locale]`: with a dynamic root layout, Next.js cannot server-render it (blank error
  shell, drawn by the browser). Unknown pages go to the catch-all `(app)/[...notFound]`, which renders `NotFoundView`
  with `noindex` (status 200, owner's decision); an unknown board renders the same view from `BoardScreen`.
- Board pages live in the `(app)` route group, whose layout renders `AppShell` (`src/features/shell/`). The shell reads
  the current board with `useParams()`; it sits above `[boardId]` so it is not remounted when the board changes. Keep
  shell state (menus, the sidebar) there, never in a board page.
- `src/proxy.ts` (Next 16's name for middleware) redirects URLs without a locale: cookie → `Accept-Language` →
  default, via the pure `negotiateLocale()` in `src/lib/locale-negotiation.ts`. Assets (any path with a dot) and
  `_next` are skipped.
- One font stack for both languages, chosen per character: Plus Jakarta Sans for Latin, IBM Plex Sans Arabic for
  Arabic (fetched only when Arabic text is present). Do not switch fonts by locale.

## Preferences (`src/features/preferences/`)

- Theme and language choices are cookies (`THEME_COOKIE`, `LOCALE_COOKIE`), written with `writePreferenceCookie()`.
  No localStorage.
- Never read cookies in a layout or page: it would make every page dynamic. The theme (`dark` class) and the sidebar state
  (`data-sidebar`) are applied to `<html>` by `preferencesScript` (inline in `<head>`, before paint). Components read the
  theme with `useTheme()`; the sidebar is hidden by CSS (`sidebar-hidden:` variant) and changed with `setSidebarState()`.
  The language is in the URL.
- A new saved preference follows the same pattern: a cookie + a value in `src/config/`, applied to `<html>` by
  `preferencesScript`, styled with a custom variant in `globals.css`.

## Interface text (`src/i18n/`)

- `dictionaries/en.ts` is the source of truth; `ar.ts` is typed from it (missing or extra keys fail to compile).
  Plurals use `englishPlural({ one, other })` / `arabicPlural({ zero, one, two, few, many, other })`.
- Read text as typed properties, never string keys: Server Components `const { dict, plural, format } = await
getI18n()` (`i18n/server.ts`); Client Components `useI18n()` (`i18n/provider.tsx`).
- Fill placeholders with `format(dict.x, { name })` and counts with `plural(dict.x, count)`: numbers get the
  locale's digits (Arabic-Indic for `ar`). Never concatenate translated fragments.
- A new string goes into both dictionaries in the same commit; `dictionaries.test.ts` checks keys and placeholders.

## Domain model (`src/core/board/`)

- `schema.ts` is the single source of truth: zod schemas give both validation and types. Never hand-write a type that
  a schema already infers.
- IDs are branded (`BoardId`, `ColumnId`, `TaskId`, `SubtaskId`): obtain them by parsing, never by casting strings.
- Entities are readonly (typed and frozen when parsed). Operations return new objects; nothing mutates in place.
- A task has no `status` field: its status is the column containing it.
- Validation messages are `ValidationKey` codes (`src/core/validation.ts`), never sentences. The UI translates them;
  map unknown messages with `toValidationKey()`.
- Input schemas (what forms submit) are separate from entity schemas: new items carry no ID.
- Every change goes through the pure functions in `core/board/operations.ts` (`(boards, input) → boards`). They never
  mutate, keep unchanged objects identical, and throw `NotFoundError` for unknown IDs. Creating operations take an
  `IdFactory`: pass `createId` from `src/lib/ids.ts` in the app, a counter in tests.
- The client applies changes through `boardsReducer` (`core/board/actions.ts`). A reducer must be pure (Strict Mode
  calls it twice), so actions that create entities carry an `idSeed` generated before dispatching; `seededIds(seed)`
  derives every new ID from it, and the created entity's ID is the seed itself.
- Components read boards with `useBoards()` / `useBoard(id)` and change them with `useBoardActions()`
  (`src/features/boards/BoardsProvider.tsx`). Never keep a second copy of board data in component state.
- Stored data enters the app only through `parseBoards()` (`core/board/parse.ts`), which throws `InvalidDataError`
  listing every problem. `src/server/boards/queries.ts` parses the seed once and caches it; pages call `getBoards()` /
  `getBoard(id)` (`undefined` for an unknown ID).

## Forms and dialogs

- Forms are built from `src/features/forms/`: `useSchemaForm` (validation, messages, focus on the first error),
  `useEditableList` (add/remove rows with focus), `FieldInput` / `FieldTextarea` / `RemoveButton`, `FormDialog`.
- A form validates with its schema from `core/` (e.g. `BoardFormSchema`, `TaskFormSchema`) and turns issues into per-field messages with
  `fieldErrors()` → `dict.validation[key]`. Show errors after the first submit, then live; on a failed submit, focus the
  first invalid field. Inputs carry a `name` equal to the issue path (`columns.1.name`) so focus can find them.
- When an action removes the focused element (removing a row, closing a menu that opened a dialog), move focus
  somewhere meaningful; never leave it on `<body>`.
- A message placed inside a field follows the field's text direction (`textDirection()` in `src/lib/`), not the
  page's.
- Board dialogs have one instance each in `BoardDialogsProvider` (inside `AppShell`); open them with
  `useBoardDialogs()`. The provider returns focus to whatever was focused when a dialog opened; a caller that
  disappears as the dialog opens (a menu, the mobile switcher) passes `returnFocusTo`.
- Task dialogs live in `TaskDialogsProvider` (`useTaskDialogs()`); a card is found again by `data-task-id` when it
  moved while its dialog was open. After a delete, focus goes to a neighbour chosen with `neighbourAfterRemoving()`
  (`core/board/navigation.ts`), never to `<body>`.
- A change that also navigates (create, delete) runs the navigation and the dispatch in one `startTransition`, so
  React commits them together and the page being left never renders the new data on its own. After a delete, use
  `router.replace` so Back cannot return to the deleted item.
- Until Part B, a language switch discards session changes: `LanguageSwitcher` asks first when
  `useSessionChanges().hasChanges`, and leaves a session-created board for the home page.

## Drag and drop (`src/features/dnd/`)

- `@dnd-kit/core` + `sortable` (owner's choice). `BoardDnd` wraps a board: `DndContext` with `id={useId()}` (dnd-kit's
  own IDs differ between server and browser), sensors, `DragOverlay`. Cards are `SortableTaskCard`; the title button
  is the drag handle. Every draggable and droppable carries `DndData` (`type`, `columnId`).
- Libraries must not put English in the page: pass dnd-kit's `screenReaderInstructions`, `announcements` and
  `roleDescription` from the dictionaries (`dnd.*`). Check any new library for built-in text.

## Tests

- `node:test` + `node:assert/strict`, next to the code (`*.test.ts`). No test framework.
- Tests in `core/` may import only relative paths, `zod`, `node:test` and `node:assert` (ESLint enforces it).
- Use small inline fixtures parsed with `parseBoards()`, never the seed file: parsed fixtures are frozen, so any
  mutation fails the test. Pass a counter `IdFactory` for predictable IDs.
- A new rule or operation needs a test that fails without it.

## Data and text are never hard-coded in components

- Board data: `src/data/boards.json`, read on the server via `src/server/`, validated with zod.
- UI text: the i18n dictionaries. ESLint rejects string literals in JSX text and in `aria-label`, `placeholder`,
  `title` and non-empty `alt`.
- Values used as CSS classes (colours, layout sizes such as `w-sidebar`, `h-header`, `w-column`, `bg-column-1`) are
  Tailwind tokens in `src/app/globals.css`. Values used by TypeScript (locales and their direction, themes, cookie
  names, the column-dot mapping) live in `src/config/`. Breakpoints are Tailwind defaults: `md` 768px, `xl` 1280px.

## Conventions

- Reads: Server Components call `src/server/` functions directly. Never `fetch` our own API from the server.
- No API routes, TanStack Query or localStorage in Part A (front-end). Part B adds Server Actions.
- RTL: logical Tailwind utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`, …).
  ESLint's `rtl/no-physical-direction` rejects physical ones everywhere in UI code; an explicit `ltr:`/`rtl:` variant
  marks an intentional exception. Directional icons (chevrons, arrows) get `rtl:rotate-180`.
- User content (board/column/task names, descriptions) may be in either language: render it standalone in `<bdi>`
  (inline) or with `dir="auto"` (block). Inside translated sentences, always insert it through `format()`, which
  isolates it. `Input` and `Textarea` already default to `dir="auto"`.
- Icons are the brief's SVGs as components in `src/components/icons.tsx`, painted with `currentColor` so tokens set
  their colour. Add new ones there; do not use `<img>` for icons whose colour changes.
- Radix reads direction from `Direction.Provider` (in `src/components/providers.tsx`), not from `<html dir>`.
- Import `cn` from `@/lib/utils`, never from the `cn` package (ESLint enforces it). `lib/utils.ts` registers the
  custom text sizes (`text-heading-*`, `text-body-*`); without that, merging drops color classes. Keep its list in
  sync with the `--text-*` tokens in `src/app/globals.css`.
- Styling uses semantic tokens (`bg-primary`, `border-border`, …). Raw brand colors (`--kanban-*`) are private to
  `globals.css`.
- Dependencies are pinned to exact versions. Do not add a dependency without the owner's approval.
