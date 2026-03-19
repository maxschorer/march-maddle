import { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { useGrid } from '../contexts/GridContext';
import { getSupabaseImageUrl } from '../utils/storage';
import { getPerformanceEmoji } from '../utils/emojiUtils';

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
    guesses 
  } = useGame();
  const { grid } = useGrid();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (playMusic && grid.audio_file) {
      audioRef.current = new Audio(`/sounds/${grid.audio_file}`);
      audioRef.current.play();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playMusic, grid.audio_file]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setShowGameOver(false);
  };

  if (!showGameOver) return null;
  if (!targetEntity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
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
                          <span className="text-base">{entityAttr.value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={shareResults}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-2xl transition duration-150 flex items-center justify-center"
              >
                Share 🏀
              </button>
            </div>
            
            <p className="text-center text-gray-500 text-sm mt-3">
              Come back tomorrow for a new team!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
