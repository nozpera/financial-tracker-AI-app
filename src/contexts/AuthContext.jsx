/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 * Handles Email/Password auth, Google OAuth, session persistence,
 * user profile management, and role-based access.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Create Auth Context
const AuthContext = createContext(null);

// Timeout for auth operations (5 seconds)
const AUTH_TIMEOUT = 5000;

/**
 * Helper: Add timeout to async operations
 */
const withTimeout = (promise, ms = AUTH_TIMEOUT) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), ms)
        )
    ]);
};

/**
 * AuthProvider Component
 * Wraps the app to provide authentication state and methods
 */
export function AuthProvider({ children }) {
    // Authentication state
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    /**
     * Fetch user profile from database
     */
    const fetchProfile = async (userId) => {
        if (!userId) return null;

        try {
            const { data, error } = await withTimeout(
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()
            );

            if (error) {
                console.log('Profile fetch issue:', error.code);
                return null;
            }

            setProfile(data);
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err.message);
            return null;
        }
    };

    /**
     * Sign up with email and password
     */
    const signUpWithEmail = async (email, password, fullName = '') => {
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName || email.split('@')[0],
                    },
                },
            });

            if (error) throw error;

            // Check if email confirmation is required
            if (data?.user && !data.session) {
                return {
                    data,
                    error: null,
                    message: 'Silakan cek email Anda untuk konfirmasi akun.'
                };
            }

            // If session exists, user is logged in
            if (data?.session?.user) {
                setUser(data.session.user);
                // Fetch profile in background (don't block UI)
                fetchProfile(data.session.user.id);
            }

            return { data, error: null };
        } catch (err) {
            console.error('Sign up error:', err);
            setError(err.message);
            return { data: null, error: err };
        }
    };

    /**
     * Sign in with email and password
     */
    const signInWithEmail = async (email, password) => {
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data?.user) {
                setUser(data.user);
                const profileData = await fetchProfile(data.user.id);
                return { data, error: null, profile: profileData };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Sign in error:', err);
            setError(err.message);
            return { data: null, error: err };
        }
    };

    /**
     * Sign in with Google OAuth
     */
    const signInWithGoogle = async () => {
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Google sign in error:', err);
            setError(err.message);
            return { data: null, error: err };
        }
    };

    /**
     * Sign out user
     */
    const signOut = async () => {
        setError(null);

        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            return { error: null };
        } catch (err) {
            console.error('Sign out error:', err);
            setError(err.message);
            return { error: err };
        }
    };

    /**
     * Update user profile
     */
    const updateProfile = async (updates) => {
        if (!user) return { error: new Error('No user logged in') };

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
            return { data, error: null };
        } catch (err) {
            console.error('Update profile error:', err);
            return { data: null, error: err };
        }
    };

    /**
     * Reset password
     */
    const resetPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            return { error: null };
        } catch (err) {
            console.error('Reset password error:', err);
            return { error: err };
        }
    };

    /**
     * Check if user has completed registration
     */
    const hasCompletedRegistration = () => {
        return profile?.registration_completed === true;
    };

    /**
     * Check if user is superadmin
     */
    const isSuperAdmin = () => {
        return profile?.role === 'superadmin';
    };

    /**
     * Get user role
     */
    const getRole = () => {
        return profile?.role || 'user';
    };

    /**
     * Clear error
     */
    const clearError = () => {
        setError(null);
    };

    // Initialize auth state
    useEffect(() => {
        let mounted = true;
        let timeoutId;

        const initializeAuth = async () => {
            try {
                // Set a maximum timeout for initialization
                timeoutId = setTimeout(() => {
                    console.log('Auth initialization timed out');
                    if (mounted) {
                        setLoading(false);
                        setInitialized(true);
                    }
                }, AUTH_TIMEOUT);

                // Get current session
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    // Don't await profile fetch - do it in background
                    fetchProfile(session.user.id);
                }
            } catch (err) {
                console.error('Auth init error:', err);
            } finally {
                if (mounted) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                    setInitialized(true);
                }
            }
        };

        initializeAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);

                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        // Cleanup
        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription?.unsubscribe();
        };
    }, []);

    // Context value
    const value = {
        user,
        profile,
        loading,
        error,
        initialized,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signOut,
        updateProfile,
        resetPassword,
        hasCompletedRegistration,
        isSuperAdmin,
        getRole,
        fetchProfile,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;
