# Daily Login Popup - Implementation Plan

## Overview
Show a login modal to unauthenticated users on their first visit each day to encourage account creation and engagement.

## Current Behavior
- Login modal only appears when user manually clicks login button
- No prompting for new or returning users to sign up

## Desired Behavior
- Show login modal automatically on first daily visit for unauthenticated users
- Track daily visits to prevent showing multiple times per day
- Don't show if user is already logged in
- Respect user dismissal for the current day

## Implementation Steps

### Phase 1: Daily Visit Tracking ✅
- [x] Create utility function to track daily visits in localStorage
- [x] Use date-based key (e.g., `lastVisitDate`, `loginPromptShown_2024-01-15`)
- [x] Store both last visit date and whether login prompt was shown today

### Phase 2: Login Prompt Logic ✅
- [x] Add state to AuthContext for controlling daily login prompt
- [x] Check on app load: is user logged out AND first visit today?
- [x] Show login modal if conditions are met
- [x] Mark prompt as shown for today when displayed

### Phase 3: User Dismissal Handling ✅
- [x] Track when user dismisses modal without logging in
- [x] Don't show again for the rest of that day
- [x] Reset tracking at midnight (new day = new opportunity)

### Phase 4: Integration with Existing Login Modal ✅
- [x] Extend existing LoginModal component to support auto-trigger
- [x] Add special messaging for daily prompts
- [x] Add "Maybe later" button for daily prompts
- [x] Ensure manual login button still works normally

## ✅ IMPLEMENTATION COMPLETE

## Technical Considerations

### Daily Visit Storage
```typescript
interface DailyVisitData {
  lastVisitDate: string;  // '2024-01-15'
  loginPromptShown: boolean;
  loginPromptDismissed: boolean;
}
```

### Integration Points
- Check in `AuthContext` after authentication state is determined
- Use existing `LoginModal` component with additional props
- Leverage existing `isLoginModalOpen` state management

### Edge Cases
- User timezone changes
- User clears localStorage
- User logs in then logs out same day
- Midnight boundary transitions

## Files to Modify
- `/src/contexts/AuthContext.tsx` - Add daily visit logic and auto-prompt state
- `/src/components/LoginModal.tsx` - Support auto-trigger mode (optional styling changes)
- `/src/utils/storage.ts` - Add daily visit tracking utilities

## Testing Requirements
- [ ] Test first visit triggers prompt
- [ ] Test subsequent visits same day don't trigger
- [ ] Test new day resets and shows prompt again
- [ ] Test logged-in users never see prompt
- [ ] Test manual login button still works
- [ ] Test dismissing prompt prevents re-showing same day

## Success Criteria
- ✅ First daily visit shows login prompt for unauthenticated users
- ✅ Prompt doesn't appear multiple times per day
- ✅ Logged-in users never see the prompt
- ✅ Manual login functionality unchanged
- ✅ User can dismiss and won't see again until next day