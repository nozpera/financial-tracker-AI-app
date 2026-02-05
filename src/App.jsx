/**
 * App Component
 * 
 * Main application with routing and authentication.
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import Register from './pages/Register/Register';
import OnboardingSuccess from './pages/OnboardingSuccess/OnboardingSuccess';
import './App.css';

// Pages that should hide navbar and footer
const MINIMAL_PAGES = ['/login', '/register', '/onboarding-success', '/auth/callback'];

function AppContent() {
  const location = useLocation();
  const isMinimalPage = MINIMAL_PAGES.some(page => location.pathname.startsWith(page));

  return (
    <div className="app">
      {!isMinimalPage && <Navbar />}
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Registration Route (requires auth but not registration completion) */}
          <Route
            path="/register"
            element={
              <ProtectedRoute requireRegistration={false}>
                <Register />
              </ProtectedRoute>
            }
          />

          {/* Onboarding Success (requires auth and completed registration) */}
          <Route
            path="/onboarding-success"
            element={
              <ProtectedRoute>
                <OnboardingSuccess />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {!isMinimalPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
