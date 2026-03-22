import { GameState } from '@/types/Game';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AppShell';

export interface GridStorageAPI {
  initGame: (gridId: number, dailyTargetId: number, targetEntityId: number, userId?: string) => Promise<GameState>;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return { gameOver: game.gameOver, gameWon: game.gameWon };
  },
  async initGame(gridId: number, dailyTargetId: number): Promise<GameState> {
    const data = localStorage.getItem(STORAGE_KEY);
    const games: GameState[] = data ? JSON.parse(data) : [];
    const id = dailyTargetId ?? gridId;
    let gameState = games.find((g) => g.id === id);
    if (gameState) return gameState;
    gameState = { guessedEntityIds: [], id, gameWon: false, gameOver: false, gridId };
    games.push(gameState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return gameState;
  }
};

export const supabaseGridStorage: GridStorageAPI = {
  async getGame(dailyTargetId: number): Promise<GameState | null> {
    const supabase = createClient();
    const { data: game, error } = await supabase
      .from('games')
      .select('id, is_winner, is_complete, daily_target_id, grid_id')
      .eq('daily_target_id', dailyTargetId)
      .maybeSingle();
    if (error) throw error;
    if (!game) return null;

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
      gridId: game.grid_id,
    };
  },
  async submitGuess(gameId: number, entityId: number): Promise<{ gameOver: boolean; gameWon: boolean }> {
    const supabase = createClient();
    const { error } = await supabase
      .from('guesses')
      .insert({ game_id: gameId, entity_id: entityId });
    if (error) throw error;

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
  async initGame(gridId: number, dailyTargetId: number, _targetEntityId: number, userId?: string): Promise<GameState> {
    const supabase = createClient();
    const uid = userId || (await supabase.auth.getUser()).data.user?.id;
    const { data, error } = await supabase
      .from('games')
      .insert({
        user_id: uid,
        daily_target_id: dailyTargetId,
        grid_id: gridId,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      guessedEntityIds: [],
      gameWon: false,
      gameOver: false,
      gridId: data.grid_id,
    };
  }
};

// Migrate ALL localStorage games to Supabase for a given user
export async function migrateAllLocalGames(userId: string): Promise<void> {
  console.log('[migration] checking localStorage for games to migrate, userId:', userId);
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    console.log('[migration] no localStorage data found');
    return;
  }
  console.log('[migration] raw localStorage:', data.substring(0, 200));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawGames: any[] = JSON.parse(data);
  if (rawGames.length === 0) return;

  console.log('[migration] found', rawGames.length, 'local games to migrate');

  const supabase = createClient();

  for (const localGame of rawGames) {
    // Handle both old format (guesses: Guess[]) and new format (guessedEntityIds: number[])
    let entityIds: number[] = localGame.guessedEntityIds || [];
    if (entityIds.length === 0 && Array.isArray(localGame.guesses)) {
      // Old format: extract entity_ids from Guess objects
      entityIds = localGame.guesses
        .map((g: { entity?: { entity_id: number } }) => g?.entity?.entity_id)
        .filter((id: number | undefined): id is number => id != null);
    }
    if (entityIds.length === 0) continue;

    const gameId = localGame.id;
    const gridId = localGame.gridId;

    try {
      console.log('[migration] migrating game', gameId, 'with', entityIds.length, 'guesses');

      // Check if game already exists in Supabase
      const { data: existing } = await supabase
        .from('games')
        .select('id')
        .eq('daily_target_id', gameId)
        .maybeSingle();

      if (existing) {
        console.log('[migration] game', gameId, 'already exists, skipping');
        continue;
      }

      // Create the game
      const { data: newGame, error } = await supabase
        .from('games')
        .insert({
          user_id: userId,
          daily_target_id: gameId,
          grid_id: gridId,
        })
        .select()
        .single();
      if (error) {
        console.error('[migration] failed to create game:', gameId, error);
        continue;
      }

      // Insert all guesses (triggers handle completion + scoring)
      for (const entityId of entityIds) {
        const { error: guessError } = await supabase
          .from('guesses')
          .insert({ game_id: newGame.id, entity_id: entityId });
        if (guessError) {
          console.error('[migration] failed to insert guess:', guessError);
        }
      }
      console.log('[migration] migrated game', gameId, 'successfully');
    } catch (err) {
      console.error('[migration] failed to migrate game:', gameId, err);
    }
  }

  // Clear localStorage after migration
  localStorage.removeItem(STORAGE_KEY);
}

// Migrate a single game and return its state
export async function migrateLocalGame(dailyTargetId: number, gridId: number, userId: string): Promise<GameState | null> {
  const data = localStorage.getItem(STORAGE_KEY);
  const games: GameState[] = data ? JSON.parse(data) : [];
  const localGame = games.find((g) => g.id === dailyTargetId);
  if (!localGame || !localGame.guessedEntityIds || localGame.guessedEntityIds.length === 0) return null;

  const supabase = createClient();
  const { data: newGame, error } = await supabase
    .from('games')
    .insert({
      user_id: userId,
      daily_target_id: dailyTargetId,
      grid_id: gridId,
    })
    .select()
    .single();
  if (error) return null;

  for (const entityId of localGame.guessedEntityIds) {
    await supabase
      .from('guesses')
      .insert({ game_id: newGame.id, entity_id: entityId });
  }

  const { data: finalGame } = await supabase
    .from('games')
    .select('is_winner, is_complete')
    .eq('id', newGame.id)
    .maybeSingle();

  // Remove this game from localStorage
  const updatedGames = games.filter((g) => g.id !== dailyTargetId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGames));

  return {
    id: newGame.id,
    guessedEntityIds: localGame.guessedEntityIds,
    gameWon: finalGame?.is_winner ?? false,
    gameOver: finalGame?.is_complete ?? false,
    gridId,
  };
}

export function useGridStorage(): GridStorageAPI {
  const { user } = useAuth();
  return user ? supabaseGridStorage : localGridStorage;
}
