---
description: Open the locked theme system preview (light + dark toggle) in the default browser
---

Open `docs/themes/theme-system.html` so the user can visually reference the design tokens and preview the light/dark theme swap.

## Steps

1. **Check `docs/themes/theme-system.html` exists.** If not, tell the user the theme system hasn't been set up yet (Phase 1 artifact).
2. **On Windows**, open with PowerShell `Start-Process "<abs-path>"`.
   **On macOS**, use `open <path>`.
   **On Linux**, use `xdg-open <path>`.
3. **Report** — opened, plus a reminder that the toggle at the top of the page flips between light and dark mode.

## Rules

- This preview is the locked visual reference, not an exploration sandbox. Edits to the theme flow through `docs/ux-spec.md` + `docs/adr/005-theming-and-dark-mode.md`, with a new ADR if the decision changes materially.
- Don't edit the HTML from this command. Updates to the visual system go through the `ux-designer` agent.
