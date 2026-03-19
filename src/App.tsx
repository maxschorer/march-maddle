import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Grid from './pages/Grid';
import Season from './pages/Season';
import Leaderboard from './pages/Leaderboard';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import UsernameModal from './components/UsernameModal';

function App() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen bg-white text-black flex flex-col">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/grid/march-maddle" replace />} />
            <Route path="/grid/:permalink" element={<Grid />} />
            <Route path="/season" element={<Season />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
      </BrowserRouter>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <UsernameModal />
    </>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  );
}
