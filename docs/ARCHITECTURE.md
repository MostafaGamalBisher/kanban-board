# Architecture

How the app fits together, and why it is built this way. The binding rules, in short form, are in
[`AGENTS.md`](../AGENTS.md); the delivery history is in [`PLAN.md`](PLAN.md).

## 1. Principles

1. **The domain knows nothing about the UI.** Board rules are pure TypeScript functions in `src/core/`. They are tested
   without a browser and can be reused on the server in Part B unchanged.
2. **Nothing is hard-coded in components.** Data comes from the data layer, text from the dictionaries, colours and sizes
   from design tokens, settings from `src/config/`. The linter enforces most of it.
3. **One source of truth per concern.** A zod schema defines each shape once (validation and type); the URL holds the
   language; the board state lives in one provider.
4. **Both languages are first-class.** Arabic is not a translation layer on top of an English layout: direction,
   digits, plurals and mixed-direction content are designed in.
5. **Static by default.** Pages are prerendered. No page or layout reads cookies (only `proxy.ts` does, to pick a
   language); saved preferences are applied in the browser before the first paint.

## 2. Layers

```
app/ (routes)  ──►  features/ (UI)  ──►  core/ (pure domain)  ◄──  server/ (data access)
                        │
                        └──►  components/ (shared UI), i18n/, config/, lib/
```

| Layer         | Contains                                            | May import                                                         | Enforced by                                   |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| `core/`       | zod schemas, types, pure operations, errors, tests  | relative `core/` paths and `zod` only                              | ESLint `no-restricted-imports` (per folder)   |
| `server/`     | data access (`getBoards`, `getBoard`)               | `core/`, `data/`                                                   | ESLint, and `import 'server-only'` on line 1  |
| `features/`   | components, hooks and providers, grouped by feature | other features, `core/`, `components/`, `i18n/`, `config/`, `lib/` | ESLint: never `server/` or `data/`            |
| `components/` | shadcn/ui primitives (Radix), icons, logo           | `lib/`, `config/`, `i18n/`                                         | ESLint; primitives carry no text of their own |
| `app/`        | routes and layouts: composition only                | all of the above                                                   | review                                        |

Two guards protect the server boundary. ESLint rejects a direct import across a layer. `server-only` fails the
**build** if browser code reaches a server module through any chain of imports, which a per-file lint rule cannot see.

`core/` has no `@/` aliases and uses `.ts` extensions on imports, because its tests run on Node's built-in TypeScript
support (type stripping) without a bundler. For the same reason it uses no enums.

## 3. From request to screen

```
GET /                     proxy.ts: no language in the URL → redirect
  │                       cookie NEXT_LOCALE → Accept-Language → en   (lib/locale-negotiation.ts, tested)
  ▼
/en/boards/platform-launch
  │
app/[locale]/layout.tsx   root layout, prerendered for /en and /ar
  │  <html lang dir>      Arabic is right-to-left in the first byte of HTML
  │  preferencesScript    inline in <head>: applies theme + sidebar cookies before paint
  │  getBoards()          server/boards/queries.ts: parses src/data/boards.json once, cached
  ▼
BoardsProvider            (client) useReducer(boardsReducer, boards from the server)
  ▼
(app)/layout.tsx → AppShell   header, sidebar, dialogs; stays mounted across boards
  ▼
boards/[boardId]/page.tsx → BoardScreen → BoardView → columns → cards
```

- **Reads are direct function calls**, not HTTP requests: the layout calls `getBoards()` on the server. There is no
  API in Part A.
- **The board state lives in the `[locale]` layout**, so it survives navigation between boards. `/en` and `/ar` are
  separate layout instances, so switching language starts from the seed again; `LanguageSwitcher` asks first when
  there are changes. Part B removes this limit.
