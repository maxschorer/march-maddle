import { GameState } from '../types/Game';
import { Entity } from '../types/Entity';

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
