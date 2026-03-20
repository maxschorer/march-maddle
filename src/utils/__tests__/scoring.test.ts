import { describe, it, expect } from 'vitest';
import { calculateScore, getQualityLabel } from '../scoring';

describe('calculateScore', () => {
  it('returns 0 for a loss', () => {
    expect(calculateScore(6, false, true, 5)).toBe(0);
    expect(calculateScore(1, false, false, 0)).toBe(0);
  });

  it('gives 100 base for a win', () => {
    // 6 guesses, no same-day, no streak
    expect(calculateScore(6, true, false, 0)).toBe(100);
  });

  it('gives 20 per unused guess', () => {
    // 1 guess = 5 unused = +100
    expect(calculateScore(1, true, false, 0)).toBe(200);
    // 3 guesses = 3 unused = +60
    expect(calculateScore(3, true, false, 0)).toBe(160);
    // 5 guesses = 1 unused = +20
    expect(calculateScore(5, true, false, 0)).toBe(120);
  });

  it('gives 50 same-day bonus', () => {
    expect(calculateScore(6, true, true, 0)).toBe(150);
    expect(calculateScore(6, true, false, 0)).toBe(100);
  });

  it('gives 10 * streak bonus', () => {
    expect(calculateScore(6, true, false, 1)).toBe(110);
    expect(calculateScore(6, true, false, 5)).toBe(150);
    expect(calculateScore(6, true, false, 10)).toBe(200);
  });

  it('combines all bonuses correctly', () => {
    // 2 guesses (4 unused=80), same-day (50), streak 3 (30) + base 100
    expect(calculateScore(2, true, true, 3)).toBe(260);
  });

  it('handles streak of 0', () => {
    expect(calculateScore(6, true, false, 0)).toBe(100);
  });

  it('perfect game: 1 guess, same day, streak 10', () => {
    // 100 + 100 + 50 + 100 = 350
    expect(calculateScore(1, true, true, 10)).toBe(350);
  });
});

describe('getQualityLabel', () => {
  it('returns empty for 0', () => {
    expect(getQualityLabel(0)).toBe('');
  });

  it('returns 🫡 for low scores', () => {
    expect(getQualityLabel(1)).toBe('🫡');
    expect(getQualityLabel(99)).toBe('🫡');
  });

  it('returns 👍 for 100-149', () => {
    expect(getQualityLabel(100)).toBe('👍');
    expect(getQualityLabel(149)).toBe('👍');
  });

  it('returns 💪 for 150-199', () => {
    expect(getQualityLabel(150)).toBe('💪');
    expect(getQualityLabel(199)).toBe('💪');
  });

  it('returns ⚡ for 200-249', () => {
    expect(getQualityLabel(200)).toBe('⚡');
    expect(getQualityLabel(249)).toBe('⚡');
  });

  it('returns 🔥 for 250+', () => {
    expect(getQualityLabel(250)).toBe('🔥');
    expect(getQualityLabel(500)).toBe('🔥');
  });
});