- **Unknown pages** (`/en/foo`) are caught by `(app)/[...notFound]` and render a localized "not found" view inside the
  app (status 200, `noindex`). An unknown board renders the same view from `BoardScreen`, because only the browser
  knows the boards created in the session. `notFound()` is not used under `[locale]`: with a dynamic root layout,
  Next.js cannot render it on the server.

## 4. The domain (`src/core/board/`)

| File            | Role                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `schema.ts`     | Entity schemas (board → columns → tasks → subtasks) and input schemas (what forms submit, without IDs) |
| `ids.ts`        | Branded IDs (`BoardId`, `TaskId`, …): obtained by parsing, never by casting a string                   |
| `parse.ts`      | `parseBoards()`: the only way stored data enters the app; lists every problem, then freezes the result |
| `operations.ts` | `createBoard`, `updateBoard`, `deleteBoard`, `addTask`, `updateTask`, `deleteTask`, `moveTask`, …      |
| `actions.ts`    | `boardsReducer`: board changes as data, applied through the operations                                 |
| `drag.ts`       | Where a dragged card lands (`dropPosition`) and the board shown mid-drag (`previewMove`)               |
| `navigation.ts` | What gets focus or opens after a delete (the neighbour, else the previous item)                        |
| `selectors.ts`  | `findTask`, `subtaskProgress`                                                                          |

Design decisions:

- **A task has no `status` field.** Its status is the column that contains it, so the two can never disagree. Changing
  status is a move.
- **Operations are pure: `(boards, input) → boards`.** They never mutate, keep every unchanged object identical (React
  skips re-rendering it), and throw `NotFoundError` for unknown IDs. A no-op returns the same array, so
  `boards !== initialBoards` is an exact "has anything changed" test.
- **IDs are generated outside the reducer.** React may call a reducer twice (Strict Mode does, to catch impurity), so
  an action that creates something carries an `idSeed` made once before dispatching; `seededIds(seed)` derives every
  new ID from it. The new entity's ID is the seed itself, so the caller can navigate to it straight away.
- **Validation messages are codes** (`ValidationKey`), not sentences. The UI translates them.

## 5. Where things live

| What                              | Where                                     | Notes                                                      |
| --------------------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| Board data                        | `src/data/boards.json`                    | Validated at startup; replaced by a database in Part B     |
| Interface text                    | `src/i18n/dictionaries/{en,ar}.ts`        | `ar` is typed from `en`: a missing key fails to compile    |
| Colours, type scale, layout sizes | `src/app/globals.css` (Tailwind 4 tokens) | Components use semantic tokens (`bg-primary`), never hex   |
| Settings read by TypeScript       | `src/config/`                             | Languages and direction, themes, cookie names, column dots |
| Icons                             | `src/components/icons.tsx`                | SVG components painted with `currentColor`                 |

The linter rejects string literals in JSX text and in `aria-label`, `placeholder`, `title` and `alt`.

## 6. Languages and direction

- **The language is in the URL** (`/en`, `/ar`), so every page is shareable and prerenderable in both. A cookie only
  remembers the choice for the next visit to `/`.
- **Text is read as typed properties** (`dict.board.addTask`), never by string key. `format()` fills placeholders and
  wraps each value in Unicode isolation marks, so an English board name inside an Arabic sentence keeps its own
  direction without disturbing the punctuation around it. `plural()` uses `Intl.PluralRules` (Arabic has six plural
  forms). Numbers use the locale's digits.
- **User content** (names, descriptions) can be in either language whatever the interface language: it is rendered in
  `<bdi>` or with `dir="auto"`, and form fields default to `dir="auto"`.
- **Layout mirrors through logical utilities only** (`ms-`, `ps-`, `start-`, `text-start`). An ESLint rule rejects
  physical ones (`ml-`, `left-`) in UI code. Directional icons get `rtl:rotate-180`. Radix reads the direction from
  its `Direction.Provider`.
