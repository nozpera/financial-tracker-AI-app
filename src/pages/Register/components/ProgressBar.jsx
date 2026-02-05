/**
 * Progress Bar Component
 * 
 * Visual indicator of registration progress through steps.
 */

import './ProgressBar.css';

function ProgressBar({ steps, currentStep }) {
    const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="progress-bar-container">
            {/* Progress Track */}
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Step Indicators */}
            <div className="progress-steps">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div
                            key={step.id}
                            className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                        >
                            <div className="step-dot">
                                {isCompleted ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <span>{stepNumber}</span>
                                )}
                            </div>
                            <span className="step-label">{step.title}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProgressBar;
