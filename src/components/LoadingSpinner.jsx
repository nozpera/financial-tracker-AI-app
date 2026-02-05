/**
 * Loading Spinner Component
 * 
 * Displays a loading indicator with optional message.
 */

import './LoadingSpinner.css';

function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
    const content = (
        <div className="loading-spinner-content">
            <div className="spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="loading-spinner-overlay">
                {content}
            </div>
        );
    }

    return content;
}

export default LoadingSpinner;
