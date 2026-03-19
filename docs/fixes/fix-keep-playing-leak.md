# Fix Keep Playing Target Entity Leak - Implementation Plan

## Overview
Fix the bug where clicking "Keep playing" briefly shows the previous game's target entity before loading the new game. Replace link-based navigation with state-based game switching and add proper loading states.

## Current Behavior
- "Keep playing" uses React Router Link to navigate
- Target entity from previous game leaks during transition
- Modal may show incorrect target briefly
- No loading state during game transition

## Desired Behavior
- "Keep playing" changes game state without navigation
- Modal closes before state change
- Loading state shows during target fetch
- Target entity never leaks between games

## Implementation Steps

### Phase 1: Add Loading State to GameContext ✅
- [x] Add `isLoading` state to GameContext
- [x] Set loading true when fetching new target
- [x] Set loading false when target fetch completes
- [x] Export loading state for components to use

### Phase 2: Update Keep Playing Button Logic ✅
- [x] Remove Link component from keep playing button
- [x] Add onClick handler to change game state
- [x] Close modal before switching games
- [x] Update URL manually without navigation

### Phase 3: Implement Game State Reset ✅
- [x] Create game state reset on ds change
- [x] Call reset when date string (ds) changes
- [x] Clear target entity during reset
- [x] Ensure modal stays closed during transition

### Phase 4: Add Loading UI to GameBoard ✅
- [x] Check loading state in Grid component
- [x] Show loading spinner when `isLoading` is true
- [x] Gray out game board during loading
- [x] Prevent interactions during loading state

### Phase 5: Fix Modal State Management ✅
- [x] Ensure showGameOver starts false for new games
- [x] Don't show modal until correct target loads
- [x] Add validation that target matches current ds
- [x] Handle edge case of navigating between completed games

## ✅ IMPLEMENTATION COMPLETE

## Technical Considerations

### Architecture
- Keep state management in GameContext
- Use URL for persistence but not navigation
- Ensure backward compatibility with direct URL access

### Performance
- Minimize re-renders during state transitions
- Debounce rapid game switches
- Preload next incomplete game data if possible

### Edge Cases
- User refreshes page during loading
- Network failure during target fetch
- Navigating between multiple completed games
- Direct URL access with ds parameter

## Files Modified
- `/src/contexts/GameContext.tsx` - Add loading state, reset function, fix initialization
- `/src/components/GameOverModal.tsx` - Replace Link with onClick handler
- `/src/pages/Grid.tsx` - Add loading UI overlay
- `/src/components/GameBoard.tsx` - Show loading state, disable interactions

## Testing Requirements
- [ ] Test keep playing doesn't leak target entity
- [ ] Test loading state appears during transition
- [ ] Test URL updates without page navigation
- [ ] Test direct URL access still works
- [ ] Test rapid clicking doesn't break state
- [ ] Test network failure handling

## Implementation Order
1. Add loading state to GameContext (foundation)
2. Implement reset function (prevent leaks)
3. Update keep playing button (fix navigation)
4. Add loading UI (user feedback)
5. Fix modal management (final polish)

## Success Criteria
- ✅ No target entity leak when switching games
- ✅ Smooth transition with loading indicator
- ✅ URL updates without page reload
- ✅ Modal closes cleanly before transition
- ✅ Loading state prevents user interactions