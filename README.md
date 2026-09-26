# Kanban

A task-management board in English and Arabic: boards, columns and tasks with subtasks, moved by drag and drop with a
mouse, a finger or the keyboard. Built on Next.js 16, TypeScript and Tailwind CSS 4, based on the kanban task management challenge from
[Frontend Mentor](https://www.frontendmentor.io).

## Features

- **Boards:** create, rename, delete; add, rename and remove columns (removing a column removes its tasks).
- **Tasks:** create, edit, delete; tick subtasks; change status from a select or by dragging the card.
- **Drag and drop:** within and across columns, with mouse, touch (long press) or keyboard (Space, arrows, Space).
  Screen readers hear each step, in the page's language.
- **Two languages:** English and Arabic (`/en`, `/ar`), with a full right-to-left layout and Arabic-Indic digits.
- **Themes:** dark by default, light on request; the choice is remembered without a flash on reload.
- **Responsive:** phone first. On phones, columns are swiped sideways and a column strip shows where you are; from
  768px a sidebar lists the boards and can be hidden.
- **Accessible:** keyboard access everywhere, focus kept meaningful after every action, WCAG AA contrast in both themes,
  44px touch targets. Lighthouse mobile: accessibility, best practices and SEO 100.

**Part A (this version) is front-end only.** Changes live in the browser session: a reload, or switching language,
restores the seed data (the app asks before switching if you have changes). Part B adds a backend; see
[`docs/PLAN.md`](docs/PLAN.md).

## Getting started

Requirements: **Node.js 22.18 or later** (`.nvmrc` pins 22; run `nvm use`). Tests run TypeScript natively, which
needs 22.18.

```bash
git clone https://github.com/MostafaGamalBisher/kanban-board.git
cd kanban-board
npm ci
npm run dev
```

Open http://localhost:3000. You are redirected to `/en` or `/ar` (from a remembered choice, then your browser's
language). To try it on a phone on the same network, open `http://<your computer's IP>:3000`.

No environment variables are needed.

## Scripts

| Command                 | Does                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| `npm run dev`           | Development server on http://localhost:3000                           |
| `npm run build`         | Production build (`npm start` serves it)                              |
| `npm run check`         | Typecheck → lint → format check → tests → build. Must pass to commit. |
| `npm run typecheck`     | Regenerates route types, then `tsc --noEmit` (strict)                 |
| `npm run lint`          | ESLint, including the architecture, i18n and right-to-left rules      |
| `npm test`              | Unit tests (`node:test`, no framework) over `src/**/*.test.ts`        |
| `npm run test:coverage` | The same tests with a coverage report                                 |
| `npm run format`        | Prettier, with Tailwind class sorting                                 |

## Changing the content

- **Board data:** `src/data/boards.json`. It is validated at startup; a mistake stops the server with a message naming
  each problem.
- **Interface text:** `src/i18n/dictionaries/en.ts` (the source of truth) and `ar.ts`. A key missing from Arabic is a
  compile error.
- **Colours, sizes, fonts:** tokens in `src/app/globals.css`. **Settings** (languages, themes, cookie names):
  `src/config/`.

Components contain no data and no text; the linter rejects string literals in the interface.

## Project structure

```
src/
  app/          routes and layouts (thin): [locale]/ → (app)/ → boards/[boardId]
  core/         the domain: zod schemas, pure board operations, tests. No React, no Next.js.
  server/       data access (server only)
  features/     the UI by feature: boards, tasks, forms, dnd, shell, preferences
  components/   shared UI: shadcn/ui primitives (Radix), icons, logo
  i18n/         dictionaries, plurals, formatting
  config/       typed settings
  lib/          small helpers (routes, IDs, text direction)
  data/         the seed boards
  proxy.ts      redirects URLs without a language
docs/
  ARCHITECTURE.md   how it fits together, and why
  PLAN.md           the delivery plan, node by node
AGENTS.md           the project's rules (for people and coding agents)
```

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before changing structure.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript 6.0 (strict) · Tailwind CSS 4 · shadcn/ui on Radix · zod 4 ·
@dnd-kit · ESLint 9 · Prettier · `node:test`. Deployed on Vercel. Dependencies are pinned to exact versions.
