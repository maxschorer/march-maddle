'use client';

import { useState, useEffect, useRef } from 'react';
import { searchEntities } from '@/data/entities';
import { Entity } from '@/types/Entity';
import { useGame } from '@/contexts/GameContext';
import { useGrid } from '@/contexts/GridContext';
import { getSupabaseImageUrl } from '@/utils/storage';

const SearchRow = () => {
  const { handleGuess, guesses } = useGame();
  const { entities } = useGrid();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Entity[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        try {
          const searchResults = await searchEntities(query, entities);
          const filteredResults = searchResults.filter(
            entity => !guesses.some(guess => guess.entity.entity_id === entity.entity_id)
          );
          setResults(filteredResults);
          setIsOpen(filteredResults.length > 0);
        } catch (error) {
          console.error('Error searching entities:', error);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 100);

    return () => clearTimeout(searchTimeout);
  }, [query, entities, guesses]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectEntity = (entity: Entity) => {
    handleGuess(entity);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-1">
      {/* Profile icon cell */}
      <div className="aspect-square bg-white flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>

      {/* Search input spanning 5 columns */}
      <div className="col-span-5 relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your guess ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full h-full bg-white text-black px-4 outline-none"
        />

        {isOpen && (
          <div
            ref={resultsRef}
            className="absolute z-10 mt-1 w-full bg-white text-gray-900 shadow-lg max-h-60 overflow-auto"
          >
            {results.map(entity => (
              <div
                key={entity.entity_id}
                onClick={() => handleSelectEntity(entity)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={getSupabaseImageUrl("entities", entity.imgPath)}
                    alt={entity.name}
                    className="w-8 h-8 rounded-full object-cover object-[center_top]"
                  />
                  <span>{entity.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRow;
