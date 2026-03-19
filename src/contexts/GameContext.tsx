import React, { createContext, useContext, useState, useEffect } from 'react';
import { Entity } from '../types/Entity';
import { Grid } from '../types/Grid';
import { Guess } from '../types/Guess';
import { getTarget } from '../data/entities';
import { compareAttributes } from '../utils/gameUtils';
import { useGrid } from './GridContext';
import { localGridStorage } from '../utils/gridStorage';
import { getPerformanceEmoji } from '../utils/emojiUtils';
import { getPSTDate } from '../utils/dateUtils';

interface GameContextType {
  targetEntity: Entity | null;
  guesses: Guess[];
  currentGuess: Guess | null;
  gameOver: boolean;
  gameWon: boolean;
  showGameOver: boolean;
  gameNumber: number | null;
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

export function GameProvider({ children, gridEntities, grid, ds }: GameProviderProps) {
  const [targetEntity, setTargetEntity] = useState<Entity | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Guess | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameNumber, setGameNumber] = useState<number|null>(0);
  const [gameId, setGameId] = useState<number|null>(null);
  const [playMusic, setPlayMusic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { maxGuesses } = useGrid();

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
        
        if (gridEntities.length === 0) {
          return;
        }

        // Load today's target entity
        const target = await getTarget(gridEntities, grid.id, ds);
        if (!target || !target.entity) {
          return;
        }
        setTargetEntity(target.entity);
        setGameNumber(target.number);

        // Hydrate state from localStorage
        let savedState = await localGridStorage.getGame(target.id);
        if (!savedState) {
          savedState = await localGridStorage.initGame(grid.id, target.entity, target.id);
        }
        setGameId(savedState.id);
        if (savedState) {
          setGuesses(savedState.guesses);
          setGameOver(savedState.gameOver);
          setGameWon(savedState.gameWon);
          setCurrentGuess(
            savedState.guesses && savedState.guesses.length > 0
              ? savedState.guesses[savedState.guesses.length - 1]
              : null
          );
          setShowGameOver(savedState.gameOver);
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridEntities.length, grid.id, ds]);

  useEffect(() => {
    const updateGameState = async () => {
      if (!gameId || !grid.id || guesses.length === 0 || !targetEntity) return;
      await localGridStorage.updateGame({
        guesses,
        gameOver,
        gameWon,
        id: gameId,
        targetEntity,
        gridId: grid.id
      });
    };
    updateGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, guesses, gameOver, gameWon, grid.id]);

  const handleGuess = (entity: Entity) => {
    if (gameOver || !targetEntity) {
      return;
    }
    const comparison = compareAttributes(entity, targetEntity, grid.attributes);
    
    const newGuess: Guess = {
      entity,
      comparison
    };
    
    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setCurrentGuess(newGuess);
    
    if (entity.entity_id === targetEntity.entity_id) {
      setGameWon(true);
      setGameOver(true);
      setTimeout(() => {
        setShowGameOver(true);
        setPlayMusic(true);
      }, 3400);
    } else if (updatedGuesses.length >= maxGuesses) {
      setGameWon(false);
      setGameOver(true);
      setTimeout(() => {
        setShowGameOver(true);
      }, 3400);
    }
  };

  const shareResults = () => {
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
    
    const text = `March Maddle 🏀 #${gameNumber}\n${gameWon ? guesses.length : 'X'}/${maxGuesses} ${performanceEmoji}\n\n${emoji}\n\nPlay at https://marchmaddle.com!`;
    
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

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
