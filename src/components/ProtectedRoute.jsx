/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 * Redirects to register if user hasn't completed registration.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, requireRegistration = true }) {
    const { user, profile, loading, hasCompletedRegistration } = useAuth();
    const location = useLocation();

    // Show loading while checking auth state
    if (loading) {
        return <LoadingSpinner fullScreen message="Memuat..." />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if registration is required and not completed
    if (requireRegistration && profile && !hasCompletedRegistration()) {
        // Don't redirect if already on register page
        if (location.pathname !== '/register') {
            return <Navigate to="/register" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;
