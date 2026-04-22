# UX Specification — feelike

**Status:** Phase 1 locked — theme system is **Vibrant** (primary) with a matching dark mode. See `docs/themes/theme-system.html` for the renderable reference. Rationale in `docs/adr/005-theming-and-dark-mode.md`.

---

## Design principles

1. **Capture first, organize later.** The home screen is ALWAYS a text box. No "choose a type" gate. No mode switching.
2. **Every extra tap is a cost.** Before adding a control, ask if it's worth a tap. If in doubt, hide it behind a "more" affordance.
3. **Quiet, not noisy.** No gamification, no streaks, no "you missed a day" guilt. The app should feel like a friend's notebook, not a coach.
4. **Feel the emotion, don't analyze it.** Mood chips are emojis — not Likert scales, not sliders. Quick pick, move on.
5. **Privacy visually.** No "share" button on the capture screen. Entries look private by default.
6. **Mobile-first, one-handed.** Primary CTAs reachable by thumb. Text input auto-focuses on home-screen open.

---

## Screen inventory (v1)

### 1. Auth — Login / Signup
- Single screen with toggle between login/signup
- Fields: email, password (+ confirm on signup)
- Error states inline, not as popups
- Forgot-password link (deferred to v2 if reset flow is heavy)

### 2. Home — Capture
- Large editable text box, auto-focused
- Placeholder: rotating prompts — "What's on your mind?", "How are you feeling?", "Got an idea?"
- Below the text box: optional **mood chip row** (6-8 emojis, single select, deselectable)
- Optional **tag input** (autosuggest from user's past tags)
- **Save** button (primary, thumb-reachable)
- Small "Timeline" icon in top corner → opens Timeline

### 3. Timeline
- Reverse-chronological feed, grouped by day (Today / Yesterday / specific date)
- Each entry shows: text preview (2-3 lines), mood emoji if set, tags if set, time
- Tap → Entry Detail
- Pull-to-refresh
- Empty state: "No entries yet. Tap + to write your first."

### 4. Entry Detail
- Full entry text, editable
- Mood chips (edit)
- Tags (edit, add, remove)
- Timestamp (created + last edited)
- Delete (with confirm)

### 5. Settings
- Account email
- Log out
- Change password (v1 has this or defers — decide in Phase 2)
- **Appearance** — `auto / light / dark` mode picker (writes through `useTheme().setMode`)
- App version, privacy policy link (placeholder)

---

## Interaction rules

- **Save flow (v1):** tap Save → button shows spinner → request hits backend → on success, timeline updates + returns to home with empty textarea; on error, inline toast with retry, textarea content preserved. **No optimistic UI in v1** (implies local queueing → belongs with v2 offline support).
- **Drafts (v1):** if the user leaves the capture screen mid-typing, the draft is **kept in memory for the session only** — when the app is killed/reopened, the textarea is empty. Persistent drafts land in v2 with local storage.
- **Empty content:** Save is disabled when `content.trim().length === 0`. Tapping a disabled Save does nothing (no toast, no shake — just inert).
- **Mood chip toggle:** tapping a selected mood deselects it (entry saved with `mood = null`). Tapping a different mood switches selection. One mood max.
- **Keyboard behavior:** text box grows with content up to ~8 lines, then scrolls internally. Save button stays visible via `KeyboardAvoidingView` + a keyboard accessory bar on iOS.
- **Destructive actions:** no modals — use native iOS action sheet / Android dialog for delete confirmations.
- **Empty states are welcoming, not empty.** First-time users see a short hello + example prompt, not a blank screen.

---

## Design tokens

Two-layer system:

1. **Primitive palette** — the brand's paint box. Static. Change these to re-skin the whole app.
2. **Semantic tokens** — what things *mean* (`bg`, `surface`, `accent`, …). Components only reference these. Each mode (light / dark) maps semantic tokens to different primitives.

**Rule:** components never hardcode a hex value and never reference primitives directly. Only semantic tokens. This is what makes theme-switching work everywhere for free.

### Primitive palette

**Brand core**
| Name | Hex | Role |
|------|-----|------|
| `coral-50`  | `#FFE9ED` | lightest tint |
| `coral-100` | `#FFC8D1` | accent-muted (light) |
| `coral-300` | `#FF8A9D` | accent (dark, desaturated) |
| `coral-500` | `#FF5D73` | accent (light) — primary brand |
| `coral-600` | `#E64563` | accent hover (light) |
| `coral-700` | `#BF3551` | reserved |
| `peach-500` | `#FF9A6B` | CTA gradient stop |
| `indigo-500` | `#7F7FD5` | brand gradient stop (secondary) |
| `indigo-700` | `#5E5EBA` | reserved |
| `sky-500` | `#86A8E7` | secondary accent |
| `mint-500` | `#91EAE4` | reserved |

**Ink ramp** (neutrals — same ramp used in both modes, just mapped to different semantic slots)
| Name | Hex | Notes |
|------|-----|-------|
| `ink-50`  | `#F5F5F7` | dark-mode text-primary |
| `ink-100` | `#E8E8EE` | |
| `ink-200` | `#CDCDD7` | |
| `ink-300` | `#9B9BAD` | dark-mode text-secondary |
| `ink-400` | `#6E6E8A` | light-mode text-secondary |
| `ink-500` | `#4B4B64` | |
| `ink-700` | `#26262E` | dark-mode border |
| `ink-800` | `#16161C` | dark-mode surface |
| `ink-900` | `#0B0B0F` | dark-mode bg · light-mode text-primary |
| `ink-950` | `#050507` | deepest shadow |
| `white`   | `#FFFFFF` | |
| `off-white` | `#FAFAFF` | light-mode bg |

**Gradients (brand identity)**
| Name | Value | Use |
|------|-------|-----|
| `grad-primary`   | `135deg, #FF5D73 → #FF9A6B` | Primary CTA, active mood chip |
| `grad-secondary` | `135deg, #7F7FD5 → #86A8E7` | Secondary accents, empty states |
| `grad-brand`     | `135deg, #FF5D73 → #7F7FD5` | Logo, hero moments |

**Status colors**
| Name | Hex | Role |
|------|-----|------|
| `success-500` | `#4AC28A` | Save confirmation, positive states |
| `danger-500`  | `#E85D5D` | Delete, destructive |
| `warning-500` | `#F2B040` | Sync failure hints |

### Semantic tokens — mode maps

Components read only these names. Mode swap = one root class, all tokens re-resolve automatically.

| Semantic token | Light | Dark |
|----------------|-------|------|
| `bg` | `off-white` `#FAFAFF` | `ink-900` `#0B0B0F` |
| `bg-subtle` | `#F4F4FB` | `ink-800` `#16161C` |
| `surface` | `white` `#FFFFFF` | `ink-800` `#16161C` |
| `surface-raised` | `#FFFFFF` | `#1D1D24` |
| `surface-sunken` | `#F4F4FB` | `ink-900` `#0B0B0F` |
| `text-primary` | `ink-900` `#0B0B0F` | `ink-50` `#F5F5F7` |
| `text-secondary` | `ink-400` `#6E6E8A` | `ink-300` `#9B9BAD` |
| `text-muted` | `#9B9BAD` | `#5A5A63` |
| `text-on-accent` | `#FFFFFF` | `#FFFFFF` |
| `accent` | `coral-500` `#FF5D73` | `coral-300` `#FF8A9D` |
| `accent-hover` | `coral-600` `#E64563` | `coral-500` `#FF5D73` |
| `accent-muted` | `coral-100` `#FFC8D1` | `rgba(255,138,157,0.18)` |
| `accent-subtle` | `coral-50` `#FFE9ED` | `rgba(255,138,157,0.08)` |
| `border` | `#EDEDF5` | `#26262E` |
| `border-strong` | `#DADAEA` | `#32323C` |
| `divider` | `#F0F0F8` | `#1F1F26` |
| `success` | `#4AC28A` | `#5DD69F` |
| `danger` | `#E85D5D` | `#F07878` |
| `warning` | `#F2B040` | `#F5C061` |
| `overlay` | `rgba(11,11,15,0.5)` | `rgba(0,0,0,0.6)` |

**Tag palette** (semantic per-mode — used for mood/category tagging)
| Token | Light | Dark |
|-------|-------|------|
| `tag-pink-bg` / `tag-pink-ink` | `#FFE4EC` / `#C73E5A` | `rgba(255,93,115,.15)` / `#FFA3B2` |
| `tag-blue-bg` / `tag-blue-ink` | `#E4F3FF` / `#2D6FBF` | `rgba(134,168,231,.15)` / `#B6D0F0` |
| `tag-green-bg` / `tag-green-ink` | `#E8F6E4` / `#4A8E3A` | `rgba(145,234,228,.12)` / `#9ADDC8` |
| `tag-purple-bg` / `tag-purple-ink` | `#EEE4FF` / `#6B3FB8` | `rgba(127,127,213,.18)` / `#B9B9EA` |

### Shadows

| Token | Light | Dark |
|-------|-------|------|
| `shadow-sm` | `0 1px 3px rgba(127,127,213,0.08)` | `0 1px 3px rgba(0,0,0,0.4)` |
| `shadow-md` | `0 4px 14px rgba(127,127,213,0.10)` | `0 4px 14px rgba(0,0,0,0.5)` |
| `shadow-lg` | `0 10px 30px rgba(127,127,213,0.15)` | `0 10px 30px rgba(0,0,0,0.6)` |

### Typography

Single font family: **DM Sans** (weights 400 / 500 / 600 / 700 / 800). Loaded via `expo-font` once in `app/_layout.tsx`.

| Role | Size | Weight | Line height | Letter spacing |
|------|------|--------|-------------|----------------|
| `display` | 28 | 800 | 32 | -0.02em |
| `title`   | 18 | 700 | 24 | -0.01em |
| `body`    | 14 | 500 | 22 | 0 |
| `caption` | 11 | 700 | 14 | 0.08em (uppercase) |
| `mono`    | *(only used for timestamps/metadata — system monospace, not a custom font)* | | | |

### Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48`. Everything else snaps to these values.

### Border radii

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 8 | Small chips, inline pills |
| `radius-md` | 14 | Icon buttons, small cards |
| `radius-lg` | 20 | Entry cards, primary buttons |
| `radius-xl` | 24 | Textarea, modal surfaces |
| `radius-full` | 9999 | Tags, toggles, mood chips row |

### Motion

| Token | Value | Use |
|-------|-------|-----|
| `dur-fast` | 120ms | Hover, tap feedback |
| `dur-med`  | 220ms | Theme swap, entry transitions |
| `dur-slow` | 360ms | Save optimistic fade, success confirmations |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default easing |

**Theme swap specifics:** `bg`, `color`, `border-color` transition with `dur-med` + `ease-standard`. Shadows also transition to avoid pop.

### Mood chip spec

- Size: 52×52
- Radius: `radius-lg` (20)
- Default: `surface-sunken` background, no border
- Hover: `accent-subtle` background
- **Active (selected):**
  - `grad-primary` background, `text-on-accent` emoji
  - `scale(1.12) rotate(-4deg)` transform
  - `shadow: 0 6px 16px rgba(255,93,115,0.35)`
  - **Ring indicator (non-color signal):** 2px inset ring in `surface` color at the chip edge — provides shape contrast visible in high-contrast mode, B/W screenshots, and by users who can't distinguish the gradient color change.
  - **`accessibilityState={{ selected: true }}`** for VoiceOver/TalkBack.
  - **Tiny checkmark dot** (8px dot with 2px ring in `accent-hover`) in the bottom-right corner as a redundant visual cue.
- Spec-implementation note: the color-only state rule (see Accessibility section) requires at least two non-color signals on every stateful control. Active mood chips satisfy this via ring + dot + transform.

---

## Theming implementation (for Phase 2 scaffold)

**Note:** CSS variables and global stylesheets are web primitives. React Native doesn't run CSS. The implementation below uses a **plain JS theme object** passed via React Context, with NativeWind's `dark:` variant as the delivery mechanism. The design tokens above are identical to what the theme object holds — they're the single source of truth, just resolved in JS instead of CSS.

When the Expo app is scaffolded:

1. **One source of truth** — `app/src/theme/tokens.ts` exports three JS objects: `primitives` (the paint box), `lightTheme` (semantic → primitive mapping for light), `darkTheme` (same for dark). All values come from the tables above.
2. **ThemeProvider** — `app/src/theme/ThemeProvider.tsx` tracks user preference (`auto | light | dark`) in `AsyncStorage` (**not** `expo-secure-store` — theme is not a secret and SecureStore is slower and size-limited). It resolves to the active mode via `useColorScheme()` from React Native, then publishes the resolved theme object through `ThemeContext`.
3. **NativeWind `dark:` variant at the root** — `ThemeProvider` applies a root-level className (`dark` or empty) based on resolved mode. NativeWind's `dark:` class variant picks this up automatically — components style themselves with `className="bg-bg dark:bg-bg"` and NativeWind swaps values per mode.
4. **`tailwind.config.js` holds both color palettes side-by-side** — one entry per semantic token with a light default and a `dark` override. NativeWind resolves these at build time; no runtime CSS involved.
5. **Components** use semantic class names only — `className="bg-bg text-text-primary border-border"`. Never raw colors. Never primitives. The `dark:` prefix on each class is what flips the value.
6. **Dynamic (JS-consumed) values** — for places that need a color in JS (e.g. StatusBar, native modal tints, Skia canvas), components call `useTheme()` and read `theme.accent`, `theme.bg`, etc. The hook returns the fully-resolved theme object.
7. **First-render flicker** — read the saved preference in a blocking `useEffect` before `SplashScreen.hideAsync()`. This is an Expo-standard pattern; see `expo-splash-screen` docs.
8. **Re-skinning is still one file** — edit `primitives` in `tokens.ts` and every screen updates because both theme maps reference them.

### What we explicitly decided against

- **CSS variables + global.css** — doesn't work in RN. Rejected.
- **Tamagui or Restyle** — second theming system on top of NativeWind; redundant.
- **Storing theme in `expo-secure-store`** — non-secret data; use `AsyncStorage`.

---

## Accessibility (baseline)

- Minimum touch target 44×44 pt
- Text contrast ≥ 4.5:1 (WCAG AA)
- Support dynamic type (respect OS font size setting)
- VoiceOver/TalkBack labels on all icon-only buttons
- No color-only state indicators (pair with text or icon)

---

## Visual theme reference

The locked theme system is documented in `docs/themes/theme-system.html`. Open it in a browser and toggle light/dark at the top to see the full palette swap. This is the source of truth for the visual direction — the tokens in the section above are derived from it.

Four earlier exploration themes (calm-journal, modern-minimal, warm-diary, vibrant-expressive) were deleted once this direction was picked, per `docs/adr/005-theming-and-dark-mode.md`.
