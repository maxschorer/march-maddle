'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  usernameModalOpen: boolean;
  setUsernameModalOpen: (open: boolean) => void;
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

function UsernameToast() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (!user || !profile || profile.username || profile.leaderboard_opt_out || dismissed) {
    return null;
  }

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between">
      <button
        onClick={() => router.push('/profile')}
        className="text-sm text-orange-600 font-medium hover:text-orange-700"
      >
        Create a username to appear on the standings! →
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-gray-600 ml-2 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default function AppShell({ children, initialUser, initialProfile }: AppShellProps) {
  const [user] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    const redirectPath = `${window.location.pathname}${window.location.search}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    });
    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
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
      usernameModalOpen,
      setUsernameModalOpen,
      signInWithGoogle,
      signOut,
      openLoginModal,
      closeLoginModal,
      setProfile,
    }}>
      <AppProvider>
        <div className="min-h-screen bg-white text-black flex flex-col">
          <Header />
          <UsernameToast />
          {children}
        </div>
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <UsernameModal />
      </AppProvider>
    </AuthContext.Provider>
  );
}
