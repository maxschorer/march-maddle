# Feature: Emoji Based on Number of Guesses

## Overview
Enhance the user experience by showing more nuanced emojis based on the number of guesses it took to solve the puzzle, providing better visual feedback about performance quality.

## Current State

### Historical Page (`/src/pages/HistoricalGrids.tsx`)
- 🙂 - Game not yet played
- 😎 - Completed and won (regardless of guess count)
- 😔 - Completed but failed
- 🤔 - Game in progress (incomplete)

### Share Results (`/src/contexts/GameContext.tsx`)
- Uses grid result emojis (🟩🟨⬜) for puzzle visualization
- Shows `${gameWon ? guesses.length : 'X'}/${maxGuesses}` in text format
- No status emoji based on performance

### GameOver Modal (`/src/components/GameOverModal.tsx`)
- No direct emoji display for performance
- Has Share button that triggers shareResults

## Proposed Changes

### New Emoji Mapping
Replace the simple win/loss emojis with performance-based emojis:

- **1-2 guesses**: 🎯 (Bullseye - Perfect/Excellent)
- **3-4 guesses**: 😎 (Cool - Great performance)  
- **5-6 guesses**: 😀 (Happy - Good performance)
- **7-8 guesses**: 😅 (Sweat smile - Close call)
- **X (failed)**: 🥴 (Woozy - Failed attempt)
- **Incomplete**: 🤔 (Thinking - Game in progress)
- **Not played**: No emoji (empty space)

### Implementation Requirements

#### 1. Create Utility Function
**File**: `/src/utils/emojiUtils.ts` (new file)
```typescript
export function getPerformanceEmoji(
  numGuesses: number | null, 
  maxGuesses: number, 
  isWinner: boolean, 
  isComplete: boolean
): string {
  // Not played - no emoji
  if (!numGuesses && !isComplete) return '';
  
  // Game in progress - thinking emoji
  if (!isComplete) return '🤔';
  
  // Failed game - woozy emoji
  if (!isWinner) return '🥴';
  
  // Won game - performance-based emoji
  if (numGuesses <= 2) return '🎯';
  if (numGuesses <= 4) return '😎';
  if (numGuesses <= 6) return '😀';
  if (numGuesses <= 8) return '😅';
  return '🥴'; // Fallback (shouldn't happen if isWinner is true)
}
```

#### 2. Update Historical Page
**File**: `/src/pages/HistoricalGrids.tsx`
**Lines**: 227-245

**Current Logic**:
```tsx
{!gameData.userGame ? (
  <span className="text-lg sm:text-2xl block text-left">🙂</span>
) : gameData.userGame.is_complete && gameData.userGame.is_winner ? (
  <div className="flex items-center justify-start space-x-1">
    <span className="text-lg sm:text-2xl">😎</span>
    <span className="font-medium text-green-600 text-xs sm:text-base whitespace-nowrap">
      ({gameData.userGame.num_guesses})
    </span>
  </div>
) : gameData.userGame.is_complete && !gameData.userGame.is_winner ? (
  <span className="text-lg sm:text-2xl block text-left">😔</span>
) : (
  <div className="flex items-center justify-start space-x-1">
    <span className="text-lg sm:text-2xl">🤔</span>
    <span className="font-medium text-orange-600 text-xs sm:text-base whitespace-nowrap">
      ({gameData.userGame.num_guesses})
    </span>
  </div>
)}
```

**New Logic**:
```tsx
{(() => {
  const emoji = gameData.userGame 
    ? getPerformanceEmoji(
        gameData.userGame.num_guesses, 
        selectedGrid?.maxGuesses || 8, 
        gameData.userGame.is_winner,
        gameData.userGame.is_complete
      )
    : ''; // No emoji for unplayed games

  const showGuessCount = gameData.userGame && (gameData.userGame.is_complete || gameData.userGame.num_guesses > 0);
  
  return emoji || showGuessCount ? (
    <div className="flex items-center justify-start space-x-1">
      {emoji && (
        <span className="text-lg sm:text-2xl">{emoji}</span>
      )}
      {showGuessCount && (
        <span className={`font-medium text-xs sm:text-base whitespace-nowrap ${
          gameData.userGame.is_complete
            ? gameData.userGame.is_winner ? 'text-green-600' : 'text-red-600'
            : 'text-orange-600'
        }`}>
          ({gameData.userGame.is_complete && !gameData.userGame.is_winner ? 'X' : gameData.userGame.num_guesses})
        </span>
      )}
    </div>
  ) : (
    <span className="text-lg sm:text-2xl block text-left"></span> // Empty space for unplayed
  );
})()}
```

#### 3. Update Share Results
**File**: `/src/contexts/GameContext.tsx`
**Lines**: 199-215

**Current shareResults function**:
```typescript
const text = `${grid.title} #${gameNumber}\n${gameWon ? guesses.length : 'X'}/${maxGuesses}\n\n${emoji}\n\nPlay at https://guessgrid.com/grid/${grid.permalink}!`;
```

**Enhanced shareResults function**:
```typescript
const performanceEmoji = getPerformanceEmoji(
  gameWon ? guesses.length : null, 
  maxGuesses, 
  gameWon, 
  true // Share is only called on completed games
);
const text = `${grid.title} #${gameNumber}\n${gameWon ? guesses.length : 'X'}/${maxGuesses} ${performanceEmoji}\n\n${emoji}\n\nPlay at https://guessgrid.com/grid/${grid.permalink}!`;
```

#### 4. Update GameOver Modal (Optional Enhancement)
**File**: `/src/components/GameOverModal.tsx`

Consider adding a performance emoji to the modal header or result display for immediate visual feedback.

### Data Requirements

#### Game Data Structure
Current data available:
- `gameData.userGame.num_guesses` - Number of guesses used
- `gameData.userGame.is_winner` - Whether the game was won
- `gameData.userGame.is_complete` - Whether the game is finished
- `grid.maxGuesses` - Maximum guesses allowed for the grid

All required data is already available in the existing data structures.

### Testing Requirements

#### Unit Tests
**File**: `/src/__tests__/utils/emojiUtils.test.ts` (new file)

Test cases needed:
- Verify correct emoji for each guess count range (1-2, 3-4, 5-6, 7-8)
- Verify failure emoji (🥴) for failed games
- Verify thinking emoji (🤔) for incomplete games
- Verify empty string for unplayed games
- Edge cases: 0 guesses, guesses > maxGuesses

#### Integration Tests
- Update existing HistoricalGrids tests to expect new emoji logic
- Test share functionality includes performance emoji
- Visual regression tests for historical page emoji display

### Migration Considerations

#### Backward Compatibility
- No database changes required
- Existing game data fully compatible
- No breaking changes to API

#### Deployment
- Safe to deploy immediately
- Progressive enhancement (won't break existing functionality)
- Users will see improved emoji feedback on next visit

### Success Metrics

#### User Experience
- More granular feedback on performance quality
- Immediate visual understanding of relative success
- Enhanced sharing appeal with performance indicator

#### Technical
- Zero breaking changes
- Consistent emoji usage across all three display contexts
- Maintainable utility function for future emoji needs

## Implementation Order

1. **Create utility function** (`emojiUtils.ts`)
2. **Update historical page** (most visible impact)
3. **Update share results** (viral sharing component)
4. **Add tests** (ensure reliability)
5. **Optional: Enhance GameOver modal**

## Future Enhancements

- Animated emoji transitions based on performance
- Grid-specific emoji themes (sports vs entertainment)
- Streak-based bonus emojis
- Achievement emojis for perfect scores