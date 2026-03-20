import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  leaderboard_opt_out: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchProfile = useCallback(async (userId: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, email, avatar_url, leaderboard_opt_out')
        .eq('id', userId)
        .single();
      if (data) {
        setProfile(data);
        return;
      }
      // Profile may not exist yet (DB trigger race), wait and retry
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }, []);

  useEffect(() => {
    // Handle the OAuth callback hash fragment on page load
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('access_token')) {
      // Clean the URL hash after Supabase processes it
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
        setIsLoginModalOpen(false);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      isLoginModalOpen,
      signInWithGoogle,
      signOut,
      openLoginModal,
      closeLoginModal,
      setProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
