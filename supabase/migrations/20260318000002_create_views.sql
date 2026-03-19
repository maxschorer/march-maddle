-- Create views to match table names expected by the app
CREATE OR REPLACE VIEW grid_entities AS SELECT * FROM entities;
CREATE OR REPLACE VIEW daily_targets AS SELECT * FROM daily_grid_entities;
