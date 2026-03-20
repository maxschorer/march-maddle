-- Add score, streak, and solved_same_day columns to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS solved_same_day BOOLEAN DEFAULT false;

-- Update the public_games view to include new columns
CREATE OR REPLACE VIEW public_games AS
  SELECT id, user_id, grid_id, daily_target_id,
         is_winner, is_complete, num_guesses, score, streak, solved_same_day,
         created_at, updated_at
  FROM games;

GRANT SELECT ON public_games TO authenticated, anon;
