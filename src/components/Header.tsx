import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Calendar, HelpCircle, Trophy, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import HowToPlayModal from './HowToPlayModal';

export default function Header() {
  const { user, openLoginModal, signOut } = useAuth();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-2 px-3 md:py-3 md:px-4 shadow-md border-b-2 border-orange-500">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/" className="text-lg md:text-2xl font-bold whitespace-nowrap">
              <span className="text-orange-500">March</span> Maddle <span className="text-sm md:text-lg">🏀</span>
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-base"
            >
              <Trophy size={18} />
              <span className="hidden md:inline">Standings</span>
            </Link>
            {user ? (
              <Link
                to="/season"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-base"
              >
                <Calendar size={18} />
                <span className="hidden md:inline">Season</span>
              </Link>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-base"
              >
                <Calendar size={18} />
                <span className="hidden md:inline">Season</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-base"
              aria-label="How to Play"
            >
              <HelpCircle size={18} />
              <span className="hidden md:inline">How to Play</span>
            </button>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Profile menu"
                >
                  <User size={20} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                    <button
                      onClick={() => { signOut(); setIsDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="text-sm md:text-base bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </>
  );
}
