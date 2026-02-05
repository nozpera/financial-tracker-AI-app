/**
 * Auth Callback Page
 * 
 * Handles OAuth callback from Google.
 * Processes the auth response and redirects appropriately.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AuthCallback.css';

function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get session from URL hash
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session) {
                    // Check if user has completed registration
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('registration_completed')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError && profileError.code !== 'PGRST116') {
                        throw profileError;
                    }

                    // Redirect based on registration status
                    if (profile?.registration_completed) {
                        navigate('/', { replace: true });
                    } else {
                        navigate('/register', { replace: true });
                    }
                } else {
                    // No session, redirect to login
                    navigate('/login', { replace: true });
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setError(err.message);
            }
        };

        handleCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="auth-callback-page">
                <div className="callback-error">
                    <div className="error-icon">❌</div>
                    <h2>Autentikasi Gagal</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary">
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-callback-page">
            <LoadingSpinner message="Memproses login..." />
        </div>
    );
}

export default AuthCallback;
