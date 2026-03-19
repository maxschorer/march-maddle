-- Tighten RLS on games table to prevent spoilers via API
-- The blanket SELECT policy exposes target_entity (today's answer) to anyone

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Games are viewable by everyone" ON games;

-- Users can only read their own games (needed for Season page, game state loading)
CREATE POLICY "Users can read own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

-- Create a public view for leaderboard queries (excludes sensitive columns)
CREATE OR REPLACE VIEW public_games AS
  SELECT id, user_id, grid_id, daily_target_id,
         is_winner, is_complete, num_guesses,
         created_at, updated_at
  FROM games;

-- Grant read access on the view to authenticated and anonymous users
GRANT SELECT ON public_games TO authenticated, anon;
