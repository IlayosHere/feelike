# ADR 001 — Mobile Framework

**Status:** Accepted
**Date:** 2026-04-21

## Context

feelike is a mobile-first journaling app. We need to ship to both iOS and Android. Single developer, solo iteration.

## Options considered

1. **React Native + Expo** — JS/TS, one codebase, excellent dev loop via Expo Go / dev client, huge ecosystem.
2. **Flutter** — Dart, beautiful default UIs, strong performance, but Dart is a second language for this repo and the ecosystem around journaling-specific libs is thinner.
3. **Native (Swift + Kotlin)** — best performance and platform fidelity, but 2× the code for a solo dev on a personal-scale app.
4. **PWA / web-only** — fast to build but feels wrong as a "phone app always on you" product.

## Decision

**React Native + Expo with TypeScript.**

## Rationale

- **Iteration speed** — Expo Go / dev client + hot reload = seconds from code change to phone screen.
- **One codebase, two platforms** — critical for solo dev.
- **TypeScript shares types with the backend's Pydantic via `shared/`** once we set it up.
- **Expo modules cover everything v1–v2 needs** — auth storage (SecureStore), speech-to-text, image picker, local SQLite (v2 offline).
- **No native performance concerns** — journaling is text + lists, not games or AR.

## Consequences

- **Bridge / native quirks** occasionally leak into JS code (Android back button, iOS safe areas). Acceptable cost.
- **EAS Build** required for submitting to stores. Free tier is fine for v1.
- **If we ever need deep native features** (e.g. background audio recording with custom DSP), we'll add Expo dev client + native modules. Not expected for journaling.

## Revisit when

- Perf becomes a real issue (unlikely)
- The app needs a feature no Expo module supports and a native module is too heavy
