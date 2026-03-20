'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppProvider } from "@/contexts/AppContext";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import UsernameModal from "@/components/UsernameModal";
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  leaderboard_opt_out: boolean;
}

interface AuthContextType {
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AppShell');
  }
  return context;
}

interface AppShellProps {
  children: ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}

export default function AppShell({ children, initialUser, initialProfile }: AppShellProps) {
  const [user] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    try {
      const supabase = createClient();
      const redirectPath = `${window.location.pathname}${window.location.search}`;
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;
      console.log('[auth] signInWithOAuth redirectTo:', redirectTo);
      console.log('[auth] supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      console.log('[auth] signInWithOAuth data.provider:', data?.provider);
      console.log('[auth] signInWithOAuth data.url:', data?.url);
      console.log('[auth] signInWithOAuth error:', error);
      console.log('[auth] signInWithOAuth full data:', JSON.stringify(data));
      if (error) throw error;
      if (data?.url) {
        console.log('[auth] redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        console.error('[auth] NO URL returned from signInWithOAuth');
      }
    } catch (err) {
      console.error('[auth] signInWithGoogle error:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading: false,
      isLoginModalOpen,
      signInWithGoogle,
      signOut,
      openLoginModal,
      closeLoginModal,
      setProfile,
    }}>
      <AppProvider>
        <div className="min-h-screen bg-white text-black flex flex-col">
          <Header />
          {children}
        </div>
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <UsernameModal />
      </AppProvider>
    </AuthContext.Provider>
  );
}
