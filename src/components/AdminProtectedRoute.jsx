/**
 * Admin Protected Route Component
 * 
 * Protects admin routes - only allows superadmin access.
 * Redirects non-admins to home page.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function AdminProtectedRoute({ children }) {
    const { user, profile, loading, isSuperAdmin } = useAuth();
    const location = useLocation();

    // Show loading while checking auth state
    if (loading) {
        return <LoadingSpinner fullScreen message="Memeriksa akses..." />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to home if not superadmin
    if (!isSuperAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminProtectedRoute;
