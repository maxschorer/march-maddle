import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { getPSTDate } from '../utils/dateUtils';

interface SeasonStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  averageGuesses: number;
  totalGuesses: number;
}

interface DayResult {
  date: string;
  dayNumber: number;
  teamName: string;
  won: boolean;
  numGuesses: number;
  complete: boolean;
}

export default function Season() {
  const { user } = useAuth();
  const { grids } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [dayResults, setDayResults] = useState<DayResult[]>([]);
  const [loading, setLoading] = useState(true);

  const grid = grids.find(g => g.permalink === 'march-maddle');

  useEffect(() => {
    if (!user || !grid) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Get all games for this user and grid
        const { data: games, error } = await supabase
          .from('games')
          .select('daily_target_id, is_winner, is_complete, num_guesses, target_entity, created_at')
          .eq('user_id', user.id)
          .eq('grid_id', grid.id)
          .eq('is_complete', true)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Get daily targets for date mapping
        const { data: targets, error: targetsError } = await supabase
          .from('daily_grid_entities')
          .select('id, ds, entity_id, number')
          .eq('grid_id', grid.id)
          .order('ds', { ascending: true });

        if (targetsError) throw targetsError;

        // Build day results
        const results: DayResult[] = [];
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        if (targets) {
          for (const target of targets) {
            const game = games?.find(g => g.daily_target_id === target.id);
            if (game) {
              results.push({
                date: target.ds,
                dayNumber: target.number,
                teamName: game.target_entity?.name || 'Unknown',
                won: game.is_winner,
                numGuesses: game.num_guesses,
                complete: true,
              });
              
              if (game.is_winner) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
              } else {
                tempStreak = 0;
              }
            } else {
              // Only count as streak-breaker if the date has passed
              if (target.ds <= getPSTDate()) {
                results.push({
                  date: target.ds,
                  dayNumber: target.number,
                  teamName: '',
                  won: false,
                  numGuesses: 0,
                  complete: false,
                });
                tempStreak = 0;
              }
            }
          }
        }

        currentStreak = tempStreak;

        const completedGames = games || [];
        const wins = completedGames.filter(g => g.is_winner);
        const totalGuesses = wins.reduce((sum, g) => sum + (g.num_guesses || 0), 0);

        setStats({
          gamesPlayed: completedGames.length,
          gamesWon: wins.length,
          currentStreak,
          bestStreak,
          averageGuesses: wins.length > 0 ? totalGuesses / wins.length : 0,
          totalGuesses,
        });

        setDayResults(results);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, grid]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500">Sign in to view your season stats.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const today = getPSTDate();

  return (
    <div className="flex-1 p-4 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold text-center mb-6">
        Your <span className="text-orange-500">March Maddle</span> Season
      </h1>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Played</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">
              {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Win Rate</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Current Streak 🔥</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{stats.averageGuesses.toFixed(1)}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Guesses</div>
          </div>
        </div>
      )}

      {/* Game Calendar */}
      <h2 className="text-lg font-bold mb-3">Tournament Games</h2>
      <div className="space-y-2">
        {dayResults.map((day) => {
          const isPast = day.date <= today;
          const canPlay = isPast && !day.complete;
          
          return (
            <button
              key={day.date}
              onClick={() => {
                if (canPlay) {
                  navigate(`/grid/march-maddle?ds=${day.date}`);
                } else if (day.complete) {
                  navigate(`/grid/march-maddle?ds=${day.date}`);
                }
              }}
              disabled={!isPast}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                !isPast
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : canPlay
                  ? 'bg-orange-50 border border-orange-200 hover:bg-orange-100 cursor-pointer'
                  : day.won
                  ? 'bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer'
                  : 'bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-gray-500">#{day.dayNumber}</span>
                <span className="font-medium">
                  {day.date === today ? 'Today' : new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {day.complete ? (
                  <>
                    <span className="text-sm text-gray-500">{day.teamName}</span>
                    <span className="text-lg">{day.won ? '🟩' : '🟥'}</span>
                    {day.won && <span className="text-xs text-gray-400">{day.numGuesses} guesses</span>}
                  </>
                ) : isPast ? (
                  <span className="text-sm text-orange-500 font-medium">Play →</span>
                ) : (
                  <span className="text-sm text-gray-400">Locked</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
