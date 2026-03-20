import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localGridStorage } from '../gridStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('localGridStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('initGame', () => {
    it('creates a new game with empty guesses', async () => {
      const game = await localGridStorage.initGame(1, 100, 42);
      expect(game.id).toBe(100);
      expect(game.gridId).toBe(1);
      expect(game.guessedEntityIds).toEqual([]);
      expect(game.gameWon).toBe(false);
      expect(game.gameOver).toBe(false);
    });

    it('returns existing game if already initialized', async () => {
      const game1 = await localGridStorage.initGame(1, 100, 42);
      // Submit a guess to modify state
      await localGridStorage.submitGuess(100, 5);
      const game2 = await localGridStorage.initGame(1, 100, 42);
      expect(game2.guessedEntityIds).toEqual([5]);
      expect(game1.id).toBe(game2.id);
    });
  });

  describe('getGame', () => {
    it('returns null for non-existent game', async () => {
      const game = await localGridStorage.getGame(999);
      expect(game).toBeNull();
    });

    it('returns existing game', async () => {
      await localGridStorage.initGame(1, 100, 42);
      const game = await localGridStorage.getGame(100);
      expect(game).not.toBeNull();
      expect(game!.id).toBe(100);
    });
  });

  describe('submitGuess', () => {
    it('adds entity_id to guessedEntityIds', async () => {
      await localGridStorage.initGame(1, 100, 42);
      await localGridStorage.submitGuess(100, 5);

      const game = await localGridStorage.getGame(100);
      expect(game!.guessedEntityIds).toEqual([5]);
    });

    it('accumulates multiple guesses in order', async () => {
      await localGridStorage.initGame(1, 100, 42);
      await localGridStorage.submitGuess(100, 5);
      await localGridStorage.submitGuess(100, 10);
      await localGridStorage.submitGuess(100, 15);

      const game = await localGridStorage.getGame(100);
      expect(game!.guessedEntityIds).toEqual([5, 10, 15]);
    });

    it('throws for non-existent game', async () => {
      await expect(localGridStorage.submitGuess(999, 5)).rejects.toThrow('Game not found');
    });
  });
});
