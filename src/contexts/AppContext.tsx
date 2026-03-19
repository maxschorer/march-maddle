import React, { createContext, useContext, useState, useEffect } from 'react';
import { Grid } from '../types/Grid';
import { getGrids } from '../data/grids';

interface AppContextType {
  grids: Grid[];
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [grids, setGrids] = useState<Grid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrids = async () => {
      try {
        setLoading(true);
        const allGrids = await getGrids(['live']);
        setGrids(allGrids);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grids');
        console.error('Error loading grids:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGrids();
  }, []);

  return (
    <AppContext.Provider value={{ grids, loading, error }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
