# service-request-ui

React 19 single-page dashboard for managing service requests. Displays all requests in a data grid, highlights the top open/in-progress items, and shows full request details in a contextual notes panel — all driven by a live REST API.

---

## Tech stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| Framework     | React 19                              |
| Language      | TypeScript 6                          |
| Build         | Vite 8                                |
| UI components | MUI v9 (Material UI + MUI X DataGrid) |
| Server state  | TanStack Query v5                     |
| HTTP client   | Axios                                 |
| Testing       | Vitest 4 + Testing Library            |
| Coverage      | `@vitest/coverage-v8`                 |
| Linting       | ESLint 10 + typescript-eslint         |
| Container     | nginx (production Docker image)       |

---

## Architecture

```
App
└── QueryClientProvider        (TanStack Query — global cache)
    └── ThemeProvider          (MUI light theme)
        └── SelectionProvider  (cross-widget selection state)
            └── DashboardLayout
                ├── RequestListWidget    — full DataGrid of all service requests
                ├── TopRequestsWidget    — cards for top 3 Open / InProgress requests
                └── NotesWidget          — detail panel driven by SelectionContext
```

### Data flow

```
api.ts  (raw axios calls, one function per endpoint)
  └── src/hooks/useServiceRequests.ts  (TanStack Query wrappers — the only place useQuery is called)
        └── Widgets consume hooks, never api.ts directly
```

**`SelectionContext`** is the sole cross-widget communication channel. `RequestListWidget` and `TopRequestsWidget` write the selected request ID on click; `NotesWidget` reads it to display details. Do not use props or other state for selection.

### TanStack Query cache keys

| Key                                   | Data                    |
|---------------------------------------|-------------------------|
| `['service-requests']`                | All service requests    |
| `['service-requests', 'top-pending']` | Top 3 Open / InProgress |
| `['service-requests', id]`            | Single request by ID    |

---

## Project structure

```
src/
├── App.tsx                    # Root — providers and layout
├── components/
│   ├── layout/
│   │   └── DashboardLayout    # Three-panel shell
│   ├── RequestListWidget/     # Full data grid
│   ├── TopRequestsWidget/     # Priority cards
│   └── NotesWidget/           # Detail panel
├── context/
│   └── SelectionContext.tsx   # Cross-widget selection state
├── hooks/
│   └── useServiceRequests.ts  # All TanStack Query wrappers
├── services/
│   └── api.ts                 # Raw axios calls — do not import directly in components
└── types/
    └── index.ts               # ServiceRequest interface
```

---

## Getting started

### Prerequisites

- Node.js 20+
- A running instance of `service-request-api` (see [service-request-api](../service-request-api))

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5001
```

> Default points to the API's Docker Compose port. Change to match your local setup.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

---

## Commands

| Command                     | Description                                          |
|-----------------------------|------------------------------------------------------|
| `npm run dev`               | Start Vite dev server with HMR                       |
| `npm run build`             | Type-check + production bundle (`dist/`)             |
| `npm run typecheck`         | TypeScript type-check without emitting               |
| `npm run lint`              | ESLint across all source files                       |
| `npm run validate`          | Chains: typecheck → lint → vitest run (full CI gate) |
| `npx vitest run`            | Run all tests once                                   |
| `npx vitest run <file>`     | Run a single test file                               |
| `npx vitest run --coverage` | Run tests with V8 coverage report                    |
| `npx vitest`                | Run tests in watch mode                              |
| `npm run preview`           | Preview the production build locally                 |

> **Note:** `npm run test`, `npm run test:coverage`, `npm run test:e2e`, `npm run test:a11y`, and `npm run format:check` are **not configured** in this project. Use the commands above.

---

## Testing conventions

- Tests live co-located with or adjacent to the file they test, or in `src/components/__tests__/`.
- Mock at the **hook module boundary**: `vi.mock('../../hooks/useServiceRequests', () => ({ ... }))` — never mock `api.ts` directly in component tests.
- The test environment sets `VITE_API_BASE_URL=http://test-api.example.com` via `vite.config.ts`.

---

## Docker

Build and run the production image:

```bash
docker build -t service-request-ui .
docker run -p 80:80 service-request-ui
```

The nginx container serves the built SPA on port 80. In production, CloudFront sits in front of S3 — see [service-request-infra](../service-request-infra).

---

## Environment variables

| Variable            | Required | Default                 | Description                                    |
|---------------------|----------|-------------------------|------------------------------------------------|
| `VITE_API_BASE_URL` | Yes      | `http://localhost:5000` | Base URL of the `service-request-api` REST API |
