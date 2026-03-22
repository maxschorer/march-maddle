-- ============================================================
-- Remove First Four losers from the game pool
-- Keep them in entities table but exclude from grid_entities view
-- and remove from daily_grid_entities (schedule)
-- ============================================================

-- 1. Update grid_entities view to exclude First Four losers
-- They stay in the entities table for historical reference
CREATE OR REPLACE VIEW grid_entities AS
SELECT * FROM entities
WHERE name NOT IN ('UMBC', 'NC State', 'Lehigh', 'SMU');

-- 2. Remove any daily_grid_entities entries for these teams
-- This removes them from the schedule so they won't be a daily target
-- Note: if games reference these daily_target_ids, the FK is nullable
-- so we delete the daily target and orphan any existing games
DELETE FROM daily_grid_entities
WHERE entity_id IN (
  SELECT entity_id FROM entities
  WHERE name IN ('UMBC', 'NC State', 'Lehigh', 'SMU')
);

-- 3. Remove the First Four day (March 17) from the schedule
-- Tournament field of 64 starts March 18
DELETE FROM daily_grid_entities
WHERE ds = '2026-03-17';

-- 4. Renumber remaining days starting from 1
-- March 18 = Day 1, April 6 = Day 20
UPDATE daily_grid_entities
SET number = (
  SELECT row_number
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY ds) as row_number
    FROM daily_grid_entities
    WHERE grid_id = 1
  ) sub
  WHERE sub.id = daily_grid_entities.id
)
WHERE grid_id = 1;
