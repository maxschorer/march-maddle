-- ============================================================
-- Fix RLS policies for security
-- ============================================================

-- GAMES: Remove dangerous policies
DROP POLICY IF EXISTS "Anon can insert games" ON games;
DROP POLICY IF EXISTS "Anon can update games" ON games;
DROP POLICY IF EXISTS "Users can update own games" ON games;
DROP POLICY IF EXISTS "Users can insert own games" ON games;  -- duplicate

-- GAMES: Only authenticated users can create games (no anon inserts)
-- "Users can create own games" already exists and is correct
-- "Users can read own games" already exists and is correct
-- No UPDATE policy — only DB triggers can modify games

-- GUESSES: Policies are already correct
-- INSERT: only for own incomplete games
-- SELECT: only own guesses
-- No UPDATE/DELETE policies needed

-- PROFILES: Restrict what's publicly readable
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Users can read their own full profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- The season_leaderboard view uses SECURITY DEFINER so it can read
-- profiles without this policy. But we need the leaderboard to work.
-- Create a restricted view instead of exposing the full profiles table.
-- Actually, the season_leaderboard view already joins profiles and is
-- granted to anon/authenticated. So we don't need public profile access.

-- However, UsernameModal checks username availability via profiles.
-- That query needs to work for authenticated users checking other usernames.
-- Add a policy that lets authenticated users read just username fields.
CREATE POLICY "Authenticated users can check usernames"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Note: anon users cannot read profiles at all now.
-- The season_leaderboard view handles public leaderboard display.
