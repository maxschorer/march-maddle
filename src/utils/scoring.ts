/**
 * March Maddle Scoring
 *
 * - 100 points for a correct answer
 * - 20 points for each unused guess (maxGuesses - numGuesses)
 * - 50 points same-day bonus
 * - 10 * streak bonus
 */

const MAX_GUESSES = 6;

/**
 * Calculate score for a completed game.
 */
export function calculateScore(
  numGuesses: number,
  won: boolean,
  sameDayBonus: boolean,
  streak: number,
): number {
  if (!won) return 0;

  const base = 100;
  const guessBonus = 20 * (MAX_GUESSES - numGuesses);
  const dayBonus = sameDayBonus ? 50 : 0;
  const streakBonus = 10 * streak;

  return base + guessBonus + dayBonus + streakBonus;
}

/**
 * Get a quality label emoji based on score.
 */
export function getQualityLabel(score: number): string {
  if (score >= 250) return '🔥';
  if (score >= 200) return '⚡';
  if (score >= 150) return '💪';
  if (score >= 100) return '👍';
  if (score > 0) return '🫡';
  return '';
}
