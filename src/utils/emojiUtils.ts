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
  if (numGuesses <= 2) return '🎯';
  if (numGuesses <= 4) return '😎';
  if (numGuesses <= 6) return '😀';
  if (numGuesses <= 8) return '😅';
  return '🥴'; // Fallback (shouldn't happen if isWinner is true)
}