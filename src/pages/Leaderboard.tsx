import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateScore, getQualityLabel } from '../utils/scoring';
import { getPSTDate } from '../utils/dateUtils';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  avgScore: number;
}

interface DailyEntry {
  userId: string;
  displayName: string;
  numGuesses: number;
  score: number;
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

    const { data: games, error } = await supabase
      .from('public_games')
      .select('user_id, is_winner, num_guesses, daily_target_id, updated_at')
      .eq('grid_id', grid.id)
      .eq('is_complete', true);

    if (error) throw error;
    if (!games) return;

    const userIds = [...new Set(games.map(g => g.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, leaderboard_opt_out')
      .in('id', userIds);

    // Only include users with a username who haven't opted out
    const eligibleUsers = new Set(
      (profiles || []).filter(p => p.username && !p.leaderboard_opt_out).map(p => p.id)
    );
    const profileMap = new Map(
      (profiles || []).filter(p => p.username).map(p => [p.id, p.username as string])
    );

    // Get daily target dates for same-day bonus calculation
    const targetIds = [...new Set(games.map(g => g.daily_target_id))];
    const { data: targets } = await supabase
      .from('daily_grid_entities')
      .select('id, ds')
      .in('id', targetIds);

    const targetDateMap = new Map((targets || []).map(t => [t.id, t.ds]));

    // Group games by eligible users, then sort by target date to calculate streaks
    const gamesByUser = new Map<string, typeof games>();
    for (const game of games) {
      if (!eligibleUsers.has(game.user_id)) continue;
      const existing = gamesByUser.get(game.user_id) || [];
      existing.push(game);
      gamesByUser.set(game.user_id, existing);
    }

    // Calculate scores per user with streaks
    const userScores = new Map<string, { totalScore: number; gamesPlayed: number; gamesWon: number }>();

    for (const [userId, userGames] of gamesByUser) {
      // Sort by target date
      userGames.sort((a, b) => {
        const dateA = targetDateMap.get(a.daily_target_id) || '';
        const dateB = targetDateMap.get(b.daily_target_id) || '';
        return dateA.localeCompare(dateB);
      });

      const entry = { totalScore: 0, gamesPlayed: 0, gamesWon: 0 };
      let streak = 0;
      let lastWinDate: string | null = null;

      for (const game of userGames) {
        entry.gamesPlayed++;
        const targetDate = targetDateMap.get(game.daily_target_id);

        if (game.is_winner) {
          entry.gamesWon++;

          // Same-day bonus: solved on the puzzle's date
          let sameDayBonus = false;
          if (targetDate) {
            const solveDate = new Date(game.updated_at).toISOString().slice(0, 10);
            sameDayBonus = solveDate === targetDate;
          }

          // Streak only counts same-day wins
          if (sameDayBonus) {
            if (lastWinDate) {
              const diff = (new Date(targetDate!).getTime() - new Date(lastWinDate).getTime()) / 86400000;
              streak = diff === 1 ? streak + 1 : 1;
            } else {
              streak = 1;
            }
            lastWinDate = targetDate || null;
          } else {
            streak = 0;
            lastWinDate = null;
          }

          const score = calculateScore(
            game.num_guesses,
            true,
            sameDayBonus,
            streak,
          );
          entry.totalScore += score;
        } else {
          // Loss breaks the streak
          streak = 0;
          lastWinDate = null;
        }
      }

      userScores.set(userId, entry);
    }

    const board: LeaderboardEntry[] = [];
    for (const [userId, data] of userScores) {
      board.push({
        userId,
        displayName: profileMap.get(userId) || 'Anonymous',
        totalScore: data.totalScore,
        gamesPlayed: data.gamesPlayed,
        gamesWon: data.gamesWon,
        avgScore: data.gamesWon > 0 ? Math.round(data.totalScore / data.gamesWon) : 0,
      });
    }

    board.sort((a, b) => b.totalScore - a.totalScore);
    setSeasonBoard(board);
  };

  const loadDailyBoard = async () => {
    if (!grid) return;

    const today = getPSTDate();
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

    const { data: games, error } = await supabase
      .from('public_games')
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
      .select('id, username, leaderboard_opt_out')
      .in('id', userIds);

    const eligibleDailyUsers = new Set(
      (profiles || []).filter(p => p.username && !p.leaderboard_opt_out).map(p => p.id)
    );
    const profileMap = new Map(
      (profiles || []).filter(p => p.username).map(p => [p.id, p.username as string])
    );

    // Filter to eligible users only
    const eligibleGames = games.filter(g => eligibleDailyUsers.has(g.user_id));

    // For daily board, we show scores with same-day bonus (they all solved today)
    // but we need streak info per user
    const userIds2 = eligibleGames.map(g => g.user_id);

    // Fetch all completed winning games for these users to calculate streaks
    const { data: allUserGames } = await supabase
      .from('public_games')
      .select('user_id, is_winner, daily_target_id, updated_at')
      .eq('grid_id', grid.id)
      .eq('is_complete', true)
      .in('user_id', userIds2);

    // Get all target dates for streak calculation
    const allTargetIds = [...new Set((allUserGames || []).map(g => g.daily_target_id))];
    const { data: allTargets } = await supabase
      .from('daily_grid_entities')
      .select('id, ds')
      .in('id', allTargetIds);
    const allTargetDateMap = new Map((allTargets || []).map(t => [t.id, t.ds]));

    // Calculate current streak per user
    const userStreaks = new Map<string, number>();
    for (const userId of userIds2) {
      const ug = (allUserGames || [])
        .filter(g => g.user_id === userId)
        .sort((a, b) => {
          const dateA = allTargetDateMap.get(a.daily_target_id) || '';
          const dateB = allTargetDateMap.get(b.daily_target_id) || '';
          return dateA.localeCompare(dateB);
        });

      let streak = 0;
      let lastWinDate: string | null = null;
      for (const g of ug) {
        const td = allTargetDateMap.get(g.daily_target_id);
        const solvedSameDay = g.is_winner && td
          ? new Date(g.updated_at).toISOString().slice(0, 10) === td
          : false;

        if (g.is_winner && solvedSameDay) {
          if (td && lastWinDate) {
            const diff = (new Date(td).getTime() - new Date(lastWinDate).getTime()) / 86400000;
            streak = diff === 1 ? streak + 1 : 1;
          } else {
            streak = 1;
          }
          lastWinDate = td || null;
        } else {
          streak = 0;
          lastWinDate = null;
        }
      }
      userStreaks.set(userId, streak);
    }

    const board: DailyEntry[] = eligibleGames.map((game, index) => {
      const sameDayBonus = true; // today's board = solved today
      const streak = userStreaks.get(game.user_id) || 1;

      const score = calculateScore(
        game.num_guesses,
        true,
        sameDayBonus,
        streak,
      );

      return {
        userId: game.user_id,
        displayName: profileMap.get(game.user_id) || 'Anonymous',
        numGuesses: game.num_guesses,
        score,
        completedAt: game.updated_at,
        rank: index + 1,
      };
    });

    // Sort by score descending (not just time)
    board.sort((a, b) => b.score - a.score);
    setDailyBoard(board);
  };

  return (
    <div className="flex-1 p-4 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold text-center mb-6">
        🏆 Standings
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab('season')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'season' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Season
        </button>
        <button
          onClick={() => setTab('today')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'today' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                        {entry.gamesWon}/{entry.gamesPlayed} won · avg {entry.avgScore}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{entry.totalScore}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {dailyBoard.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No one has solved today's puzzle yet. Be the first!</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 text-center mb-3">
                {dailyBoard.length} solver{dailyBoard.length !== 1 ? 's' : ''} today
              </p>
              {dailyBoard.map((entry, index) => {
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
                          {entry.numGuesses} guess{entry.numGuesses !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1">
                      <span className="font-bold text-lg">{entry.score}</span>
                      <span className="text-sm">{getQualityLabel(entry.score)}</span>
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
        <p className="text-sm font-medium text-gray-700 text-center mb-2">Scoring</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>+100 correct answer</p>
          <p>+20 per unused guess</p>
          <p>+50 same-day bonus</p>
          <p>+10 per streak day</p>
        </div>
      </div>
    </div>
  );
}
