import { describe, it, expect } from 'vitest';
import { calculateScore, getQualityLabel } from '../scoring';

describe('calculateScore', () => {
  it('returns 0 for a loss', () => {
    expect(calculateScore(6, false, true, 5)).toBe(0);
  });

  it('calculates base score of 100 for a win', () => {
    // 6 guesses, won, no same-day, no streak
    expect(calculateScore(6, true, false, 0)).toBe(100);
  });

  it('adds 20 per unused guess', () => {
    // 1 guess = 5 unused * 20 = 100 + 100 = 200
    expect(calculateScore(1, true, false, 0)).toBe(200);
    // 3 guesses = 3 unused * 20 = 100 + 60 = 160
    expect(calculateScore(3, true, false, 0)).toBe(160);
    // 6 guesses = 0 unused = 100
    expect(calculateScore(6, true, false, 0)).toBe(100);
  });

  it('adds 50 for same-day bonus', () => {
    expect(calculateScore(6, true, true, 0)).toBe(150);
  });

  it('adds 10 per streak day', () => {
    expect(calculateScore(6, true, false, 3)).toBe(130); // 100 + 30
    expect(calculateScore(6, true, false, 1)).toBe(110); // 100 + 10
  });

  it('combines all bonuses', () => {
    // 2 guesses (4 unused * 20 = 80), same-day (50), streak 5 (50)
    // 100 + 80 + 50 + 50 = 280
    expect(calculateScore(2, true, true, 5)).toBe(280);
  });

  it('perfect game: 1 guess, same-day, streak 10', () => {
    // 100 + 100 + 50 + 100 = 350
    expect(calculateScore(1, true, true, 10)).toBe(350);
  });
});

describe('getQualityLabel', () => {
  it('returns fire for 250+', () => {
    expect(getQualityLabel(250)).toBe('🔥');
    expect(getQualityLabel(300)).toBe('🔥');
  });

  it('returns lightning for 200-249', () => {
    expect(getQualityLabel(200)).toBe('⚡');
    expect(getQualityLabel(249)).toBe('⚡');
  });

  it('returns muscle for 150-199', () => {
    expect(getQualityLabel(150)).toBe('💪');
  });

  it('returns thumbs up for 100-149', () => {
    expect(getQualityLabel(100)).toBe('👍');
  });

  it('returns salute for 1-99', () => {
    expect(getQualityLabel(50)).toBe('🫡');
  });

  it('returns empty for 0', () => {
    expect(getQualityLabel(0)).toBe('');
  });
});
