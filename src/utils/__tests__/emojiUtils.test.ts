import { describe, it, expect } from 'vitest';
import { getPerformanceEmoji } from '../emojiUtils';

describe('getPerformanceEmoji', () => {
  it('returns empty for unplayed incomplete game', () => {
    expect(getPerformanceEmoji(null, 6, false, false)).toBe('');
  });

  it('returns thinking for in-progress game', () => {
    expect(getPerformanceEmoji(null, 6, false, false)).toBe('');
    // If numGuesses is set but not complete
    expect(getPerformanceEmoji(3, 6, false, false)).toBe('🤔');
  });

  it('returns woozy for loss', () => {
    expect(getPerformanceEmoji(null, 6, false, true)).toBe('🥴');
  });

  it('returns bullseye for 1 guess', () => {
    expect(getPerformanceEmoji(1, 6, true, true)).toBe('🎯');
  });

  it('returns cool for 2 guesses', () => {
    expect(getPerformanceEmoji(2, 6, true, true)).toBe('😎');
  });

  it('returns happy for 3-5 guesses', () => {
    expect(getPerformanceEmoji(3, 6, true, true)).toBe('😀');
    expect(getPerformanceEmoji(5, 6, true, true)).toBe('😀');
  });

  it('returns sweaty for 6 guesses', () => {
    expect(getPerformanceEmoji(6, 6, true, true)).toBe('😅');
  });
});