- **One font stack for both languages**, chosen per character: Plus Jakarta Sans for Latin, IBM Plex Sans Arabic for
  Arabic (downloaded only when Arabic text appears).

## 7. Preferences without dynamic pages

The theme and the sidebar state are cookies. Reading cookies in a layout would make every page dynamic, so the server
always renders the defaults and `preferencesScript` (inline in `<head>`) corrects `<html>` before the first paint:
the `dark` class and `data-sidebar`. CSS variants (`dark:`, `sidebar-hidden:`) do the rest, so React holds no state
for them and nothing flashes.

## 8. Interface

- **Primitives** are shadcn/ui components on Radix (`src/components/ui/`), restyled with the Kanban tokens. They hold no
  feature logic and no text: any built-in label (a dialog's "Close") is a required prop.
- **Forms** share one layer (`src/features/forms/`): `useSchemaForm` validates with the same zod schema as the domain,
  shows errors after the first submit, and focuses the first invalid field.
- **Dialogs** have one instance each, in providers inside `AppShell` (`BoardDialogsProvider`, `TaskDialogsProvider`).
  They return focus to whatever opened them. When that element is gone (a deleted card), focus moves to a neighbour,
  never to `<body>`.
- **Create and delete also navigate.** The navigation and the state change run in one React transition, so the page
  being left never renders the new data on its own. Deletes use `router.replace`, so Back cannot return to a deleted
  board.
- **Accessibility baseline:** WCAG AA contrast for text and for labels on filled buttons (at rest and on hover), in
  both themes; 44px touch targets (a `touch-target` utility enlarges small controls without changing their look).

## 9. Drag and drop (`src/features/dnd/`)

Built on `@dnd-kit/core` and `@dnd-kit/sortable`.

- **No copy of the board during a drag.** The drag keeps only the intended drop position. The board on screen is
  `previewMove(board, position)`, and the drop dispatches the same move. Cancelling simply forgets the position.
- **The domain decides where a card lands** (`core/board/drag.ts`, tested); the UI only measures the pointer and the
  rectangles.
- **Sensors:** mouse after 5px of movement (a click still opens the task); touch after a 250ms press (a swipe still
  scrolls); keyboard with Space to lift, arrows to move, Space or Enter to drop, Esc to cancel (Enter on a card that is not
  lifted still opens the task).
- **Right-to-left:** Left and Right move to the column on that side of the screen, measured live, so they work the same
  in Arabic. Collision detection finds the column first, then the position in it.
- **Screen readers** hear each step in the page's language ("…column Doing, position 2 of 3"): dnd-kit's built-in
  English is replaced from the dictionaries. `DndContext` gets its ID from `useId()`, so server and browser agree.
- **Phones:** the board swipes sideways; each column's list scrolls on its own, and a column strip shows which column
  is in view (an `IntersectionObserver`, which needs no direction handling).

## 10. Quality gate

`npm run check` runs typecheck (strict, `noUncheckedIndexedAccess`) → ESLint (layers, i18n literals, right-to-left)
→ Prettier → tests → production build. It must pass before every commit.

Tests use `node:test`, next to the code (`*.test.ts`), with small inline fixtures parsed through `parseBoards()`.
Parsed fixtures are frozen, so any accidental mutation fails the test. Every new rule or operation comes with a test
that fails without it.

## 11. Part A limits, and what Part B changes

| Part A (now)                                       | Part B                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| Changes live in the browser session (`useReducer`) | Server Actions persist them, reusing the same `core/` operations   |
| A reload or a language switch restores the seed    | Data survives both; the language-switch warning is removed         |
| Instant updates come from the local reducer        | `useOptimistic` runs the same operations for instant updates       |
| The seed file is the data source                   | A repository behind `server/` (Turso or Postgres); pages unchanged |

The UI talks to data only through `useBoards()` / `useBoardActions()` and the server only through `getBoards()` /
`getBoard()`, so Part B replaces what is behind those functions without touching the components.
