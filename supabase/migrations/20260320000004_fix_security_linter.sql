-- ============================================================
-- Fix SECURITY DEFINER views
-- ============================================================

DROP VIEW IF EXISTS daily_targets;

CREATE OR REPLACE VIEW grid_entities WITH (security_invoker = true) AS
  SELECT * FROM entities;

-- season_leaderboard: plain view, no SECURITY DEFINER
DROP VIEW IF EXISTS season_leaderboard;
CREATE VIEW season_leaderboard AS
  SELECT
    g.user_id,
    p.username,
    g.grid_id,
    SUM(g.score)::BIGINT AS total_score
  FROM games g
  JOIN profiles p ON p.id = g.user_id
  WHERE g.is_complete = true
    AND p.username IS NOT NULL
    AND p.leaderboard_opt_out = false
  GROUP BY g.user_id, p.username, g.grid_id
  ORDER BY total_score DESC;

GRANT SELECT ON season_leaderboard TO authenticated, anon;

-- Authenticated users can read completed games (for leaderboard view)
CREATE POLICY "Authenticated can read completed games"
  ON games FOR SELECT
  TO authenticated
  USING (is_complete = true);

-- ============================================================
-- Fix function search_path for SECURITY DEFINER functions
-- ============================================================
ALTER FUNCTION handle_new_user() SET search_path = public;
ALTER FUNCTION compute_game_score() SET search_path = public;
ALTER FUNCTION set_guess_number() SET search_path = public;
ALTER FUNCTION check_guess_completion() SET search_path = public;
