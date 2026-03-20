export function getPerformanceEmoji(
  numGuesses: number | null,
  maxGuesses: number,
  isWinner: boolean,
  isComplete: boolean
): string {
  // Not played - no emoji
  if (!numGuesses && !isComplete) return '';

  // Game in progress - thinking emoji
  if (!isComplete) return '🤔';

  // Failed game - woozy emoji
  if (!isWinner) return '🥴';

  // Won game - performance-based emoji
  if (numGuesses === 1) return '🎯';
  if (numGuesses === 2) return '😎';
  if (numGuesses !== null && numGuesses <= 5) return '😀';
  if (numGuesses === 6) return '😅';
  return '🥴'; // Fallback (shouldn't happen if isWinner is true)
}
