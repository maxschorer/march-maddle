'use client';

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import UsernameModal from "@/components/UsernameModal";

function LoginModalWrapper() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  return <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-white text-black flex flex-col">
          <Header />
          {children}
        </div>
        <LoginModalWrapper />
        <UsernameModal />
      </AppProvider>
    </AuthProvider>
  );
}
