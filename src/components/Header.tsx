import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
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
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-3 px-4 shadow-md border-b-2 border-orange-500">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-orange-500">March</span> Maddle <span className="text-lg">🏀</span>
            </Link>
            {user && (
              <Link to="/season" className="text-sm text-gray-300 hover:text-white transition-colors">
                My Season
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              How to Play
            </button>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hover:opacity-80 focus:outline-none"
                  aria-label="Profile menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                    <Link
                      to="/season"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
                    >
                      My Season
                    </Link>
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
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
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
