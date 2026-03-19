# NFL Grid - Implementation Tracking

## Overview
NFL Players grid featuring current NFL players with team, position, and performance attributes.

## Target Attributes
- Team
- Position 
- College
- Seasons in NFL
- FPts

## Implementation Checklist

### 1. Initial Setup
- [x] Create Grid model in database
- [x] Add Grid image to Storage

### 2. Entity Data Setup
- [x] create ESPN client
- [x] get NFL player data
- [x] write logic to get all skill players currently on rosters
- [x] create dagster job with new source table (`src_espn_nfl_players`)
- [x] populate new table with skill players
- [x] insert NFL entities into table
- [x] create script to create ESPN entity images
  - [x] create espn directory and store images there
  - [x] also store images at {entity_id}.png

### 3. Get player seasons
- [x] create client call to get raw season data for individual player
- [x] add fantasy points calculate for 1/2 PPR points
- [x] write logic to get for all skill players on active rosters
- [x] create new source tables (`src_espn_nfl_players_seasons`)
- [x] populate stats for skill players

### 4. Get college metadata
- [x] create teams table migration with metadata (name, code, img_path, conference, division, sport)
- [x] update with NFL teams & add NFL team images
- [x] get access to college football API
- [x] adjust schema to work for college football (name, geo, team_name)
- [x] create script to load metadata and image into storage (teams/college/<school_code>)

### 5. Grid Setup
- [x] Develop grid entities query
- [x] INsert grid_entities

### 6. Testing & Launch
- [x] Test out grid in UI
  - [x] refactor getGrids to take a list of states
  - [x] have admin get all, historical get live + archived, home page get live + upcoming but 
- [x] create test targets for next week in DB
- [x] create NFL closeFunctions
  - [x] create sameCollegeConference method
  - [x] create sameNFLDivision method
  - [x] create within10 method
- [x] change victory audio based on grid
  - [x] get NFL audio
  - [x] update models with appropriate sound
  - [x] use audio based on model data

### 7. Create "New Grid" modal that flashes when player tries grid for first time
- [ ] show description
- [ ] description player pool
- [ ] dropdown to show sample players
- [ ] describe attributes


#### If Everything Looks Good:
- [ ] flip grid to live

#### Other
- [ ] show image attributes in the admin UI
- [ ] audit 2024 FPs to confirm they look right
- [ ] update ESPN player seasons logic to have non-null statistics
- [ ] finish backfilling college info
- [ ] wirte logic to get college photo as fallback for entity images
- [ ] create an information modal that adjusts for each contest
- [ ] add information to information modal (tagline, description, player_pool description, # entities, attributes & description)

## Implementation Notes

### Data Sources
- **Player Data**: NFL.com, ESPN API, or sports data provider
- **Team Logos**: NFL official assets
- **Player Photos**: Team websites or sports databases

### Technical Considerations
- **Attributes to implement**:
  - Team (dropdown with team logos)
  - Position (QB, RB, WR, etc.)
  - Jersey Number (number range)
  - Years in League (number range)
  - Division (AFC/NFC East/West/North/South)
  - Height (range in inches)
  - Draft Round (1-7, UDFA)

### Database Schema
```sql
-- Example grid entry
INSERT INTO grids (id, title, tagline, permalink, category, state)
VALUES (
  'nfl-players',
  'NFL Players', 
  'Guess the NFL player',
  'nfl',
  'Sports',
  'upcoming'
);
```

### Close Functions Needed
- Team exact match
- Division match (same division)
- Position group match (offense/defense/special teams)
- Height range (+/- 2 inches)
- Years range (+/- 2 years)
- Draft round exact match

## Status: 🚧 Planning

**Last Updated**: [Date]
**Assigned To**: [Name]
**Target Launch**: [Date]

---

## Completion Status

- [ ] **Phase 1**: Database Setup
- [ ] **Phase 2**: Entity Management  
- [ ] **Phase 3**: Image Assets
- [ ] **Phase 4**: Grid Configuration
- [ ] **Phase 5**: Testing
- [ ] **Phase 6**: Production Launch

✅ = Complete | 🚧 = In Progress | ❌ = Blocked | 📋 = Planning