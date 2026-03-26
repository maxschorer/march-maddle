# TODOS

## Before Launch — DONE
*(These items have been completed. Kept for historical reference.)*

### ~~Tighten RLS on games table~~ ✅
Fixed by migration `20260320000002_fix_rls_policies.sql`. `target_entity` column dropped from games table. Owner-only reads on games. Leaderboard via `season_leaderboard` view.

### ~~Pre-deploy smoke test~~ ✅
App is live at marchmaddle.com. 64 teams seeded (First Four losers removed). Daily targets active. OG image deployed. Domain resolves.

### ~~Add unit tests for close functions~~ ✅
Tests exist in `src/utils/__tests__/closeFunctions.test.ts`.

## Platform — Before YCdle Launch

### Create launch playbook + templatized upload script
**Priority:** P1 — do immediately after March Maddle launch
**What:** Document the repeatable launch process: data format spec (JSON shape for a new game), generic upload script (currently hardcoded to March Maddle), post copy templates with fill-in-the-blanks, launch checklist (OG image, favicon, smoke test, post timing).
**Why:** This is the real platform investment. Makes launching YCdle take 1 day instead of 2 weeks. Process, not code.
**Effort:** S (human: ~1h / CC: ~15 min)
**Depends on:** Completing the March Maddle launch and seeing what worked.
**Context:** The upload script is at `scripts/upload-march-maddle.js`. The data format is in `march-maddle-data.json`. The grid/entity/daily_target data model is already generic.

### Multi-grid launcher + analytics
**Priority:** P1 — before YCdle launch
**What:** (a) Homepage that lists all active games instead of hardcoding `redirect('/grid/march-maddle')`. (b) Templatized upload script that works for any game. (c) UTM param tracking (`?utm_source=reddit`) + share click counting. (d) Daily player count dashboard (Supabase query or simple admin page).
**Why:** Platform infrastructure. Each new game should be a data upload, not a code change. Analytics lets you compare launch performance across games.
**Effort:** M (human: ~1 week / CC: ~30 min)
**Depends on:** Launch playbook being written first.
**Context:** `grids` table already supports multiple games via `permalink`, `category`, `attributes`. The gap is in the frontend (hardcoded redirect) and tooling (hardcoded upload script).

### Spoiler protection for daily_grid_entities
**Priority:** P2 — before next Reddit/HN launch
**What:** Add RLS policy on `daily_grid_entities` that only reveals rows where `ds < today` (past days). Create a server-side API route that serves today's puzzle attributes without exposing entity_id. Currently anyone with the Supabase anon key can query today's target and look up the answer.
**Why:** Real spoiler vector. Low risk for a small launch but grows with audience. Reddit/HN users are technically savvy and will find the API.
**Effort:** S (human: ~2h / CC: ~15 min)
**Depends on:** Nothing.
**Context:** RLS on `daily_grid_entities` is currently `FOR SELECT USING (true)`. The fix is straightforward — restrict to `ds <= current_date - 1` for anon, allow all for authenticated server-side calls.

## Post-Launch Polish

### Add error handling for Supabase game saves
**Priority:** Low — only affects authenticated users during outages
**What:** Wrap Supabase `updateGame` calls in GameContext with try/catch. Show toast on failure. Optionally fall back to localStorage.
**Why:** Currently fails silently. Logged-in user thinks game is saved but data is lost if network fails mid-guess.
**Context:** Local storage users are unaffected. Only impacts authenticated users. At <100 users on Supabase free tier, risk is minimal.
