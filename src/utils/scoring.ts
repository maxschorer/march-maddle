/**
 * March Maddle Quality Score
 * 
 * Each game earns a quality score from 0-100.
 * The exact formula is intentionally hidden from players.
 * They just know: fewer guesses + faster + earlier = better.
 * 
 * Loss = 0.
 */

const MAX_GUESSES = 6;

// How many hours in a day the puzzle is available
const HOURS_IN_DAY = 24;

/**
 * Calculate quality score for a completed game.
 * 
 * @param numGuesses - Number of guesses taken (1-8)
 * @param won - Whether the player won
 * @param solveTimeMinutes - Minutes after midnight PST when solved
 * @param solveRank - Player's rank among all solvers (1 = first)
 * @param totalSolvers - Total number of solvers for this puzzle
 * @returns Quality score 0-100
 */
export function calculateQualityScore(
  numGuesses: number,
  won: boolean,
  solveTimeMinutes: number,
  solveRank: number,
  totalSolvers: number,
): number {
  if (!won) return 0;

  // Guess component (0-50)
  const guessScore = 50 * (1 - (numGuesses - 1) / (MAX_GUESSES - 1));

  // Time component (0-25) — exponential decay over 24 hours
  const hoursElapsed = Math.min(solveTimeMinutes / 60, HOURS_IN_DAY);
  const timeScore = 25 * Math.exp(-0.15 * hoursElapsed);

  // Rank component (0-25) — linear based on percentile
  const rankScore = totalSolvers > 1
    ? 25 * (1 - (solveRank - 1) / (totalSolvers - 1))
    : 25; // first (and only) solver gets full rank points

  return Math.round(guessScore + timeScore + rankScore);
}

/**
 * Get a vague quality label (no numbers, just vibes).
 */
export function getQualityLabel(score: number): string {
  if (score >= 90) return '🔥';
  if (score >= 75) return '⚡';
  if (score >= 50) return '💪';
  if (score >= 25) return '👍';
  if (score > 0) return '🫡';
  return '';
}

/**
 * Calculate guess-only points for immediate display in the game over modal.
 * This is a preview — final quality score includes time and rank,
 * which are calculated server-side at end of day.
 */
export function calculatePreviewScore(numGuesses: number, won: boolean): number {
  if (!won) return 0;
  return Math.round(50 * (1 - (numGuesses - 1) / (MAX_GUESSES - 1)));
}
