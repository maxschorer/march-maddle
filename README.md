# GuessGrid

A daily guessing game where players try to identify target entities based on attribute comparisons. Think Wordle meets sports/entertainment trivia.

## 🎮 How to Play
- Each day features a new target (NBA player, movie, etc.)
- Make guesses and get feedback on attribute matches:
  - 🟩 Exact match
  - 🟨 Close match  
  - ⬜ No match
- Win by guessing the correct target!

## 🚀 Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Testing**: Vitest

## 📋 PROJECT PLAN

### 🚀 Launch Checklist
- [ ] Clean up auth flow
- [ ] Design and add logo
- [ ] Implement tawk.to
- [ ] Add PostHog tracking and create initial user dashboard
- [ ] Deploy Dagster
- [ ] Deploy dbt
- [ ] Add NBA League, Blockbusters, YC, and Love Island grids

### 🐛 Bugs
- [ ] the keep playing button seems broken
- [ ] instead of navigating to URL, let's the target entity on keep playing and manually tweak the url

### Auth Changes
- [ ] have Google Oauth say GuessGrid instead of database name
- [ ] have a popup show up the first time a user sees the site that day
- [ ] repoit nba-dle.com to GuessGrid

### Logo
- [ ] create major guessgrid logo
- [ ] create icon logo

### 📚 Learning
- [ ] what's a 406 error?
- [ ] read https://www.anthropic.com/engineering/claude-code-best-practices
- [ ] finish https://www.youtube.com/watch?v=Lh_X32t9_po&ab_channel=Every

### 🔧 Refactor
- [ ] revisit imports on historical page, probably don't need to do two of them

### 🎯 New Grids
- [ ] Add "NBA League" grid type
- [ ] Add "Blockbusters" grid type (movies + box office)
- [ ] Add "YC Companies" grid type
- [ ] Add "Love Island" grid type
- [ ] Create ETL / entity lists + attribute schema for each

### 📞 Add back tawk.to

### 📊 Set up Posthog analytics

### 🔊 Better sounds for gameplay

### 📦 BACKLOG
- [ ] fix Oauth for Gmail to say Guessgrid (not raw url)
- [ ] figure out favicon
- [ ] handle loading better (don't have 0 flash for daily number)
- [ ] limit local storage to last 100 games (something like that)

## ✅ Recent Completions

### Keep Playing Feature
- Added smart modal messaging that directs users to incomplete historical targets
- Shows "Keep playing!" button linking to first incomplete puzzle
- Only shows "Come back tomorrow" when all targets are complete
- Documentation: `/docs/feature-keep-playing.md`

### Game Completion Bug Fixes
- Fixed `is_winner` and `is_complete` database update issues
- Resolved Jest/Vitest compatibility problems
- Fixed boolean value handling in storage functions

### UI Improvements
- Updated header styling (green theme)
- Enhanced GameOverModal with streak information
- Improved button layouts and styling
- Added date-specific messaging for historical games

## 🏗️ Architecture

### Key Components
- **GameContext**: Manages game state, win detection, and persistence
- **AppContext**: Handles global state (grids, streaks, user data)
- **GridStorage**: Abstracts game persistence (Supabase + localStorage fallback)
- **Historical Data**: Manages completion tracking and target suggestions

### Database Schema
- **grids**: Grid definitions and metadata
- **daily_targets**: Daily puzzle targets for each grid
- **games**: User game sessions and completion status
- **streaks**: User streak tracking per grid
- **grid_entities**: Entities available in each grid

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📝 Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 Features
- ✅ Daily puzzles with historical access
- ✅ User authentication and progress tracking
- ✅ Streak tracking and celebration
- ✅ Smart "keep playing" suggestions
- ✅ Responsive design
- ✅ Share functionality
- ✅ Multiple grid types (NBA, etc.)