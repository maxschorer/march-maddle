import { describe, it, expect } from 'vitest';

/**
 * Username toast visibility logic tests.
 * The toast shows when: user is logged in, has no username, and hasn't opted out of standings.
 * It can be dismissed by the user.
 */

interface Profile {
  username: string | null;
  leaderboard_opt_out: boolean;
}

function shouldShowUsernameToast(
  user: unknown | null,
  profile: Profile | null,
  dismissed: boolean
): boolean {
  if (!user || !profile) return false;
  if (profile.username) return false;
  if (profile.leaderboard_opt_out) return false;
  if (dismissed) return false;
  return true;
}

describe('username toast visibility', () => {
  const loggedInUser = { id: 'user-1' };

  it('shows for logged-in user without username', () => {
    const profile = { username: null, leaderboard_opt_out: false };
    expect(shouldShowUsernameToast(loggedInUser, profile, false)).toBe(true);
  });

  it('hides when user has a username', () => {
    const profile = { username: 'player1', leaderboard_opt_out: false };
    expect(shouldShowUsernameToast(loggedInUser, profile, false)).toBe(false);
  });

  it('hides when user opted out of standings', () => {
    const profile = { username: null, leaderboard_opt_out: true };
    expect(shouldShowUsernameToast(loggedInUser, profile, false)).toBe(false);
  });

  it('hides when dismissed', () => {
    const profile = { username: null, leaderboard_opt_out: false };
    expect(shouldShowUsernameToast(loggedInUser, profile, true)).toBe(false);
  });

  it('hides when not logged in', () => {
    const profile = { username: null, leaderboard_opt_out: false };
    expect(shouldShowUsernameToast(null, profile, false)).toBe(false);
  });

  it('hides when profile not loaded yet', () => {
    expect(shouldShowUsernameToast(loggedInUser, null, false)).toBe(false);
  });

  it('hides when user has username AND opted out', () => {
    const profile = { username: 'player1', leaderboard_opt_out: true };
    expect(shouldShowUsernameToast(loggedInUser, profile, false)).toBe(false);
  });
});
