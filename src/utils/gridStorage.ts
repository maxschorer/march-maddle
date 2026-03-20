import { GameState } from '@/types/Game';
import { Entity } from '@/types/Entity';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GridStorageAPI {
  initGame: (gridId: number, targetEntity: Entity, dailyTargetId: number | null) => Promise<GameState>;
  getGame: (dailyTargetId: number) => Promise<GameState | null>;
  updateGame: (gameState: GameState) => Promise<void>;
}

const STORAGE_KEY = 'marchMaddleGameStates';

export const localGridStorage: GridStorageAPI = {
  async getGame(dailyTargetId: number): Promise<GameState | null> {
    const data = localStorage.getItem(STORAGE_KEY);
    const games: GameState[] = data ? JSON.parse(data) : [];
    const gameState = games.find((g) => g.id === dailyTargetId);
    return gameState || null;
  },
  async updateGame(gameState: GameState): Promise<void> {
    const data = localStorage.getItem(STORAGE_KEY);
    const games: GameState[] = data ? JSON.parse(data) : [];
    let found = false;
    for (let i = 0; i < games.length; i++) {
      if (games[i].id === gameState.id) {
        games[i] = gameState;
        found = true;
        break;
      }
    }
    if (!found) {
      games.push(gameState);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return;
  },
  async initGame(gridId: number, targetEntity: Entity, dailyTargetId: number | null): Promise<GameState> {
    const data = localStorage.getItem(STORAGE_KEY);
    const games: GameState[] = data ? JSON.parse(data) : [];
    const id = dailyTargetId ?? gridId;
    let gameState = games.find((g) => g.id === id);
    if (gameState) return gameState;
    gameState = { guesses: [], id, gameWon: false, gameOver: false, gridId, targetEntity };
    games.push(gameState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return gameState;
  }
};

export const supabaseGridStorage: GridStorageAPI = {
  async getGame(dailyTargetId: number): Promise<GameState | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('games')
      .select('id, guesses, target_entity, is_winner, is_complete, daily_target_id, grid_id')
      .eq('user_id', userId)
      .eq('daily_target_id', dailyTargetId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return {
      id: data.id,
      guesses: data.guesses,
      gameWon: data.is_winner,
      gameOver: data.is_complete,
      targetEntity: data.target_entity,
      gridId: data.grid_id,
    };
  },
  async updateGame(gameState: GameState): Promise<void> {
    const supabase = createClient();
    const { guesses, gameWon, gameOver, id } = gameState;
    const { error } = await supabase
      .from('games')
      .update({
        guesses,
        is_winner: gameWon,
        is_complete: gameOver,
        num_guesses: guesses.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw error;
  },
  async initGame(gridId: number, targetEntity: Entity, dailyTargetId: number | null): Promise<GameState> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('games')
      .insert([{
        user_id: userId,
        daily_target_id: dailyTargetId,
        grid_id: gridId,
        target_entity: targetEntity,
      }])
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      guesses: data.guesses || [],
      gameWon: data.is_winner || false,
      gameOver: data.is_complete || false,
      targetEntity: data.target_entity,
      gridId: data.grid_id,
    };
  }
};

export function useGridStorage(): GridStorageAPI {
  const { user } = useAuth();
  return user ? supabaseGridStorage : localGridStorage;
}
