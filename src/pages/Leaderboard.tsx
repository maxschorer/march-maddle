import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateGuessPoints } from '../utils/scoring';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  avgGuesses: number;
}

interface DailyEntry {
  userId: string;
  displayName: string;
  numGuesses: number;
  points: number;
  completedAt: string;
  rank: number;
}

type Tab = 'season' | 'today';

export default function Leaderboard() {
  const { grids } = useApp();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('season');
  const [seasonBoard, setSeasonBoard] = useState<LeaderboardEntry[]>([]);
  const [dailyBoard, setDailyBoard] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const grid = grids.find(g => g.permalink === 'march-maddle');

  useEffect(() => {
    if (!grid) return;
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, tab]);

  const loadLeaderboard = async () => {
    if (!grid) return;
    setLoading(true);

    try {
      if (tab === 'season') {
        await loadSeasonBoard();
      } else {
        await loadDailyBoard();
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonBoard = async () => {
    if (!grid) return;

    // Get all completed games for this grid
    const { data: games, error } = await supabase
      .from('games')
      .select('user_id, is_winner, num_guesses, daily_target_id, updated_at')
      .eq('grid_id', grid.id)
      .eq('is_complete', true);

    if (error) throw error;
    if (!games) return;

    // Get user profiles
    const userIds = [...new Set(games.map(g => g.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map(p => [p.id, p.display_name || p.email?.split('@')[0] || 'Anonymous'])
    );

    // For speed bonus: group games by daily_target_id and rank by updated_at
    const gamesByTarget = new Map<number, typeof games>();
    for (const game of games) {
      if (!game.is_winner) continue;
      const existing = gamesByTarget.get(game.daily_target_id) || [];
      existing.push(game);
      gamesByTarget.set(game.daily_target_id, existing);
    }

    // Sort each target's games by completion time
    for (const [, targetGames] of gamesByTarget) {
      targetGames.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    }

    // Calculate points per user
    const userPoints = new Map<string, {
      totalPoints: number;
      gamesPlayed: number;
      gamesWon: number;
      totalWinGuesses: number;
      dates: string[];
    }>();

    for (const game of games) {
      const entry = userPoints.get(game.user_id) || {
        totalPoints: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        totalWinGuesses: 0,
        dates: [],
      };

      entry.gamesPlayed++;

      if (game.is_winner) {
        entry.gamesWon++;
        entry.totalWinGuesses += game.num_guesses;

        // Calculate guess points
        let points = calculateGuessPoints(game.num_guesses, true);

        // Calculate speed bonus
        const targetGames = gamesByTarget.get(game.daily_target_id) || [];
        const rank = targetGames.findIndex(g => g.user_id === game.user_id) + 1;
        const total = targetGames.length;
        if (total > 0) {
          const percentile = rank / total;
          if (percentile <= 0.10) points += 50;
          else if (percentile <= 0.25) points += 25;
          else if (percentile <= 0.50) points += 10;
        }

        entry.totalPoints += points;
      }

      entry.dates.push(game.updated_at);
      userPoints.set(game.user_id, entry);
    }

    // Build leaderboard
    const board: LeaderboardEntry[] = [];
    for (const [userId, data] of userPoints) {
      // Calculate current streak (simplified — consecutive wins)
      board.push({
        userId,
        displayName: profileMap.get(userId) || 'Anonymous',
        totalPoints: data.totalPoints,
        gamesPlayed: data.gamesPlayed,
        gamesWon: data.gamesWon,
        currentStreak: 0, // Would need daily_target dates to calc properly
        avgGuesses: data.gamesWon > 0 ? data.totalWinGuesses / data.gamesWon : 0,
      });
    }

    board.sort((a, b) => b.totalPoints - a.totalPoints);
    setSeasonBoard(board);
  };

  const loadDailyBoard = async () => {
    if (!grid) return;

    // Get today's target
    const today = new Date().toISOString().split('T')[0];
    const { data: target } = await supabase
      .from('daily_grid_entities')
      .select('id')
      .eq('grid_id', grid.id)
      .eq('ds', today)
      .single();

    if (!target) {
      setDailyBoard([]);
      return;
    }

    // Get all completed games for today
    const { data: games, error } = await supabase
      .from('games')
      .select('user_id, is_winner, num_guesses, updated_at')
      .eq('daily_target_id', target.id)
      .eq('is_complete', true)
      .eq('is_winner', true)
      .order('updated_at', { ascending: true });

    if (error) throw error;
    if (!games) return;

    const userIds = games.map(g => g.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map(p => [p.id, p.display_name || p.email?.split('@')[0] || 'Anonymous'])
    );

    const totalSolvers = games.length;
    const board: DailyEntry[] = games.map((game, index) => {
      const rank = index + 1;
      let points = calculateGuessPoints(game.num_guesses, true);
      const percentile = rank / totalSolvers;
      if (percentile <= 0.10) points += 50;
      else if (percentile <= 0.25) points += 25;
      else if (percentile <= 0.50) points += 10;

      return {
        userId: game.user_id,
        displayName: profileMap.get(game.user_id) || 'Anonymous',
        numGuesses: game.num_guesses,
        points,
        completedAt: game.updated_at,
        rank,
      };
    });

    setDailyBoard(board);
  };

  return (
    <div className="flex-1 p-4 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold text-center mb-6">
        🏆 Leaderboard
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab('season')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'season'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Season
        </button>
        <button
          onClick={() => setTab('today')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'today'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Today
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : tab === 'season' ? (
        /* Season Leaderboard */
        <div className="space-y-2">
          {seasonBoard.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No games played yet. Be the first!</p>
          ) : (
            seasonBoard.map((entry, index) => {
              const isCurrentUser = user?.id === entry.userId;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
              
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-mono text-sm text-gray-500">
                      {medal || `#${index + 1}`}
                    </span>
                    <div>
                      <span className={`font-medium ${isCurrentUser ? 'text-orange-600' : ''}`}>
                        {entry.displayName}
                        {isCurrentUser && <span className="text-xs ml-1">(you)</span>}
                      </span>
                      <div className="text-xs text-gray-400">
                        {entry.gamesWon}/{entry.gamesPlayed} won · {entry.avgGuesses.toFixed(1)} avg
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{entry.totalPoints}</span>
                    <span className="text-xs text-gray-400 ml-1">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Daily Leaderboard */
        <div className="space-y-2">
          {dailyBoard.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No one has solved today's puzzle yet. Be the first!</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 text-center mb-3">
                {dailyBoard.length} solver{dailyBoard.length !== 1 ? 's' : ''} today
              </p>
              {dailyBoard.map((entry) => {
                const isCurrentUser = user?.id === entry.userId;
                const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
                const time = new Date(entry.completedAt).toLocaleTimeString('en-US', { 
                  hour: 'numeric', minute: '2-digit', hour12: true 
                });
                
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCurrentUser ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center font-mono text-sm text-gray-500">
                        {medal || `#${entry.rank}`}
                      </span>
                      <div>
                        <span className={`font-medium ${isCurrentUser ? 'text-orange-600' : ''}`}>
                          {entry.displayName}
                          {isCurrentUser && <span className="text-xs ml-1">(you)</span>}
                        </span>
                        <div className="text-xs text-gray-400">
                          {entry.numGuesses} guess{entry.numGuesses !== 1 ? 'es' : ''} · {time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">{entry.points}</span>
                      <span className="text-xs text-gray-400 ml-1">pts</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Scoring explanation */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-sm mb-2">How scoring works</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>🎯 <strong>100 pts</strong> for a correct answer</li>
          <li>💡 <strong>+20 pts</strong> per unused guess (max +140)</li>
          <li>⚡ <strong>+50 pts</strong> if you're in the first 10% to solve</li>
          <li>🏃 <strong>+25 pts</strong> if top 25% · <strong>+10 pts</strong> if top 50%</li>
          <li>❌ <strong>0 pts</strong> for a loss</li>
        </ul>
        <p className="text-xs text-gray-400 mt-2">Max possible: 290 pts/game. Play early, guess smart!</p>
      </div>
    </div>
  );
}
