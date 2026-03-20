'use client';

import { useGame } from '@/contexts/GameContext';
import { useGrid } from '@/contexts/GridContext';

function GameHeader() {
  const { grid } = useGrid();
  const { gameNumber } = useGame();

  return (
    <header className="w-full flex justify-center mb-4">
      <h1 className="text-2xl font-bold text-center">
        {grid.title} #{gameNumber}
      </h1>
    </header>
  );
}

export default GameHeader;
