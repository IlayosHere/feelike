---
description: Run the Expo mobile app tests (Jest + RNTL), fix failures if small
---

Run the mobile app test suite for feelike.

## Steps

1. **Verify `app/` exists.** If not, tell the user the Expo app isn't scaffolded yet.
2. **cd into `app/`** (via absolute path) and run `npm test -- --watchAll=false` (or `yarn test`, whichever the project uses).
3. **If failures are minor** (obvious typo, missing mock, off-by-one assertion), fix and re-run.
4. **If failures are substantial** (real bug, design change needed), stop and report:
   - Which tests failed and why
   - Whether the production code or the test is wrong
   - Proposed fix (don't implement without user sign-off)
5. **If all green**, report the pass count and time.

## Rules

- Never use `--no-verify` or skip/disable failing tests to make the suite pass.
- Never delete a test without understanding what it was covering.
- If a test is genuinely flaky (fails intermittently, passes on rerun), report it — don't just retry until it passes.
