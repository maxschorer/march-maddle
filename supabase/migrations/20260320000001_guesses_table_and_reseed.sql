-- ============================================================
-- 1. Create guesses table
-- ============================================================
CREATE TABLE IF NOT EXISTS guesses (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  entity_id INTEGER NOT NULL,
  guess_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Derive guess_number automatically: count existing guesses for this game + 1
CREATE OR REPLACE FUNCTION set_guess_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guess_number := (
    SELECT COALESCE(MAX(guess_number), 0) + 1
    FROM guesses
    WHERE game_id = NEW.game_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_guess_number
  BEFORE INSERT ON guesses
  FOR EACH ROW
  EXECUTE FUNCTION set_guess_number();

-- RLS: users can only insert guesses for their own games
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own guesses"
  ON guesses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_id
        AND games.user_id = auth.uid()
        AND games.is_complete = false
    )
  );

CREATE POLICY "Users can read own guesses"
  ON guesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_id
        AND games.user_id = auth.uid()
    )
  );

-- ============================================================
-- 2. Auto-complete game when guess matches target or max guesses reached
-- ============================================================
CREATE OR REPLACE FUNCTION check_guess_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_target_entity_id INTEGER;
  v_max_guesses INTEGER;
  v_guess_count INTEGER;
  v_grid_id INTEGER;
  v_daily_target_id INTEGER;
BEGIN
  -- Get the game's target entity_id and grid_id
  SELECT
    (g.target_entity->>'entity_id')::INTEGER,
    g.grid_id,
    g.daily_target_id
  INTO v_target_entity_id, v_grid_id, v_daily_target_id
  FROM games g
  WHERE g.id = NEW.game_id;

  -- Get max guesses from the grid
  SELECT max_guesses INTO v_max_guesses
  FROM grids
  WHERE id = v_grid_id;

  -- Count guesses for this game (including the one just inserted)
  SELECT COUNT(*) INTO v_guess_count
  FROM guesses
  WHERE game_id = NEW.game_id;

  -- Check if the guess matches the target
  IF NEW.entity_id = v_target_entity_id THEN
    UPDATE games
    SET is_winner = true,
        is_complete = true,
        num_guesses = v_guess_count,
        updated_at = now()
    WHERE id = NEW.game_id;
  -- Check if max guesses reached
  ELSIF v_guess_count >= v_max_guesses THEN
    UPDATE games
    SET is_winner = false,
        is_complete = true,
        num_guesses = v_guess_count,
        updated_at = now()
    WHERE id = NEW.game_id;
  ELSE
    -- Just update the guess count
    UPDATE games
    SET num_guesses = v_guess_count,
        updated_at = now()
    WHERE id = NEW.game_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_guess_completion
  AFTER INSERT ON guesses
  FOR EACH ROW
  EXECUTE FUNCTION check_guess_completion();

-- ============================================================
-- 3. Remove guesses column from games, tighten RLS
-- ============================================================
ALTER TABLE games DROP COLUMN IF EXISTS guesses;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Users can insert their own games" ON games;
DROP POLICY IF EXISTS "Users can update their own games" ON games;

-- Users can create games (but not set score/winner/complete)
CREATE POLICY "Users can create own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read own games
-- (policy "Users can read own games" should already exist from tighten migration)

-- Users cannot directly update games — triggers handle completion
-- No UPDATE policy = no direct updates allowed

-- ============================================================
-- 4. Reseed daily targets: start 3/19, random entity assignment
-- ============================================================
DELETE FROM games; -- Clear all games (fresh start)
DELETE FROM daily_grid_entities WHERE grid_id = 1;

-- Insert 19 days of random targets (3/19 through 4/6)
-- Using a random shuffle of entity IDs 1-68
INSERT INTO daily_grid_entities (grid_id, entity_id, ds, number)
SELECT
  1 AS grid_id,
  entity_id,
  ('2026-03-19'::date + (row_number() OVER (ORDER BY random()) - 1) * INTERVAL '1 day')::date AS ds,
  row_number() OVER (ORDER BY random()) AS number
FROM (
  SELECT entity_id FROM grid_entities WHERE grid_id = 1 ORDER BY random() LIMIT 19
) sub;

-- ============================================================
-- 5. Update season_leaderboard view (no change needed, still works)
-- ============================================================
