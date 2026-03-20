'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Entity } from '@/types/Entity';
import { Grid } from '@/types/Grid';
import { Guess } from '@/types/Guess';
import { getTarget } from '@/data/entities';
import { compareAttributes } from '@/utils/gameUtils';
import { useGrid } from './GridContext';
import { useGridStorage, migrateLocalGame } from '@/utils/gridStorage';
import { useAuth } from '@/components/AppShell';
import { getPerformanceEmoji } from '@/utils/emojiUtils';
import { createClient } from '@/lib/supabase/client';

interface GameContextType {
  targetEntity: Entity | null;
  guesses: Guess[];
  currentGuess: Guess | null;
  gameOver: boolean;
  gameWon: boolean;
  showGameOver: boolean;
  gameNumber: number | null;
  gameId: number | null;
  ds: string;
  isLoading: boolean;
  setShowGameOver: (show: boolean) => void;
  handleGuess: (entity: Entity) => void;
  shareResults: () => void;
  playMusic: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: React.ReactNode;
  gridEntities: Entity[];
  grid: Grid;
  ds: string;
}

// Convert guessedEntityIds to full Guess objects with comparisons
function buildGuesses(guessedEntityIds: number[], gridEntities: Entity[], targetEntity: Entity, grid: Grid): Guess[] {
  return guessedEntityIds.map(entityId => {
    const entity = gridEntities.find(e => e.entity_id === entityId);
    if (!entity) return null;
    return {
      entity,
      comparison: compareAttributes(entity, targetEntity, grid.attributes),
    };
  }).filter((g): g is Guess => g !== null);
}

export function GameProvider({ children, gridEntities, grid, ds }: GameProviderProps) {
  const [targetEntity, setTargetEntity] = useState<Entity | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Guess | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameNumber, setGameNumber] = useState<number | null>(0);
  const [gameId, setGameId] = useState<number | null>(null);
  const [playMusic, setPlayMusic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { maxGuesses } = useGrid();
  const gridStorage = useGridStorage();
  const { user } = useAuth();

  // Reset game state when date changes
  useEffect(() => {
    setShowGameOver(false);
    setPlayMusic(false);
    setTargetEntity(null);
    setGuesses([]);
    setCurrentGuess(null);
    setGameOver(false);
    setGameWon(false);
  }, [ds]);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);

        if (gridEntities.length === 0) return;

        const target = await getTarget(gridEntities, grid.id, ds);
        if (!target || !target.entity) return;

        setTargetEntity(target.entity);
        setGameNumber(target.number);

        // If user just signed in, try migrating localStorage game
        let savedState = null;
        if (user) {
          savedState = await gridStorage.getGame(target.id);
          if (!savedState) {
            // Try migrating from localStorage
            savedState = await migrateLocalGame(target.id, grid.id, target.entity);
          }
          if (!savedState) {
            savedState = await gridStorage.initGame(grid.id, target.entity, target.id);
          }
        } else {
          savedState = await gridStorage.getGame(target.id);
          if (!savedState) {
            savedState = await gridStorage.initGame(grid.id, target.entity, target.id);
          }
        }

        setGameId(savedState.id);

        // Build full Guess objects from entity IDs
        const fullGuesses = buildGuesses(savedState.guessedEntityIds, gridEntities, target.entity, grid);
        setGuesses(fullGuesses);
        setGameOver(savedState.gameOver);
        setGameWon(savedState.gameWon);
        setCurrentGuess(fullGuesses.length > 0 ? fullGuesses[fullGuesses.length - 1] : null);
        setShowGameOver(savedState.gameOver);
      } catch (error) {
        console.error('Failed to initialize game:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridEntities.length, grid.id, ds, user?.id]);

  const handleGuess = async (entity: Entity) => {
    if (gameOver || !targetEntity || !gameId) return;

    // Compute comparison for UI
    const comparison = compareAttributes(entity, targetEntity, grid.attributes);
    const newGuess: Guess = { entity, comparison };
    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setCurrentGuess(newGuess);

    // Submit to storage (DB trigger handles completion for logged-in users)
    try {
      const result = await gridStorage.submitGuess(gameId, entity.entity_id);
      if (result.gameWon) {
        setGameWon(true);
        setGameOver(true);
        setTimeout(() => {
          setShowGameOver(true);
          setPlayMusic(true);
        }, 3400);
      } else if (result.gameOver) {
        setGameWon(false);
        setGameOver(true);
        setTimeout(() => {
          setShowGameOver(true);
        }, 3400);
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
    }
  };

  const shareResults = async () => {
    const supabase = createClient();
    const emoji = guesses.map(guess => {
      return guess.comparison.map(result => {
        switch (result.match) {
          case 'exact': return '🟩';
          case 'close': return '🟨';
          default: return '⬜';
        }
      }).join('');
    }).join('\n');

    const performanceEmoji = getPerformanceEmoji(
      gameWon ? guesses.length : null,
      maxGuesses,
      gameWon,
      true
    );

    let score = 0;
    if (gameWon && gameId) {
      try {
        const { data } = await supabase
          .from('games')
          .select('score')
          .eq('id', gameId)
          .single();
        score = data?.score || 0;
      } catch {
        // score column may not exist yet
      }
    }

    const scoreLine = gameWon ? `\nScore: ${score}` : '';
    const guessLine = `\n${gameWon ? guesses.length : 'X'}/${maxGuesses} ${performanceEmoji}`;
    const text = `March Maddle 🏀 #${gameNumber}${scoreLine}${guessLine}\n\n${emoji}\n\nPlay at https://marchmaddle.com!`;

    navigator.clipboard.writeText(text)
      .then(() => alert('Results copied to clipboard!'))
      .catch(console.error);
  };

  return (
    <GameContext.Provider value={{
      targetEntity,
      guesses,
      currentGuess,
      gameOver,
      gameWon,
      showGameOver,
      gameNumber,
      gameId,
      ds,
      isLoading,
      playMusic,
      setShowGameOver,
      handleGuess,
      shareResults
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
