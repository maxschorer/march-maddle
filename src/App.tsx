import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Grid from './pages/Grid';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-black flex flex-col">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/grid/march-maddle" replace />} />
          <Route path="/grid/:permalink" element={<Grid />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function AppWrapper() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
