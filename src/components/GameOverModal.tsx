'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { useGrid } from '@/contexts/GridContext';
import { useAuth } from '@/components/AppShell';
import { getSupabaseImageUrl } from '@/utils/storage';
import { getPerformanceEmoji } from '@/utils/emojiUtils';
import { abbreviateState } from '@/utils/stateAbbreviations';
import { createClient } from '@/lib/supabase/client';

interface GameOverModalProps {
  switchToDate: (date: string) => void;
}

const GameOverModal = ({ switchToDate: _switchToDate }: GameOverModalProps) => {
  const {
    showGameOver,
    setShowGameOver,
    gameWon,
    playMusic,
    targetEntity,
    shareResults,
    gameNumber,
    gameId,
    guesses,
  } = useGame();
  const { grid } = useGrid();
  const { user, signInWithGoogle, usernameModalOpen } = useAuth();
  const router = useRouter();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dbScore, setDbScore] = useState<{ score: number; streak: number } | null>(null);

  useEffect(() => {
    if (!showGameOver || !gameWon) {
      setDbScore(null);
      return;
    }

    if (!user || !gameId) {
      const unusedGuesses = grid.maxGuesses - guesses.length;
      const score = 100 + (20 * unusedGuesses) + 50 + 10;
      setDbScore({ score, streak: 1 });
      return;
    }

    const loadScore = async () => {
      const supabase = createClient();
      try {
        const { data } = await supabase
          .from('games')
          .select('score, streak')
          .eq('id', gameId)
          .single();

        if (data && data.score != null) {
          setDbScore({ score: data.score, streak: data.streak || 0 });
          return;
        }
      } catch {
        // fall through to client-side calculation
      }
      // Fallback: compute client-side (no same-day or streak info available)
      const unusedGuesses = grid.maxGuesses - guesses.length;
      const score = 100 + (20 * unusedGuesses);
      setDbScore({ score, streak: 0 });
    };

    loadScore();
  }, [showGameOver, gameWon, gameId, user, grid.maxGuesses, guesses.length]);

  useEffect(() => {
    if (playMusic && gameWon) {
      audioRef.current = new Audio('/sounds/one-shining-moment.mp3');
      audioRef.current.play();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playMusic, gameWon]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setShowGameOver(false);
  };

  if (!showGameOver) return null;
  if (!targetEntity) return null;
  if (usernameModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={handleClose}>
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="relative mb-4">
            <div className="text-center">
              <div className="text-5xl mb-2">
                {(() => {
                  const performanceEmoji = getPerformanceEmoji(
                    gameWon ? guesses.length : null,
                    grid.maxGuesses,
                    gameWon,
                    true
                  );
                  return performanceEmoji;
                })()}
              </div>
              <h2 className="text-lg font-bold">
                {gameWon ? "Congratulations! " : "Game over. "}
                March Maddle #{gameNumber} is
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-6 bg-white p-3 rounded-lg">
                {/* Team Image */}
                <div className="w-32 h-32 mx-auto mb-4">
                  <img
                    src={getSupabaseImageUrl("entities", targetEntity.imgPath)}
                    alt={targetEntity.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Team Name */}
                <h2 className="text-2xl font-bold text-center mb-4">{targetEntity.name}</h2>

                {/* Attributes Grid */}
                <div className="grid grid-cols-5 gap-4 w-full">
                  {grid.attributes.map(attr => {
                    const entityAttr = targetEntity.attributes.find(a => a.key === attr.key);
                    if (!entityAttr) return null;

                    return (
                      <div key={attr.key} className="flex flex-col items-center">
                        <span className="text-xs font-semibold mb-1">{attr.displayName}</span>
                        {attr.displayType === 'photo' && entityAttr.img_path ? (
                          <img
                            src={getSupabaseImageUrl("attributes", entityAttr.img_path)}
                            alt={entityAttr.value}
                            className="w-full h-auto object-contain"
                          />
                        ) : (
                          <span className="text-base">
                            {attr.key === 'state' ? abbreviateState(entityAttr.value) : entityAttr.value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
            </div>

            {/* Score breakdown */}
            {gameWon && dbScore && (() => {
              const unusedGuesses = grid.maxGuesses - guesses.length;
              const guessBonus = 20 * unusedGuesses;
              const streakBonus = 10 * dbScore.streak;
              const sameDayBonus = dbScore.score - 100 - guessBonus - streakBonus === 50;
              return (
                <div className="py-3 px-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Correct answer</span>
                      <span className="font-medium">+100</span>
                    </div>
                    {guessBonus > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{unusedGuesses} unused guess{unusedGuesses !== 1 ? 'es' : ''}</span>
                        <span className="font-medium">+{guessBonus}</span>
                      </div>
                    )}
                    {sameDayBonus && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Same-day bonus</span>
                        <span className="font-medium">+50</span>
                      </div>
                    )}
                    {streakBonus > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{dbScore.streak}-day streak</span>
                        <span className="font-medium">+{streakBonus}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-orange-500">{dbScore.score}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={shareResults}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-2xl transition duration-150 flex items-center justify-center"
            >
              Share 🏀
            </button>

            {user ? (
              <div className="flex gap-3">
                <button
                  onClick={() => { handleClose(); router.push('/leaderboard'); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-2xl transition duration-150 flex items-center justify-center"
                >
                  🏆 Standings
                </button>
                <button
                  onClick={() => { handleClose(); router.push('/season'); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-2xl transition duration-150 flex items-center justify-center"
                >
                  📅 Schedule
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-2xl transition duration-150 flex items-center justify-center"
              >
                Save Score
              </button>
            )}

            <p className="text-center text-gray-400 text-xs mt-1">
              Come back tomorrow for a new team!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
