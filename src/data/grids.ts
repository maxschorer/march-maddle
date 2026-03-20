import { createClient } from '@/lib/supabase/client';
import { Grid, GridState, DisplayType } from '@/types/Grid';
import { getCloseFunction } from '@/utils/closeFunctions';

interface DbAttribute {
  key: string;
  displayName: string;
  displayType: DisplayType;
  closeFn: string | null;
  closeFnName: string | null;
  hasDirection?: boolean;
}

interface DbGrid {
  id: number;
  title: string;
  tagline: string;
  permalink: string;
  max_guesses: number;
  category: string;
  active: boolean;
  state: GridState;
  audio_file: string | null;
  created_at: string;
  updated_at: string;
  attributes: DbAttribute[];
}

function mapDbGridToGrid(dbGrid: DbGrid): Grid {
  return {
    id: dbGrid.id,
    title: dbGrid.title,
    tagline: dbGrid.tagline,
    permalink: dbGrid.permalink,
    maxGuesses: dbGrid.max_guesses,
    category: dbGrid.category,
    active: dbGrid.active,
    state: dbGrid.state,
    audio_file: dbGrid.audio_file,
    created_at: dbGrid.created_at,
    updated_at: dbGrid.updated_at,
    attributes: dbGrid.attributes.map((attr: DbAttribute) => ({
      ...attr,
      hasDirection: attr.hasDirection ?? false,
      closeFn: getCloseFunction(attr.closeFnName)
    }))
  };
}

export async function getGrids(states?: GridState[]): Promise<Grid[]> {
  const supabase = createClient();
  try {
    const { data: grids, error: gridsError } = await supabase
      .from('grids')
      .select('*')
      .order('id');

    if (gridsError) {
      throw new Error(`Error fetching grids: ${gridsError.message}`);
    }

    if (!grids || grids.length === 0) {
      throw new Error('No grids found');
    }

    const mappedGrids = grids.map(grid => mapDbGridToGrid(grid));

    if (!states || states.length === 0) {
      return mappedGrids;
    }

    return mappedGrids.filter(grid => states.includes(grid.state));
  } catch (error) {
    console.error('Failed to fetch grids:', error);
    throw error;
  }
}
