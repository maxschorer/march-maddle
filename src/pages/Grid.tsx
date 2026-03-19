import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { GridProvider, useGrid } from '../contexts/GridContext';
import { GameProvider, useGame } from '../contexts/GameContext';
import { useApp } from '../contexts/AppContext';
import GameBoard from '../components/GameBoard';
import GameOverModal from '../components/GameOverModal';
import GameHeader from '../components/GameHeader';
import { getPSTDate } from '../utils/dateUtils';

function GameContent({ switchToDate }: { switchToDate: (date: string) => void }) {
  const { isLoading } = useGame();

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-40">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading game...</p>
          </div>
        </div>
      )}
      <div className={`w-full p-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <GameHeader />
        <GameBoard />
      </div>
      <GameOverModal switchToDate={switchToDate} />
    </div>
  );
}

function GridContent() {
  const { entities, grid } = useGrid();
  const [searchParams, setSearchParams] = useSearchParams();
  const ds = searchParams.get('ds') || getPSTDate();

  const switchToDate = (date: string) => {
    setSearchParams({ ds: date });
  };

  return (
    <GameProvider gridEntities={entities} grid={grid} ds={ds}>
      <GameContent switchToDate={switchToDate} />
    </GameProvider>
  );
}

export default function Grid() {
  const { permalink } = useParams<{ permalink: string }>();
  const { grids, loading } = useApp();
  
  const grid = grids.find(g => g.permalink === permalink);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!grid) {
    return <Navigate to="/" replace />;
  }

  return (
    <GridProvider grid={grid}>
      <GridContent />
    </GridProvider>
  );
}
