import { createContext, useContext, useState, useEffect } from 'react';
import { Grid, GridAttribute } from '../types/Grid';
import { Entity } from '../types/Entity';
import { getAllEntities } from '../data/entities';

interface GridContextType {
  grid: Grid;
  entities: Entity[];
  loading: boolean;
  error: string | null;
  showHowToPlay: boolean;
  setShowHowToPlay: (show: boolean) => void;
  maxGuesses: number;
  attributes: GridAttribute[];
}

const GridContext = createContext<GridContextType | undefined>(undefined);

interface GridProviderProps {
  children: React.ReactNode;
  grid: Grid;
}

export function GridProvider({ children, grid }: GridProviderProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const { maxGuesses, attributes } = grid;

  useEffect(() => {
    const loadEntities = async () => {
      try {
        setLoading(true);
        const data = await getAllEntities(grid.id);
        setEntities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entities');
        console.error('Error loading entities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [grid.id, grid.permalink]);

  return (
    <GridContext.Provider value={{
      grid,
      entities,
      loading,
      error,
      showHowToPlay,
      setShowHowToPlay,
      maxGuesses,
      attributes
    }}>
      {children}
    </GridContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGrid() {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
} 