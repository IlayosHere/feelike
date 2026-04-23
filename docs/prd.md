# Product Requirements — feelike

## Problem

Humans think a lot. Most of it is lost — good ideas evaporate, unresolved feelings linger, small todos get forgotten. Existing tools (Notes, journaling apps, note-takers) force a choice before writing: "is this a note or a task or a feeling?" That choice is friction, and friction kills the habit.

feelike removes that friction. One screen, one text box, write whatever is on your mind. Categorize later if you want. Look back whenever you want.

## Primary user

Initially: the author (Ilay). Extensible to other individuals who want a low-friction daily journal.

Profile:
- Has a phone on them constantly
- Experiences a wide range of things in a day (work wins/losses, social events, fleeting ideas, emotional highs/lows)
- Wants to process the day in writing but doesn't want to launch an app that asks 5 questions first
- Values privacy — these are personal thoughts

## Core user stories

Grounded in real examples from the author's day:

1. **"Date went well"** — open app, type how it went and how I feel, tap a happy mood chip, save. Maybe come back later and add `#dating` tag.
2. **"Got ghosted, feel bad"** — open app, type it out, maybe tap a sad mood chip, save. The act of writing itself is the value.
3. **"Trading win"** — open app, type what happened and the rush, tap excited, save. Maybe `#trading` tag.
4. **"Remember to buy spike ball"** — open app, type one line, save. No mood, no tag. 5 seconds total.

**Observation:** stories 1-3 are reflective and multi-sentence; story 4 is a 5-word note. Both must work on the same screen with no mode switching.

## v1 Scope (MVP)

**In:**
- Sign up / log in (email + password)
- Home = capture screen: large text box, optional mood chips (emoji row), optional tag input, save button
- Timeline: reverse-chronological list of my entries, grouped by day
- Entry detail: tap an entry to view/edit its text, mood, tags, or delete
- Cloud sync: entries saved to backend, visible on any device after login
- Basic settings: log out, change password, view account email

**Out (punt to later):**
- Search (v2)
- Voice-to-text (v2)
- Offline-first / local DB (v2)
- Photos / attachments (v2)
- AI summaries, pattern detection, weekly emails (v3)
- Sharing / social / export (v3+)
- Daily prompt notifications (v3)
- Widgets (v3)

## v2 Scope

- Full-text + tag search
- Voice-to-text via Expo SpeechToText
- Offline-first with local SQLite + sync reconciliation
- **Persistent drafts** (survive app kill/reopen) — piggybacks on the local SQLite layer
- **Optimistic UI for save** (add to timeline immediately, sync in background, rollback on error) — requires the local queue that v2 builds
- Photo attachments (Cloud Storage)
- Password reset flow (requires email delivery setup)
- Refresh-token endpoint + shorter JWT TTL

## v3 Scope

- AI weekly summary ("you felt anxious 4x this week, all Sundays")
- Pattern detection on moods + tags
- iOS/Android widgets for one-tap capture
- Export (JSON, Markdown)
- Daily gentle prompts

## Non-goals

- **Not a todo app.** Tasks are a side-effect of journaling, not the main thing. No due dates, no reminders in v1.
- **Not a social app.** Entries are private to the user. No sharing, no feed, no likes.
- **Not a wellness app.** No gamification, no streaks, no "you missed a day" shaming.
- **Not markdown-heavy.** Plain text first; rich formatting is a distraction from capture.

## Success criteria for v1

- The author uses it daily for 2 weeks without skipping
- Average entries/day ≥ 2
- Time from app-open to entry-saved ≤ 10 seconds for a one-liner

If those hold, v2 work is justified. If not, fix friction before adding features.
