---
description: Scaffold a new React Native screen with route wiring and a basic test
---

Create a new screen in the feelike mobile app. Args: `$ARGUMENTS` = screen slug (e.g. `settings`, `entry-detail`).

## Steps

1. **Verify we're in Phase 2+** — the app/ folder must exist. If not, stop and tell the user we need to scaffold the Expo app first.
2. **Read `docs/ux-spec.md`** to understand the screen's design principles and which tokens to use.
3. **Create the screen file** at `app/src/screens/<slug>.tsx`:
   - Function component, TypeScript
   - Import and use current design tokens
   - Use `SafeAreaView` from `react-native-safe-area-context`
   - Include a placeholder title and empty body
4. **Wire routing** via Expo Router (`app/app/<slug>.tsx`) — thin default-export wrapper that re-exports the screen.
5. **Add a test file** at `app/src/screens/<slug>.test.tsx`:
   - Render the screen
   - Assert the title is visible
6. **Update `docs/ux-spec.md`** — add the new screen to the screen inventory if it's not already listed.
7. **Report** — files created, any follow-ups (e.g. "needs API integration before it does anything").

## Rules

- No business logic in the screen file yet. Keep it skeletal.
- Don't add navigation to this screen from elsewhere — that's a follow-up task.
- Don't invent design tokens — use existing ones from `docs/ux-spec.md`.
