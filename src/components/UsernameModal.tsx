'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AppShell';

export default function UsernameModal() {
  const { user, profile, setProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user || !profile) return null;
  if (profile.username || profile.leaderboard_opt_out) return null;

  const supabase = createClient();

  const validate = (value: string): string | null => {
    if (value.length < 6) return 'Must be at least 6 characters';
    if (value.length > 20) return 'Must be 20 characters or fewer';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Only letters and numbers';
    return null;
  };

  const checkAvailability = async (value: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', value)
      .neq('id', user.id)
      .limit(1);
    return !data || data.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();

    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setChecking(true);
    setError('');

    const available = await checkAvailability(trimmed);
    if (!available) {
      setError('Username is taken');
      setChecking(false);
      return;
    }
    setChecking(false);

    setSaving(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: trimmed, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      if (updateError.message.includes('unique') || updateError.message.includes('duplicate')) {
        setError('Username is taken');
      } else {
        setError('Something went wrong, try again');
      }
      setSaving(false);
      return;
    }

    setProfile({ ...profile, username: trimmed });
    setSaving(false);
  };

  const handleOptOut = async () => {
    setSaving(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ leaderboard_opt_out: true, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!updateError) {
      setProfile({ ...profile, leaderboard_opt_out: true });
    }
    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (error) {
      const validationError = validate(value.trim());
      setError(validationError || '');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-2">
            Choose a username
          </h2>
          <p className="text-gray-500 text-center text-sm mb-6">
            This is how you&apos;ll appear on the leaderboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={handleChange}
                placeholder="Username"
                maxLength={20}
                autoFocus
                className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  error ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                6-20 characters, letters and numbers only
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || checking || !username.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {checking ? 'Checking...' : saving ? 'Saving...' : 'Set username'}
            </button>
          </form>

          <button
            onClick={handleOptOut}
            disabled={saving}
            className="w-full text-center text-gray-400 hover:text-gray-600 text-xs mt-4 py-2 transition-colors"
          >
            I don&apos;t want to be on the leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
