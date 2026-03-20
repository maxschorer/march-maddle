import { GameState } from '@/types/Game';
import { Entity } from '@/types/Entity';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AppShell';

export interface GridStorageAPI {
  initGame: (gridId: number, targetEntity: Entity, dailyTargetId: number | null) => Promise<GameState>;
  getGame: (dailyTargetId: number) => Promise<GameState | null>;
  submitGuess: (gameId: number, entityId: number) => Promise<{ gameOver: boolean; gameWon: boolean }>;
}

const STORAGE_KEY = 'marchMaddleGameStates';

export const localGridStorage: GridStorageAPI = {
  async getGame(dailyTargetId: number): Promise<GameState | null> {
    const data = localStorage.getItem(STORAGE_KEY);
    const games: GameState[] = data ? JSON.parse(data) : [];
    return games.find((g) => g.id === dailyTargetId) || null;
  },
  async submitGuess(gameId: number, entityId: number): Promise<{ gameOver: boolean; gameWon: boolean }> {
    const data = localStorage.getItem(STORAGE_KEY);
    const games: GameState[] = data ? JSON.parse(data) : [];
    const game = games.find((g) => g.id === gameId);
    if (!game) throw new Error('Game not found');

    game.guessedEntityIds.push(entityId);

    // Check win
    if (entityId === game.targetEntity.entity_id) {
      game.gameWon = true;
      game.gameOver = true;
    } else if (game.guessedEntityIds.length >= 6) {
      game.gameWon = false;
      game.gameOver = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return { gameOver: game.gameOver, gameWon: game.gameWon };
  },
  async initGame(gridId: number, targetEntity: Entity, dailyTargetId: number | null): Promise<GameState> {
    const data = localStorage.getItem(STORAGE_KEY);
    const games: GameState[] = data ? JSON.parse(data) : [];
    const id = dailyTargetId ?? gridId;
    let gameState = games.find((g) => g.id === id);
    if (gameState) return gameState;
    gameState = { guessedEntityIds: [], id, gameWon: false, gameOver: false, gridId, targetEntity };
    games.push(gameState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return gameState;
  }
};

export const supabaseGridStorage: GridStorageAPI = {
  async getGame(dailyTargetId: number): Promise<GameState | null> {
    const supabase = createClient();
    // Get the game
    const { data: game, error } = await supabase
      .from('games')
      .select('id, target_entity, is_winner, is_complete, daily_target_id, grid_id')
      .eq('daily_target_id', dailyTargetId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!game) return null;

    // Get guesses for this game
    const { data: guesses } = await supabase
      .from('guesses')
      .select('entity_id')
      .eq('game_id', game.id)
      .order('guess_number', { ascending: true });

    return {
      id: game.id,
      guessedEntityIds: (guesses || []).map((g: { entity_id: number }) => g.entity_id),
      gameWon: game.is_winner,
      gameOver: game.is_complete,
      targetEntity: game.target_entity,
      gridId: game.grid_id,
    };
  },
  async submitGuess(gameId: number, entityId: number): Promise<{ gameOver: boolean; gameWon: boolean }> {
    const supabase = createClient();
    // Insert the guess — DB trigger handles guess_number, completion, scoring
    const { error } = await supabase
      .from('guesses')
      .insert({ game_id: gameId, entity_id: entityId });
    if (error) throw error;

    // Re-fetch the game to get updated state (trigger may have set is_complete)
    const { data: game } = await supabase
      .from('games')
      .select('is_winner, is_complete')
      .eq('id', gameId)
      .single();

    return {
      gameOver: game?.is_complete ?? false,
      gameWon: game?.is_winner ?? false,
    };
  },
  async initGame(gridId: number, targetEntity: Entity, dailyTargetId: number | null): Promise<GameState> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('games')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        daily_target_id: dailyTargetId,
        grid_id: gridId,
        target_entity: targetEntity,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      guessedEntityIds: [],
      gameWon: false,
      gameOver: false,
      targetEntity: data.target_entity,
      gridId: data.grid_id,
    };
  }
};

// Migrate localStorage game to Supabase after user signs up
export async function migrateLocalGame(dailyTargetId: number, gridId: number, targetEntity: Entity): Promise<GameState | null> {
  const data = localStorage.getItem(STORAGE_KEY);
  const games: GameState[] = data ? JSON.parse(data) : [];
  const localGame = games.find((g) => g.id === dailyTargetId);
  if (!localGame || localGame.guessedEntityIds.length === 0) return null;

  // Create the game in Supabase
  const supabase = createClient();
  const { data: newGame, error } = await supabase
    .from('games')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      daily_target_id: dailyTargetId,
      grid_id: gridId,
      target_entity: targetEntity,
    })
    .select()
    .single();
  if (error) throw error;

  // Insert all guesses in order
  for (const entityId of localGame.guessedEntityIds) {
    await supabase
      .from('guesses')
      .insert({ game_id: newGame.id, entity_id: entityId });
  }

  // Re-fetch to get final state (triggers ran)
  const { data: finalGame } = await supabase
    .from('games')
    .select('is_winner, is_complete')
    .eq('id', newGame.id)
    .single();

  // Clear from localStorage
  const updatedGames = games.filter((g) => g.id !== dailyTargetId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGames));

  return {
    id: newGame.id,
    guessedEntityIds: localGame.guessedEntityIds,
    gameWon: finalGame?.is_winner ?? false,
    gameOver: finalGame?.is_complete ?? false,
    targetEntity,
    gridId,
  };
}

export function useGridStorage(): GridStorageAPI {
  const { user } = useAuth();
  return user ? supabaseGridStorage : localGridStorage;
}
