-- Drop the old passthrough view
DROP VIEW IF EXISTS public_games;

-- Create aggregated leaderboard view
CREATE OR REPLACE VIEW season_leaderboard AS
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
