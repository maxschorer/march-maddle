-- Add username and leaderboard opt-out to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leaderboard_opt_out BOOLEAN DEFAULT FALSE;

-- Case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles (LOWER(username));
