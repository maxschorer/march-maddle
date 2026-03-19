/**
 * March Maddle Scoring System
 * 
 * Points per game:
 * - Base:        100 points for a correct answer
 * - Guess bonus: +20 per unused guess (max 140 for a 1-guess win with 8 max)
 * - Speed bonus: Based on completion rank among all solvers that day
 *   - Top 10%:  +50 points
 *   - Top 25%:  +25 points  
 *   - Top 50%:  +10 points
 *   - Bottom 50%: +0 points
 * - Loss: 0 points
 * 
 * Max possible: 290 points (1-guess win, top 10% speed)
 * Min win: 100 points (8-guess win, bottom 50%)
 */

export const MAX_GUESSES = 8;
export const BASE_POINTS = 100;
export const GUESS_BONUS_PER_UNUSED = 20;
export const SPEED_TIERS = [
  { threshold: 0.10, bonus: 50 },  // top 10%
  { threshold: 0.25, bonus: 25 },  // top 25%
  { threshold: 0.50, bonus: 10 },  // top 50%
];

export function calculateGuessPoints(numGuesses: number, won: boolean): number {
  if (!won) return 0;
  const guessBonus = (MAX_GUESSES - numGuesses) * GUESS_BONUS_PER_UNUSED;
  return BASE_POINTS + guessBonus;
}

export function calculateSpeedBonus(rank: number, totalSolvers: number): number {
  if (totalSolvers === 0) return 0;
  const percentile = rank / totalSolvers;
  for (const tier of SPEED_TIERS) {
    if (percentile <= tier.threshold) return tier.bonus;
  }
  return 0;
}

export function calculateTotalPoints(numGuesses: number, won: boolean, rank: number, totalSolvers: number): number {
  const guessPoints = calculateGuessPoints(numGuesses, won);
  const speedBonus = won ? calculateSpeedBonus(rank, totalSolvers) : 0;
  return guessPoints + speedBonus;
}

export function getSpeedLabel(rank: number, totalSolvers: number): string {
  if (totalSolvers === 0) return '';
  const percentile = rank / totalSolvers;
  if (percentile <= 0.10) return '⚡ Lightning';
  if (percentile <= 0.25) return '🏃 Fast';
  if (percentile <= 0.50) return '👍 Solid';
  return '';
}
