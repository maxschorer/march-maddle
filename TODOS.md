# TODOS

## Before Launch

### Tighten RLS on games table
**Priority:** High — do before sharing publicly
**What:** Replace blanket `FOR SELECT USING (true)` on games table with a policy that hides `target_entity` and `guesses` from non-owners. Leaderboard queries only need `is_winner`, `num_guesses`, `user_id`, `daily_target_id`.
**Why:** Current policy lets anyone query the Supabase API to see today's answer from completed games' `target_entity` field. Spoiler vector when shared on Reddit.
**How:** Create a Supabase database function or use column-level security. Simplest approach: create a `leaderboard_games` view that excludes sensitive columns, and restrict the base table to owner-only reads.
**Context:** RLS policies are in `migrations/000_create_tables.sql` line 70. The anon insert/update policies (lines 77-78) are separate and acceptable for now.

### Pre-deploy smoke test
**Priority:** High — do before first deploy
**What:** Verify before pushing: (a) Supabase DB has all 68 teams seeded, (b) today's daily target exists in `daily_targets` view, (c) Vercel project is connected to repo with correct env vars, (d) `marchmaddle.com` domain resolves (or update share text to use Vercel URL).
**Why:** Codex review flagged that the launch plan assumes infrastructure works without verifying it.
**Context:** Share text in `GameContext.tsx` hardcodes `marchmaddle.com`. If domain isn't configured, shared links are dead.

## After Launch

### Add unit tests for close functions and quality score
**Priority:** Medium — core game correctness
**What:** Vitest tests for `closeFunctions.ts` (`sameMarchMadnessConference`, `sameStateRegion`, `within2`, `within10`) and quality score calculation.
**Why:** These pure functions determine clue colors (green/yellow/gray). Wrong clues = broken game. Zero tests exist currently.
**How:** Vitest is already configured. Test each close function with known team pairs. Test quality score with edge cases (win on guess 1 = 100, lose = 0).
**Depends on:** Nothing — Vitest ready to go.

### Add error handling for Supabase game saves
**Priority:** Low — only affects authenticated users during outages
**What:** Wrap Supabase `updateGame` calls in GameContext with try/catch. Show toast on failure. Optionally fall back to localStorage.
**Why:** Currently fails silently. Logged-in user thinks game is saved but data is lost if network fails mid-guess.
**Context:** Local storage users are unaffected. Only impacts authenticated users. At <100 users on Supabase free tier, risk is minimal.
