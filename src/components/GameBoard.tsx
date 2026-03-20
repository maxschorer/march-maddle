'use client';

import { useGame } from '@/contexts/GameContext';
import { useGrid } from '@/contexts/GridContext';
import BoardRow from './BoardRow';

const BoardHeader = () => {
  const { grid } = useGrid();
  const header = [
    { key: 'guess', name: 'Guess' },
    ...grid.attributes.map(attr => ({
      key: attr.key,
      name: attr.displayName
    }))
  ];
  return (
    <div className="grid grid-cols-6 text-center text-xs lg:text-sm font-bold">
      {header.map(attr => (
        <div key={attr.key} className="p-2 flex items-center justify-center">
          {attr.name}
        </div>
      ))}
    </div>
  );
};

const GameBoard = () => {
  const { guesses, gameOver } = useGame();
  const { maxGuesses } = useGrid();

  return (
    <div className="game-board w-full max-w-[600px] mx-auto space-y-1">
      <BoardHeader />
      {guesses.map((guess, index) => (
        <BoardRow
          key={index}
          guess={guess}
          isCurrentGuess={false}
        />
      ))}
      {[...Array(maxGuesses - guesses.length)].map((_, index) => (
        <BoardRow
          key={`empty-${index}`}
          guess={null}
          isCurrentGuess={index === 0 && !gameOver}
        />
      ))}
    </div>
  );
};

export default GameBoard;
