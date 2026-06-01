# Copilot Instructions — service-request-ui

React 19 / TypeScript / Vite single-page dashboard. MUI v9 component library. TanStack Query for server state. Vitest + Testing Library for tests.

---

## Commands

```bash
# Dev server (defaults to http://localhost:5173)
npm run dev

# Type-check only (no output files, faster than build)
npm run typecheck

# Type-check + build
npm run build

# Lint
npm run lint

# Full validation suite (typecheck → lint → tests)
npm run validate

# Run all tests
npx vitest run

# Run a single test file
npx vitest run src/hooks/useServiceRequests.test.ts

# Run a single test by name pattern
npx vitest run -t "clicking a TopRequestsWidget card"

# Run tests with coverage
npx vitest run --coverage
```

> **There is no `npm run test` script.** `npm run test` will fail. Use `npx vitest run` for tests, `npm run typecheck` for type checking, or `npm run validate` for the full local validation suite (typecheck + lint + tests).

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (defaults to `http://localhost:5000`).

---

## Architecture

```
App.tsx
  └── QueryClientProvider  (TanStack Query, staleTime: 30s, retry: 1)
        └── ThemeProvider  (MUI light theme, borderRadius: 8)
              └── SelectionProvider  (cross-widget selection context)
                    └── DashboardLayout
                          ├── RequestListWidget   — MUI X DataGrid, all requests
                          ├── TopRequestsWidget   — 3 MUI Cards, top Open/InProgress
                          └── NotesWidget         — detail panel, driven by SelectionContext
```

**Data flow — strict one-way pipeline:**

```
api.ts  →  hooks/useServiceRequests.ts  →  Widget components
```

- `src/services/api.ts` — raw axios calls only; one exported function per endpoint.
- `src/hooks/useServiceRequests.ts` — the **only** file that calls `useQuery`. Exports `useServiceRequests`, `useTopPending`, `useServiceRequest(id)`.
- Widget components call hooks. They never import from `api.ts` directly.

---

## TypeScript Types

`src/types/index.ts` defines the `ServiceRequest` interface:

```typescript
interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  requesterId: string;
  requesterName: string;
  requesteeId: string;
  requesteeName: string;
  createdAt: string;
  updatedAt: string;
}
```

> `status` and `priority` are **intentionally absent** — they are excluded from the API's `ServiceRequestDto`. Adding either field requires a coordinated change: API DTO → service mapping → this type → any consuming component.

---

## Key Conventions

**Data access**
- Never call `api.ts` functions directly from components. Always go through a hook in `src/hooks/`.
- New hooks belong in `src/hooks/useServiceRequests.ts`. Do not create separate hook files.
- **The UI is currently read-only.** `api.ts` exports only `getServiceRequests`, `getTopPending`, and `getServiceRequest`. There are no `createServiceRequest`, `updateServiceRequest`, or `deleteServiceRequest` functions. Any story that creates or modifies requests must first add the corresponding function(s) to `api.ts`, then add a `useMutation` hook, then wire it into the component.

**TanStack Query cache keys**
- All requests: `['service-requests']`
- Top pending: `['service-requests', 'top-pending']`
- Single by id: `['service-requests', id]`
- `useServiceRequest(id)` is disabled (`enabled: false`) when `id` is `null`.

**SelectionContext**
- `SelectionContext` (`src/context/SelectionContext.tsx`) is the cross-widget communication channel — holds `selectedId: string | null`.
- `NotesWidget` reads `selectedId`. `RequestListWidget` and `TopRequestsWidget` write to it via `setSelectedId`.
- **No deselect mechanic**: clicking an already-selected card/row does not clear selection. `selectedId` only moves forward. This is intentional.
- Access via `useSelection()` hook. Throws if used outside `SelectionProvider`.

**MUI / Design system**
- Component library: **MUI v9** (`@mui/material`). Icons: `@mui/icons-material`.
- Data grid: **MUI X DataGrid v9** (`@mui/x-data-grid`) — used in `RequestListWidget`.
- Use MUI components and the `sx` prop for all styling. Do not introduce plain CSS files or Tailwind.
- `RequestListWidget` selection is driven by `onRowClick` (MUI DataGrid API), not a native `<tr>` click. Row selection model uses `{ type: 'include', ids: new Set(selectedId ? [selectedId] : []) }` — the null guard is required; `new Set([null])` breaks DataGrid selection.
- Loading states differ per widget: `TopRequestsWidget` renders explicit `<Skeleton variant="rounded" />` components; `RequestListWidget` passes `loading={isLoading}` to `<DataGrid>` which renders its own overlay; `NotesWidget` renders `<Typography>Loading...</Typography>`. Match the pattern of the widget you are editing, not a single universal rule. Error states: always use `<Typography color="error">`.

**Widget patterns**
Each widget handles three states: loading → skeleton/spinner, error → `color="error"` Typography, empty/no-selection → placeholder with icon + caption text. Match this pattern in new widgets.

---

## Testing

**Framework**: Vitest + `@testing-library/react` + `@testing-library/user-event`

**Globals**: `describe`, `it`, `expect`, `vi` are **globally available** — do not import them. `vitest globals: true` is set in `vite.config.ts`. (Exception: `src/services/api.test.ts` imports them explicitly due to top-level `await` — do not follow that pattern in other test files.)

**Custom matchers**: `@testing-library/jest-dom` is imported in `src/setupTests.ts` and auto-applied to every test file. Matchers like `toBeInTheDocument()`, `toHaveTextContent()`, and `toBeVisible()` are available globally — do not import or polyfill them manually.

**Mock boundary**: Always mock at the hook module boundary in component and integration tests, never at `api.ts`:
```typescript
vi.mock('../../hooks/useServiceRequests', () => ({
  useServiceRequests: () => ({ data: [...], isLoading: false, isError: false }),
  useTopPending:      () => ({ data: [...], isLoading: false, isError: false }),
  useServiceRequest:  (id) => ({ data: id ? request : null, isLoading: false }),
}));
```
> **Exception**: `src/services/api.test.ts` tests the axios client directly by mocking `axios` itself — this is correct for that file. Do not apply the hook-boundary rule to `api.ts` unit tests.

**Test environment**: `VITE_API_BASE_URL` is set to `http://test-api.example.com` via `vite.config.ts` — do not set it manually in tests.

**Test locations**:
- API client tests: `src/services/api.test.ts`
- Hook tests: `src/hooks/*.test.ts`
- Component/widget tests: `src/components/<WidgetName>/<WidgetName>.test.tsx`
- Cross-widget integration tests: `src/components/__tests__/`
- Context tests: `src/context/*.test.tsx`

**Rendering with context**: Wrap renders in `<SelectionProvider>` when testing selection-dependent behavior. `QueryClientProvider` is not needed in component tests because hooks are mocked at the module boundary.
