import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import TherapistsPage from './pages/TherapistsPage';
import AITherapyPage from './pages/AITherapyPage';

function AppContent() {
  const [page, setPage] = useState('home');

  const showNavbar = !['login', 'register'].includes(page);

  return (
    <>
      {showNavbar && <Navbar page={page} setPage={setPage} />}
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'login' && <LoginPage setPage={setPage} />}
      {page === 'register' && <RegisterPage setPage={setPage} />}
      {page === 'pricing' && <PricingPage setPage={setPage} />}
      {page === 'therapists' && <TherapistsPage setPage={setPage} />}
      {page === 'ai-therapy' && <AITherapyPage setPage={setPage} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
