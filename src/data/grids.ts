import { supabase } from '../lib/supabase';
import { Grid, GridState } from '../types/Grid';
import { getCloseFunction } from '../utils/closeFunctions';

interface DbAttribute {
  key: string;
  displayName: string;
  displayType: string;
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

// Helper function to convert database grid to Grid type
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
      closeFn: getCloseFunction(attr.closeFnName)
    }))
  };
}

// Function to get grids filtered by state
export async function getGrids(states?: GridState[]): Promise<Grid[]> {
  try {
    // Query all grids without filtering by active status
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
    
    // If no states provided, return all grids
    if (!states || states.length === 0) {
      return mappedGrids;
    }
    
    // Filter grids by the provided states
    return mappedGrids.filter(grid => states.includes(grid.state));
  } catch (error) {
    console.error('Failed to fetch grids:', error);
    throw error;
  }
}

// Interface for creating a new grid
export interface CreateGridData {
  title: string;
  tagline: string;
  permalink?: string;
  category: string;
  maxGuesses?: number;
  attributes?: DbAttribute[];
  audioFile?: string | null;
}

// Create a new grid in the database
export async function createGrid(gridData: CreateGridData): Promise<Grid> {
  try {
    // Use provided permalink
    const permalink = gridData.permalink || '';
    
    // Check if permalink already exists
    const { data: existingGrid, error: checkError } = await supabase
      .from('grids')
      .select('id')
      .eq('permalink', permalink)
      .single();
    
    if (existingGrid && !checkError) {
      throw new Error(`A grid with permalink "${permalink}" already exists`);
    }
    
    // Create grid in database
    const { data, error } = await supabase
      .from('grids')
      .insert({
        title: gridData.title,
        tagline: gridData.tagline,
        permalink,
        category: gridData.category,
        max_guesses: gridData.maxGuesses || 6,
        attributes: gridData.attributes || [],
        active: false,
        state: 'upcoming',
        audio_file: gridData.audioFile || null
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating grid: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Failed to create grid - no data returned');
    }
    
    return mapDbGridToGrid(data);
  } catch (error) {
    console.error('Failed to create grid:', error);
    throw error;
  }
}
