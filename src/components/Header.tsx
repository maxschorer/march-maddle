import { Link } from 'react-router-dom';
import { useState } from 'react';
import HowToPlayModal from './HowToPlayModal';

export default function Header() {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-3 px-4 shadow-md border-b-2 border-orange-500">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-orange-500">March</span> Maddle <span className="text-lg">🏀</span>
          </Link>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            How to Play
          </button>
        </div>
      </header>
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </>
  );
}
