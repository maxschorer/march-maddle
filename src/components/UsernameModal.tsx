'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AppShell';

const DISMISSED_KEY = 'marchMaddle_usernameDismissed';

export default function UsernameModal() {
  const { user, profile, setProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [optOut, setOptOut] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if already dismissed this session
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISSED_KEY)) {
      setDismissed(true);
    }
  }, []);

  if (!user || !profile) return null;
  if (profile.username || profile.leaderboard_opt_out) return null;
  if (dismissed) return null;

  const supabase = createClient();

  const handleClose = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const validate = (value: string): string | null => {
    if (!value) return null; // Allow empty if opting out
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

  const handleSave = async () => {
    const trimmed = username.trim();

    if (optOut) {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ leaderboard_opt_out: true, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (!updateError) {
        setProfile({ ...profile, leaderboard_opt_out: true });
      }
      setSaving(false);
      return;
    }

    if (!trimmed) {
      setError('Enter a username or opt out of standings');
      return;
    }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (error) {
      const validationError = validate(value.trim());
      setError(validationError || '');
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 60 }}
      onClick={handleClose}
    >
      <div className="bg-white rounded-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-2">
            Choose a username
          </h2>
          <p className="text-gray-500 text-center text-sm mb-6">
            This is how you&apos;ll appear on the standings.
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={handleChange}
                placeholder="Username"
                maxLength={20}
                autoFocus
                disabled={optOut}
                className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  error ? 'border-red-400' : 'border-gray-300'
                } ${optOut ? 'opacity-50' : ''}`}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                6-20 characters, letters and numbers only
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={optOut}
                onChange={(e) => setOptOut(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-500">Don&apos;t add me to standings</span>
            </label>

            <button
              onClick={handleSave}
              disabled={saving || checking}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {checking ? 'Checking...' : saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
