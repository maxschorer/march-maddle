-- Add solved_same_day column to games
ALTER TABLE games ADD COLUMN IF NOT EXISTS solved_same_day BOOLEAN DEFAULT false;

-- Update compute_game_score to set solved_same_day
CREATE OR REPLACE FUNCTION compute_game_score()
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
  IF NOT NEW.is_complete OR (OLD IS NOT NULL AND OLD.is_complete) THEN
    RETURN NEW;
  END IF;

  IF NOT NEW.is_winner THEN
    NEW.score := 0;
    NEW.streak := 0;
    NEW.solved_same_day := false;
    RETURN NEW;
  END IF;

  SELECT ds INTO puzzle_ds
  FROM daily_grid_entities
  WHERE id = NEW.daily_target_id;

  IF puzzle_ds IS NULL THEN
    NEW.score := 0;
    NEW.streak := 0;
    NEW.solved_same_day := false;
    RETURN NEW;
  END IF;

  solve_date_pt := (NEW.updated_at AT TIME ZONE 'America/Los_Angeles')::date::text;
  is_same_day := solve_date_pt = puzzle_ds;
  NEW.solved_same_day := is_same_day;

  SELECT max_guesses INTO max_guesses_val
  FROM grids WHERE id = NEW.grid_id;
  max_guesses_val := COALESCE(max_guesses_val, 6);

  computed_streak := 0;
  IF is_same_day THEN
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

  computed_score := 100
    + 20 * (max_guesses_val - NEW.num_guesses)
    + CASE WHEN is_same_day THEN 50 ELSE 0 END
    + 10 * computed_streak;

  NEW.score := computed_score;
  NEW.streak := computed_streak;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
