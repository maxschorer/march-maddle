'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AppShell';
import { createClient } from '@/lib/supabase/client';
import { Pencil } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [optOut, setOptOut] = useState(profile?.leaderboard_opt_out || false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(!profile?.username);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500">Sign in to view your profile.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const validate = (value: string): string | null => {
    if (!value) return 'Username is required';
    if (value.length < 6) return 'Must be at least 6 characters';
    if (value.length > 20) return 'Must be 20 characters or fewer';
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Only letters and numbers';
    return null;
  };

  const handleSave = async () => {
    const supabase = createClient();
    const trimmed = username.trim();

    if (!optOut) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Check availability
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', trimmed)
        .neq('id', user.id)
        .limit(1);

      if (existing && existing.length > 0) {
        setError('Username is taken');
        return;
      }
    }

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: optOut ? profile.username : trimmed,
        leaderboard_opt_out: optOut,
        updated_at: new Date().toISOString(),
      })
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

    setProfile({
      ...profile,
      username: optOut ? profile.username : trimmed,
      leaderboard_opt_out: optOut,
    });
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="flex-1 p-4 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-bold text-center mb-6">Profile</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <p className="text-gray-500 text-sm">{profile.email || user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          {!editing ? (
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">{profile.username || 'Not set'}</p>
              <button onClick={() => setEditing(true)} aria-label="Edit username">
                <Pencil size={14} className="text-gray-400 hover:text-orange-500 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Username"
                maxLength={20}
                autoFocus
                disabled={optOut}
                className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  error ? 'border-red-400' : 'border-gray-300'
                } ${optOut ? 'opacity-50' : ''}`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <p className="text-gray-400 text-xs">
                6-20 characters, letters and numbers only
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await handleSave();
                  }}
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setUsername(profile.username || '');
                    setError('');
                  }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={optOut}
            onChange={(e) => setOptOut(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-600">Don&apos;t show me on standings</span>
        </label>
      </div>
    </div>
  );
}
