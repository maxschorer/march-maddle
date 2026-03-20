'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AppShell';
import { useApp } from '@/contexts/AppContext';
import { createClient } from '@/lib/supabase/client';
import { getPSTDate } from '@/utils/dateUtils';
import { getAllEntities } from '@/data/entities';

interface SeasonStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  currentStreak: number;
  bestStreak: number;
  averageGuesses: number;
}

interface DayResult {
  date: string;
  dayNumber: number;
  teamName: string;
  won: boolean;
  numGuesses: number;
  score: number;
  complete: boolean;
}

export default function Season() {
  const { user } = useAuth();
  const { grids } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [dayResults, setDayResults] = useState<DayResult[]>([]);
  const [loading, setLoading] = useState(true);

  const grid = grids.find(g => g.permalink === 'march-maddle');

  useEffect(() => {
    if (!user || !grid) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: games, error } = await supabase
          .from('games')
          .select('daily_target_id, is_winner, is_complete, num_guesses, score, streak, created_at')
          .eq('user_id', user.id)
          .eq('grid_id', grid.id)
          .eq('is_complete', true)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const { data: targets, error: targetsError } = await supabase
          .from('daily_grid_entities')
          .select('id, ds, entity_id, number')
          .eq('grid_id', grid.id)
          .order('ds', { ascending: true });

        if (targetsError) throw targetsError;

        // Load entities to look up team names
        const entities = await getAllEntities(grid.id);
        const entityMap = new Map(entities.map(e => [e.entity_id, e.name]));

        const results: DayResult[] = [];
        let bestStreak = 0;
        let tempStreak = 0;

        if (targets) {
          for (const target of targets) {
            const game = games?.find(g => g.daily_target_id === target.id);
            if (game) {
              results.push({
                date: target.ds,
                dayNumber: target.number,
                teamName: entityMap.get(target.entity_id) || 'Unknown',
                won: game.is_winner,
                numGuesses: game.num_guesses,
                score: game.score || 0,
                complete: true,
              });

              if (game.is_winner) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
              } else {
                tempStreak = 0;
              }
            } else {
              results.push({
                date: target.ds,
                dayNumber: target.number,
                teamName: '',
                won: false,
                numGuesses: 0,
                score: 0,
                complete: false,
              });
              if (target.ds <= getPSTDate()) {
                tempStreak = 0;
              }
            }
          }
        }

        const currentStreak = tempStreak;

        const completedGames = games || [];
        const wins = completedGames.filter(g => g.is_winner);
        const totalGuesses = wins.reduce((sum, g) => sum + (g.num_guesses || 0), 0);
        const totalScore = completedGames.reduce((sum, g) => sum + (g.score || 0), 0);

        setStats({
          gamesPlayed: completedGames.length,
          gamesWon: wins.length,
          totalScore,
          currentStreak,
          bestStreak,
          averageGuesses: wins.length > 0 ? totalGuesses / wins.length : 0,
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
        Your <span className="text-orange-500">March Maddle</span> Tournament
      </h1>

      {stats && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-center mb-4">
          <div className="text-4xl font-bold text-orange-500">{stats.totalScore}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">Total Score</div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-8">
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Played</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">
              {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Win Rate</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{stats.currentStreak}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Streak</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{stats.averageGuesses.toFixed(1)}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Avg Guesses</div>
          </div>
        </div>
      )}

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
                  router.push(`/grid/march-maddle?ds=${day.date}`);
                } else if (day.complete) {
                  router.push(`/grid/march-maddle?ds=${day.date}`);
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
                    {day.won ? (
                      <span className="text-xs font-medium text-green-600">{day.score} pts</span>
                    ) : (
                      <span className="text-lg">🟥</span>
                    )}
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
