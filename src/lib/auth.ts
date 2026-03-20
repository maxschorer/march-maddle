import { createClient } from '@/lib/supabase/server'

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  leaderboard_opt_out: boolean;
}

// Server-side: get current user from cookies
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Server-side: get user profile
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, email, avatar_url, leaderboard_opt_out')
    .eq('id', userId)
    .single()
  return data
}
