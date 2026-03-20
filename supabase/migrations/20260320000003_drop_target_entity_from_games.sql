-- Remove target_entity JSONB from games — it leaks the answer.
-- The target is derived from daily_target_id → daily_grid_entities → grid_entities.
ALTER TABLE games DROP COLUMN IF EXISTS target_entity;

-- Update the completion trigger to look up target from daily_grid_entities
CREATE OR REPLACE FUNCTION check_guess_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_target_entity_id INTEGER;
  v_max_guesses INTEGER;
  v_guess_count INTEGER;
  v_grid_id INTEGER;
BEGIN
  -- Get the target entity_id from daily_grid_entities
  SELECT dge.entity_id, g.grid_id
  INTO v_target_entity_id, v_grid_id
  FROM games g
  JOIN daily_grid_entities dge ON dge.id = g.daily_target_id
  WHERE g.id = NEW.game_id;

  -- Get max guesses from the grid
  SELECT max_guesses INTO v_max_guesses
  FROM grids WHERE id = v_grid_id;

  -- Count guesses for this game
  SELECT COUNT(*) INTO v_guess_count
  FROM guesses WHERE game_id = NEW.game_id;

  -- Check if the guess matches the target
  IF NEW.entity_id = v_target_entity_id THEN
    UPDATE games
    SET is_winner = true, is_complete = true,
        num_guesses = v_guess_count, updated_at = now()
    WHERE id = NEW.game_id;
  ELSIF v_guess_count >= v_max_guesses THEN
    UPDATE games
    SET is_winner = false, is_complete = true,
        num_guesses = v_guess_count, updated_at = now()
    WHERE id = NEW.game_id;
  ELSE
    UPDATE games
    SET num_guesses = v_guess_count, updated_at = now()
    WHERE id = NEW.game_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
