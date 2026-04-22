# ADR 005 — Theming and Dark Mode

**Status:** Accepted
**Date:** 2026-04-21

## Context

feelike needs a visual direction *and* a professional theming system from day one. The user picked the Vibrant direction (coral/peach/indigo gradient brand, DM Sans typography, playful interaction feedback) and wants a dark mode companion. Retrofitting dark mode after shipping is painful — tokens get scattered through components, hardcoded hexes creep in, and every new screen becomes a manual light-vs-dark audit. We're doing it right before writing app code.

## Decision

**Adopt a two-layer token system (primitives + semantic tokens) with light and dark theme maps, delivered through NativeWind. User preference: `auto | light | dark` persisted locally.**

Concretely:

1. **Primitive palette** — the brand's raw colors (`coral-500`, `indigo-500`, `ink-900`, …). Static. Defined once in `app/src/theme/tokens.ts` as a JS object.
2. **Semantic tokens** — names that describe *meaning* (`bg`, `surface`, `text-primary`, `accent`, `border`, `success`, `danger`). Components only reference these.
3. **Two theme maps** — `lightTheme` and `darkTheme` each map every semantic token to a primitive. Swapping modes swaps the map — zero per-component branching.
4. **Delivery** — NativeWind's `dark:` class variant. Both palettes live in `tailwind.config.js`; NativeWind resolves `className="bg-bg dark:bg-bg"` at build time. No CSS variables, no global stylesheets — those are web primitives that don't exist in React Native.
5. **JS access** — for places that consume colors in JS (StatusBar tint, native modals, Skia), a `useTheme()` hook returns the fully-resolved theme object from `ThemeContext`.
6. **User control** — `ThemeProvider` tracks `auto | light | dark` (stored in **`AsyncStorage`**, not SecureStore — it's not a secret and SecureStore is slower and size-limited). `auto` resolves to the OS mode via `useColorScheme()`. Default is `auto`.
7. **Transition** — React Native doesn't animate color props by default; we use `react-native-reanimated` to animate `backgroundColor` / `color` / `borderColor` at the provider level with `220ms cubic-bezier(0.2, 0, 0, 1)` for the theme swap. Component-level colors re-render without animation (acceptable — the root fade masks it).

Full token tables and mode maps live in `docs/ux-spec.md`. Renderable reference: `docs/themes/theme-system.html`.

## Rationale

- **Zero per-component branching.** Every screen themes itself automatically. Writing a new screen = use semantic class names, never think about the mode.
- **One file to re-skin.** Tweaking the primitive palette re-themes the app in minutes. We can iterate on brand colors without touching components.
- **Industry pattern.** Tailwind, Radix UI, Linear, Notion, Stripe docs — all ship this structure. It's the default expectation of any designer or engineer joining later.
- **Accessibility baked in.** Semantic names force us to name a `danger` color (not "the red one") — making contrast and meaning explicit.
- **User agency.** `auto | light | dark` is what users expect. Costs one `ThemeProvider` and one persisted value.

## Alternatives rejected

- **Single theme, dark mode later.** Guaranteed pain. Would require a rewrite of every screen. Rejected.
- **Hardcoded hexes with per-component branches.** Scales poorly, breeds inconsistency, makes re-skinning a week-long project.
- **Multiple "themes" beyond light/dark (e.g. "sepia", "high contrast").** Overkill for v1. The architecture allows them later — we just add a new theme map. No need to build them now.
- **Tamagui / Restyle / other theming libraries.** NativeWind is already the styling choice (see CLAUDE.md tech stack). Adding a second theming system is redundant.

## Consequences

**Committing to:**
- All components use semantic class names (`bg-bg`, `text-text-primary`, `border-border`). No raw colors in component files. Lint rule in Phase 2 can enforce this.
- `ThemeProvider` wraps the app root. `useTheme()` hook returns `{ mode, setMode, resolvedMode, theme }` where `theme` is the fully-resolved semantic-token object.
- The `tokens.ts` file is the *one* place to edit colors. Treated as a source-of-truth artifact.
- Dark mode previews go into every screen review in Phase 2+. A screen isn't "done" until it looks right in both modes.

**Not doing (yet):**
- No per-user cloud-synced theme preference (it's a local-only setting).
- No system-aware accent color overrides (iOS tinting). Could add in v2 if users ask.
- No additional themes. The architecture supports them; we don't build them.

## Implementation plan (Phase 2)

1. `app/src/theme/tokens.ts` — `primitives`, `lightTheme`, `darkTheme` JS objects (values from `docs/ux-spec.md` tables).
2. `app/src/theme/ThemeProvider.tsx` — tracks preference in `AsyncStorage`, resolves mode via `useColorScheme()`, publishes resolved theme through `ThemeContext`, applies root `dark` className.
3. `app/src/theme/useTheme.ts` — hook exposing `{ mode, setMode, resolvedMode, theme }` where `theme` is the resolved semantic-token object.
4. `tailwind.config.js` — both palettes declared side-by-side; NativeWind `dark:` variant swaps values at build time.
5. Settings screen — mode picker (`auto / light / dark`) writing through `setMode`.
6. First-render flicker — `SplashScreen.preventAutoHideAsync()` before root renders; read saved preference; then `hideAsync()`.
7. Root-level color transition — `react-native-reanimated` fades `backgroundColor` on the root view over `220ms` when `resolvedMode` changes.

## Revisit when

- We want a third theme variant (sepia, high contrast, seasonal). Architecture supports it — just add a new map and expose it in the mode picker.
- Per-user cloud-synced preferences become a real product need.
- Accessibility review flags specific token contrasts; we tweak the mapping, not the components.
