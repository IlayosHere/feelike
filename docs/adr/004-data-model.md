# ADR 004 — Entry-centric Data Model

**Status:** Accepted
**Date:** 2026-04-21

## Context

The core data unit is what the user writes. Different journaling apps model this differently:
- **Category-first** — separate tables or types for "thought", "idea", "feeling", "todo". Forces the user to pick a type.
- **Entry-centric with optional metadata** — one table for all writes; mood and tags are optional metadata.
- **Event-log + enrichment** — store raw entries, derive categories via AI later.

## Decision

**Entry-centric with optional metadata.** One `entries` table. Each entry has required `content` (text) and optional `mood` (single value) and optional `tags` (many-to-many).

See `docs/data-model.md` for the full schema.

## Rationale

- **Matches the UX principle.** The home screen has one text box; forcing type selection in the DB would break the "capture first" rule.
- **Simpler queries.** Timeline = `SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC`.
- **Flexible tagging.** Users can evolve their own taxonomy (`#dating`, `#trading`, `#todo`, `#app-idea`). No schema change needed to support new categories.
- **AI-friendly (v3).** Categorization can be derived post-hoc by an AI pass. Storing the raw entry keeps future options open.

## Alternative rejected: category-first

Why not separate tables for thoughts vs ideas vs todos?
- Every screen would need a "which type is this?" picker → friction.
- Querying "show me everything from today" becomes a 3-way UNION.
- Users' real experiences span categories — "date went well" is a feeling AND a memory AND sometimes a question.

## Alternative rejected: separate "type" enum column

A middle ground would be `entries.type` with values `thought|idea|feeling|todo`. Rejected because:
- Still forces the user (or the client) to pick one, re-introducing friction.
- Tags already express type fluidly (`#idea`, `#todo`) without a hard schema constraint.
- Adding new types (e.g. `question`, `gratitude`) would require a migration.

## Consequences

- **No strict categorization.** If the user wants category-based views (e.g. "show me all my ideas"), they rely on tags. That's fine and intentional.
- **Mood is a single value, not multi-select.** An entry is "mostly happy" or "mostly sad". Rare edge cases (bittersweet) sacrifice some nuance for UX simplicity. Revisit if users complain.
- **Tags auto-create.** When the user types `#dating` for the first time, the backend creates the tag row. No separate "create tag" flow.

## Revisit when

- Users consistently ask for hard categories (unlikely given the design)
- We add structured data beyond text (e.g. photos, audio, todos with checkboxes) — at that point, consider polymorphic entries or a separate `attachments` table referencing `entries`.
