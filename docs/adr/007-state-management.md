# ADR 007 — State Management

**Status:** Accepted
**Date:** 2026-04-22

## Context

Phase 2 introduces the first screens: auth, capture, and timeline. These screens have two fundamentally different kinds of state:

1. **Server state** — entries list, current user session, tags. Async, can be stale, needs loading/error/refetch/cache-invalidation lifecycle.
2. **UI state** — active draft text in the capture textarea, tag input value, active mood selection, modal open/closed. Synchronous, ephemeral, never touches the network, lives only for the session.

Conflating these two concerns into a single store model (Redux) or handling them ad-hoc with `useState` + Context leads to either a global-state sprawl or prop-drilling. Per `docs/ux-spec.md`, draft text is intentionally not persisted between sessions (v1 zero-friction design), so UI state requires no persistence layer — only a lightweight in-memory solution.

## Options considered

1. **React Query (TanStack Query v5) + Zustand** — React Query owns server state; Zustand owns ephemeral UI state. Two small, focused tools with a clean boundary between them.
2. **Redux Toolkit (RTK) + RTK Query** — unified model, excellent devtools, industry-standard for large teams. But RTK's boilerplate (slices, actions, selectors) is disproportionate for an app this size. RTK Query duplicates React Query's server-state model.
3. **TanStack Query alone** — React Query is excellent for server state, but using `useQueryClient` to store ephemeral UI state (draft text, modal flags) is an anti-pattern. Forces all state through the async cache model regardless of whether it's async.
4. **Jotai** — atomic model, minimal boilerplate, composes well. However, it covers the same problem space as Zustand for this app without adding meaningfully different capabilities. Introduces a third mental model alongside React Query (async) and React hooks (component-local), where Zustand is sufficient and already familiar.
5. **React Context for server state** — workable for a single-user demo, falls apart immediately with background refetch, cache invalidation, and loading/error state management. Rejected.

## Decision

**TanStack Query v5 for server state + Zustand for UI state.**

The boundary rule: if it comes from the server, needs re-fetching, or must be invalidated after a mutation — it belongs in React Query. If it is transient UI state that never touches the network — it belongs in Zustand.

## Rationale

- **React Query solves server state correctly.** Background refetch, stale-while-revalidate, loading/error/success states, and cache invalidation on mutation are non-trivial to build by hand. React Query gives all of this with a single `useQuery` / `useMutation` call.
- **Zustand is zero-ceremony.** A Zustand store is a function call. No actions, reducers, selectors, or provider wrappers. For draft text and modal flags this is the right weight.
- **The boundary is stable.** Phase 3 replaces MSW mocks with the real FastAPI backend — only the base URL in the API client changes. React Query hooks (`useEntries`, `useCreateEntry`) stay identical.
- **Redux Toolkit is overkill.** The app has one developer and a small, well-understood domain. RTK's value — predictable action log, time-travel debugging, team conventions — does not apply here at v1 scale.
- **Jotai is not wrong, just unnecessary.** Zustand is already in the stack decision. Swapping to Jotai gains nothing material and costs a mental model switch.

## Consequences

- `app/src/hooks/` holds React Query hooks: `useEntries.ts`, `useEntry.ts`, `useCreateEntry.ts`, `useDeleteEntry.ts`, `useCurrentUser.ts`, etc. One hook per query/mutation.
- `app/src/stores/` holds Zustand stores, one file per feature domain: `captureStore.ts` (draft text, active mood, tag input), `uiStore.ts` (modal flags, transient UI), etc.
- No Redux. No MobX. No Context used for server or cross-screen state.
- `QueryClientProvider` wraps the app root (alongside `ThemeProvider`). No Zustand provider is needed — stores are module-level singletons.
- In Phase 2, React Query hooks point at MSW mock handlers. The swap to real endpoints in Phase 3 is a one-line change in the API client base URL.

## Revisit when

- The app adds real-time features (WebSocket push, live collaboration) — React Query's polling is a workaround there; a dedicated real-time layer may be warranted.
- State logic grows complex enough that a Redux devtools time-travel debugger would be useful — unlikely for journaling scope.
- A third library is seriously proposed — that's a signal the boundary rule above has broken down and needs re-examination.
