---
applyTo: 'src/**'
---

# Code Review Instructions — service-request-ui

Review at **Senior Engineer** level. Enforce the patterns in `copilot-instructions.md`. Do not suggest alternatives to established patterns.

---

## 🔴 Block — Reject the PR

**Architecture pipeline**
- Any file other than `src/hooks/useServiceRequests.ts` calls, imports, or re-exports from `src/services/api.ts`. Only hooks touch `api.ts`; components call hooks.
- A new hook file is created outside `src/hooks/useServiceRequests.ts`. Add exports to that file directly.
- A mutation is wired into a component without: (1) a function in `api.ts`, and (2) a `useMutation` hook in `useServiceRequests.ts`.

**State and context**
- Cross-widget state flows through props or component state instead of `SelectionContext`. Use `useSelection()`.
- `useSelection()` is called outside a `<SelectionProvider>` subtree — guaranteed runtime throw. All dashboard widgets are inside `SelectionProvider` in `App.tsx`.
- A deselect mechanic is added (clicking a selected row/card clears selection). Intentionally absent — do not add it.

**Design system**
- Plain CSS files, `style={{}}` prop, or Tailwind are used. Use MUI components and `sx` exclusively.
- A `DataGrid` passes `new Set([null])` as `rowSelectionModel` — this breaks the grid. Correct: `new Set(selectedId ? [selectedId] : [])`.
- `onRowClick` is replaced with a native `<tr>` handler. Use the MUI DataGrid `onRowClick` API.

**Type safety**
- `status` or `priority` is added to `ServiceRequest` in `src/types/index.ts` without a matching update to `src/services/api.ts` in the same PR. These fields are intentionally absent from the API DTO.

**Tests**
- Tests mock at `vi.mock('../../services/api', ...)`. Mock at the hook boundary: `vi.mock('../../hooks/useServiceRequests', ...)`. Exception: `api.test.ts` mocking `axios` is correct.
- Vitest globals (`describe`, `it`, `expect`, `vi`) are imported explicitly outside `api.test.ts`. They are globally available via `vite.config.ts`.
- `@testing-library/jest-dom` matchers are imported manually. They are global via `src/setupTests.ts`.
- `VITE_API_BASE_URL` is set in a test file. It is already configured in `vite.config.ts`.

---

## 🟡 Require — Must Be Present Before Merge

- New exported components and components with new conditional rendering paths must have tests for all three states: **loading**, **error**, **empty/no-selection**.
- New test files must be in the correct location: `src/components/<Name>/<Name>.test.tsx`, `src/hooks/*.test.ts`, `src/components/__tests__/`, or `src/context/*.test.tsx`.
- New TanStack Query cache keys must follow `['service-requests']`, `['service-requests', 'top-pending']`, or `['service-requests', id]`.
- Any new `useServiceRequest(id)` call site must have `enabled: false` when `id` is `null`.
- Selection-dependent component tests must wrap renders in `<SelectionProvider>`. No `QueryClientProvider` needed (hooks are mocked).

---

## 🔵 Flag — Warn, Do Not Block

- New widget missing any of: loading skeleton, `<Typography color="error">` for errors, or empty/no-selection placeholder with icon.
- New widget loading pattern doesn't match the nearest existing widget (`<Skeleton>` for TopRequests, `loading={isLoading}` for DataGrid, `<Typography>Loading…</Typography>` for Notes).
- `api.ts` function added without a corresponding hook export in `useServiceRequests.ts`.
- `any` used without an inline comment explaining why a typed alternative isn't feasible.
