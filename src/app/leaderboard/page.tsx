'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/components/AppShell';
import { createClient } from '@/lib/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_score: number;
}

export default function Leaderboard() {
  const { grids } = useApp();
  const { user } = useAuth();
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const grid = grids.find(g => g.permalink === 'march-maddle');

  useEffect(() => {
    if (!grid) return;

    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('season_leaderboard')
          .select('*')
          .eq('grid_id', grid.id)
          .order('total_score', { ascending: false })
          .limit(100);

        if (error) throw error;
        setBoard(data || []);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [grid]);

  return (
    <div className="flex-1 p-4 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold text-center mb-6">
        🏆 Standings
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {board.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No games played yet. Be the first!</p>
          ) : (
            board.map((entry, index) => {
              const isCurrentUser = user?.id === entry.user_id;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-mono text-sm text-gray-500">
                      {medal || `#${index + 1}`}
                    </span>
                    <span className={`font-medium ${isCurrentUser ? 'text-orange-600' : ''}`}>
                      {entry.username}
                      {isCurrentUser && <span className="text-xs ml-1">(you)</span>}
                    </span>
                  </div>
                  <span className="font-bold text-lg">{entry.total_score}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
