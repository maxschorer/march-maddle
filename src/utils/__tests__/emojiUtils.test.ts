import { describe, it, expect } from 'vitest';
import { getPerformanceEmoji } from '../emojiUtils';

describe('getPerformanceEmoji', () => {
  it('returns empty for not played', () => {
    expect(getPerformanceEmoji(null, 6, false, false)).toBe('');
  });

  it('returns 🤔 for in progress', () => {
    expect(getPerformanceEmoji(null, 6, false, false)).toBe('');
    // numGuesses is truthy but not complete
    expect(getPerformanceEmoji(3, 6, false, false)).toBe('🤔');
  });

  it('returns 🥴 for a loss', () => {
    expect(getPerformanceEmoji(null, 6, false, true)).toBe('🥴');
    expect(getPerformanceEmoji(6, 6, false, true)).toBe('🥴');
  });

  it('returns 🎯 for 1-2 guesses', () => {
    expect(getPerformanceEmoji(1, 6, true, true)).toBe('🎯');
    expect(getPerformanceEmoji(2, 6, true, true)).toBe('🎯');
  });

  it('returns 😎 for 3-4 guesses', () => {
    expect(getPerformanceEmoji(3, 6, true, true)).toBe('😎');
    expect(getPerformanceEmoji(4, 6, true, true)).toBe('😎');
  });

  it('returns 😀 for 5-6 guesses', () => {
    expect(getPerformanceEmoji(5, 6, true, true)).toBe('😀');
    expect(getPerformanceEmoji(6, 6, true, true)).toBe('😀');
  });
});
