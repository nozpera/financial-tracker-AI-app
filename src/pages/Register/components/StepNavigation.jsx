/**
 * Step Navigation Component
 * 
 * Back and Next/Submit buttons for form navigation.
 */

import './StepNavigation.css';

function StepNavigation({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    onSubmit,
    isSubmitting
}) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="step-navigation">
            {/* Back Button */}
            <button
                type="button"
                className="nav-btn nav-btn-back"
                onClick={onBack}
                disabled={isFirstStep || isSubmitting}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Kembali</span>
            </button>

            {/* Next/Submit Button */}
            {isLastStep ? (
                <button
                    type="button"
                    className="nav-btn nav-btn-submit"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="btn-spinner"></div>
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <span>Selesaikan Pendaftaran</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </>
                    )}
                </button>
            ) : (
                <button
                    type="button"
                    className="nav-btn nav-btn-next"
                    onClick={onNext}
                    disabled={isSubmitting}
                >
                    <span>Lanjutkan</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default StepNavigation;
