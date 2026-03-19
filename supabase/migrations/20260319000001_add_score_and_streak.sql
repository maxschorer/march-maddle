-- Add score and streak columns to games
ALTER TABLE games ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- Function to compute score and streak when a game completes
CREATE OR REPLACE FUNCTION public.compute_game_score()
RETURNS TRIGGER AS $$
DECLARE
  puzzle_ds TEXT;
  solve_date_pt TEXT;
  is_same_day BOOLEAN;
  prev_streak INTEGER;
  prev_ds TEXT;
  max_guesses_val INTEGER;
  computed_streak INTEGER;
  computed_score INTEGER;
BEGIN
  -- Only run when game is being marked complete
  IF NOT NEW.is_complete OR (OLD IS NOT NULL AND OLD.is_complete) THEN
    RETURN NEW;
  END IF;

  -- Not a winner = 0 score, 0 streak
  IF NOT NEW.is_winner THEN
    NEW.score := 0;
    NEW.streak := 0;
    RETURN NEW;
  END IF;

  -- Get the puzzle date (ds) for this daily target
  SELECT ds INTO puzzle_ds
  FROM daily_grid_entities
  WHERE id = NEW.daily_target_id;

  IF puzzle_ds IS NULL THEN
    NEW.score := 0;
    NEW.streak := 0;
    RETURN NEW;
  END IF;

  -- Check same-day: convert updated_at to Pacific Time and compare date
  solve_date_pt := (NEW.updated_at AT TIME ZONE 'America/Los_Angeles')::date::text;
  is_same_day := solve_date_pt = puzzle_ds;

  -- Get max_guesses from the grid
  SELECT max_guesses INTO max_guesses_val
  FROM grids
  WHERE id = NEW.grid_id;

  max_guesses_val := COALESCE(max_guesses_val, 6);

  -- Compute streak (only if solved same day)
  computed_streak := 0;
  IF is_same_day THEN
    -- Find the user's most recent prior completed winning game (by puzzle date)
    SELECT g.streak, dge.ds
    INTO prev_streak, prev_ds
    FROM games g
    JOIN daily_grid_entities dge ON dge.id = g.daily_target_id
    WHERE g.user_id = NEW.user_id
      AND g.grid_id = NEW.grid_id
      AND g.is_complete = true
      AND g.is_winner = true
      AND g.id != NEW.id
      AND dge.ds < puzzle_ds
    ORDER BY dge.ds DESC
    LIMIT 1;

    IF prev_ds IS NOT NULL AND (puzzle_ds::date - prev_ds::date) = 1 AND prev_streak > 0 THEN
      computed_streak := prev_streak + 1;
    ELSE
      computed_streak := 1;
    END IF;
  END IF;

  -- Compute score: 100 + 20*(unused guesses) + 50*(same day) + 10*(streak)
  computed_score := 100
    + 20 * (max_guesses_val - NEW.num_guesses)
    + CASE WHEN is_same_day THEN 50 ELSE 0 END
    + 10 * computed_streak;

  NEW.score := computed_score;
  NEW.streak := computed_streak;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: runs BEFORE UPDATE so we can modify NEW
DROP TRIGGER IF EXISTS compute_score_on_complete ON games;
CREATE TRIGGER compute_score_on_complete
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_game_score();

-- Also handle INSERT (for cases where game is created already complete)
DROP TRIGGER IF EXISTS compute_score_on_insert ON games;
CREATE TRIGGER compute_score_on_insert
  BEFORE INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_game_score();
