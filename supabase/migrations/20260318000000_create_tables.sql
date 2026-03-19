-- Core tables for March Maddle

-- Grids
CREATE TABLE IF NOT EXISTS grids (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  permalink TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  max_guesses INTEGER DEFAULT 6,
  attributes JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT false,
  state TEXT DEFAULT 'upcoming',
  audio_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entities (teams)
CREATE TABLE IF NOT EXISTS entities (
  entity_id SERIAL PRIMARY KEY,
  grid_id INTEGER REFERENCES grids(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  img_path TEXT,
  attributes JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_entities_grid_id ON entities(grid_id);

-- Daily target schedule
CREATE TABLE IF NOT EXISTS daily_grid_entities (
  id SERIAL PRIMARY KEY,
  grid_id INTEGER REFERENCES grids(id) ON DELETE CASCADE,
  entity_id INTEGER REFERENCES entities(entity_id) ON DELETE CASCADE,
  ds TEXT NOT NULL,
  number INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_grid_entities_grid_ds ON daily_grid_entities(grid_id, ds);

-- Games (user attempts)
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  grid_id INTEGER REFERENCES grids(id) ON DELETE CASCADE,
  daily_target_id INTEGER REFERENCES daily_grid_entities(id),
  target_entity JSONB,
  guesses JSONB DEFAULT '[]'::jsonb,
  is_winner BOOLEAN DEFAULT false,
  is_complete BOOLEAN DEFAULT false,
  num_guesses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_grid_id ON games(grid_id);
CREATE INDEX IF NOT EXISTS idx_games_daily_target_id ON games(daily_target_id);

-- Enable RLS on all tables
ALTER TABLE grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_grid_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Read access for everyone on public data
CREATE POLICY "Grids are viewable by everyone" ON grids FOR SELECT USING (true);
CREATE POLICY "Entities are viewable by everyone" ON entities FOR SELECT USING (true);
CREATE POLICY "Daily targets are viewable by everyone" ON daily_grid_entities FOR SELECT USING (true);
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);

-- Users can create and update their own games
CREATE POLICY "Users can insert own games" ON games FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own games" ON games FOR UPDATE USING (auth.uid() = user_id);

-- Anonymous games (user_id is null for non-logged-in users)
CREATE POLICY "Anon can insert games" ON games FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Anon can update games" ON games FOR UPDATE USING (user_id IS NULL);
