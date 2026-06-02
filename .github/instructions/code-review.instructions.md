---
applyTo: 'src/**'
---

# Code Review Instructions — service-request-ui

Review at **Senior Engineer** level. These rules enforce the architecture, conventions, and test quality standards documented in `copilot-instructions.md`. Do not suggest alternatives to established patterns — enforce them.

---

## 🔴 Block — Reject the PR

Do not approve if any of the following are present:

**Architecture pipeline violations**
- Any file other than `src/hooks/useServiceRequests.ts` calls, imports, or re-exports functions from `src/services/api.ts`. Correct form: components call hooks from `src/hooks/useServiceRequests.ts`; only that file touches `api.ts`.
- A new hook file is created outside `src/hooks/useServiceRequests.ts`. All hooks belong in that single file. Correct form: add the new hook export directly to `useServiceRequests.ts`.
- A mutation (create/update/delete) is wired into a component without a corresponding function first added to `api.ts` and a `useMutation` hook in `useServiceRequests.ts`. Correct form: `api.ts` function → `useMutation` hook in `useServiceRequests.ts` → component.

**State and context violations**
- Cross-widget communication is implemented via props, component state, or any mechanism other than `SelectionContext`. Correct form: use `useSelection()` from `src/context/SelectionContext.tsx`.
- `useSelection()` is called in a component that is not rendered inside `SelectionProvider` in the tree. This throws at runtime. Correct form: ensure the component tree has `<SelectionProvider>` as an ancestor (see `App.tsx`).
- A deselect mechanic is introduced (clicking an already-selected row/card clearing selection). This is intentionally absent and must not be added.

**Design system violations**
- Plain CSS files, the `style={{}}` prop, or Tailwind classes are introduced. Correct form: use MUI components and the `sx` prop exclusively.
- Any `DataGrid` row selection uses `new Set([null])` — this breaks MUI DataGrid. Correct form: null-guard it: `new Set(selectedId ? [selectedId] : [])`.
- `onRowClick` is replaced with a native `<tr>` click handler in any DataGrid component. Correct form: use the MUI DataGrid `onRowClick` API.

**Type safety violations**
- `status` or `priority` is added to the `ServiceRequest` interface in `src/types/index.ts`. These fields are intentionally absent from the API DTO. They may only be added when the same PR also updates `src/services/api.ts` to reflect the new fields from the API response — both changes must land together.

**Test violations**
- Component or integration tests mock at the `api.ts` level (`vi.mock('../../services/api', ...)`). Correct form: mock at the hook boundary — `vi.mock('../../hooks/useServiceRequests', ...)`. Exception: `src/services/api.test.ts` mocking `axios` directly is correct.
- Vitest globals (`describe`, `it`, `expect`, `vi`) are explicitly imported in any file other than `src/services/api.test.ts`. They are globally available via `vite.config.ts`.
- `@testing-library/jest-dom` matchers are manually imported or polyfilled. They are globally available via `src/setupTests.ts` — remove any manual import.
- `VITE_API_BASE_URL` is set manually in a test file. It is already set to `http://test-api.example.com` via `vite.config.ts` — manual overrides cause silent mismatches.

---

## 🟡 Require — Must Be Present Before Merge

Flag as required changes if absent:

- Any new exported component, or any component with new conditional rendering paths, must have tests covering all three states: **loading**, **error**, and **empty/no-selection**.
- New test files must live in the documented locations: component tests in `src/components/<WidgetName>/<WidgetName>.test.tsx`, hook tests in `src/hooks/*.test.ts`, cross-widget integration tests in `src/components/__tests__/`, context tests in `src/context/*.test.tsx`.
- New TanStack Query cache keys must follow the established pattern: `['service-requests']`, `['service-requests', 'top-pending']`, or `['service-requests', id]`.
- `useServiceRequest(id)` — any new call site must have `enabled: false` when `id` is `null`.
- New renders of selection-dependent components in tests must be wrapped in `<SelectionProvider>`. `QueryClientProvider` is not needed (hooks are mocked).

---

## 🔵 Flag — Warn, Do Not Block

Surface as comments but do not block merge:

- A new widget is missing any of: loading skeleton, `<Typography color="error">` error state, or empty/no-selection placeholder with icon. Each widget must handle all three states.
- A new widget's loading pattern does not match the widget it most closely resembles. `TopRequestsWidget` uses `<Skeleton variant="rounded" />`; `RequestListWidget` passes `loading={isLoading}` to `<DataGrid>`; `NotesWidget` uses `<Typography>Loading...</Typography>`. Match the nearest existing pattern.
- A function is added to `api.ts` without a corresponding exported hook in `useServiceRequests.ts`.
- `any` is used in TypeScript without an inline comment explaining why a proper type is not feasible.
- The `style={{}}` prop is used on a component that has an `sx` prop available — prefer `sx`.
