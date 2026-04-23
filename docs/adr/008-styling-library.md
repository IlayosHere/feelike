# ADR 008 — Styling Library

**Status:** Accepted
**Date:** 2026-04-22

## Context

ADR 005 (theming) locked the two-layer token system and chose NativeWind as its delivery mechanism. ADR 008 formally justifies that choice. The distinction matters: ADR 005 answers *how the theme works*; ADR 008 answers *why NativeWind over the alternatives* for styling components across the entire app.

The theming implementation in `docs/ux-spec.md` is written assuming NativeWind: semantic class names (`bg-bg`, `text-text-primary`), `dark:` variant for mode switching, `tailwind.config.js` as the single source of truth for both palettes. Any alternative would require reworking the token architecture already locked in ADR 005.

## Options considered

1. **NativeWind v4** — Tailwind utility classes in React Native. `dark:` variant for mode switching. One `tailwind.config.js` holds both palettes. ADR 005 already defines the full token architecture around it.
2. **Plain `StyleSheet` + `useTheme()` hook** — no extra tooling. But every component needs a `useTheme()` call to resolve colors, the `dark:` variant doesn't exist, and the single-config-file advantage disappears. Each new screen requires a manual light-vs-dark audit — the exact problem ADR 005 was written to eliminate.
3. **Tamagui** — highly optimized, brings its own theming system, compile-time CSS-in-JS. But Tamagui's theming layer is a redundant superset of what ADR 005 already defines. Its compile step adds complexity; its component library (while useful) is not needed for a custom-designed app. Rejected as conflicting with existing ADR 005 decisions.
4. **Restyle (Shopify)** — theme-driven styling via a `ThemeProvider` and typed `Box`/`Text` components. Like Tamagui, it *is* a theming system — adopting it would require reworking the ADR 005 token architecture into Restyle's model. Redundant given the decision already made.
5. **`StyleSheet` + manual dark-mode branching** — no dependencies, full control. Scales poorly: every new component adds a conditional `colorScheme === 'dark'` branch, color values scatter across files, and re-skinning the palette becomes a multi-file audit. This is the worst-case outcome ADR 005 was explicitly designed to avoid.

## Decision

**NativeWind v4 (Tailwind CSS for React Native).**

## Rationale

- **ADR 005 is already written around it.** The token architecture, `tailwind.config.js` as the single palette file, and `dark:` class variant are all specified in `docs/ux-spec.md`. Choosing any alternative means reworking decisions already accepted and implemented in the theme reference (`docs/themes/theme-system.html`).
- **`dark:` variant is the correct abstraction.** Writing `className="bg-bg dark:bg-bg"` (or just `bg-bg` with NativeWind's CSS variable bridge) requires zero per-component branching. Mode switching happens at the config level, not the component level.
- **One config file, one palette source of truth.** `tailwind.config.js` at `app/` root defines both light and dark semantic tokens. Re-skinning the app means editing one file.
- **Familiar mental model.** Tailwind utility classes are the dominant styling convention in modern web and are increasingly standard in React Native. Any engineer joining the project knows this pattern.
- **Tamagui and Restyle are theming systems, not just styling libraries.** Adopting either would mean running two competing theming models. The overhead is not justified.

## Consequences

- `tailwind.config.js` at `app/` root is the single authoritative source for all design tokens in both modes. It is kept in sync with `app/src/theme/tokens.ts` (the JS object used by `useTheme()` for imperative color access).
- All components and screens use semantic class names only: `bg-bg`, `text-text-primary`, `border-border`, `text-accent`, etc. No raw hex values. No references to primitive token names (`coral-500`) in component files.
- The `no-raw-hex` ESLint rule (tracked in CLAUDE.md Phase 2 kickoff) enforces this mechanically: bans `/#[0-9a-f]{3,8}/i` in `app/src/components/**` and `app/src/screens/**`, exempting `app/src/theme/tokens.ts`.
- NativeWind v4 requires `babel-plugin-nativewind` and Metro config adjustments. Standard setup per NativeWind v4 docs — no custom patches needed.
- For imperative color access (StatusBar tint, native modals, Skia), `useTheme()` from ADR 005 returns the resolved semantic-token object. Components never reach into `tokens.ts` directly.

## Revisit when

- NativeWind v4 produces a blocking bug or drops React Native support — at that point, a migration to plain `StyleSheet` + `useTheme()` is the lowest-risk fallback (the semantic token objects already exist in `tokens.ts`).
- A future version of Expo or React Native breaks NativeWind's Metro transform in a way that isn't quickly patched upstream.
- The app introduces a web target (Expo Web) and NativeWind's web compatibility proves insufficient.
