/**
 * Register Page
 * 
 * Multi-step registration form for collecting financial data.
 * Improved with better data validity for AI analysis.
 * 
 * New fields:
 * - income_stability, income_type (Step 1)
 * - expenses_needs, expenses_wants, annual_expenses (Step 2)
 * - debt_interest_level, debt_category (Step 4)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProgressBar from './components/ProgressBar';
import StepNavigation from './components/StepNavigation';
import PersonalIncome from './steps/PersonalIncome';
import FixedExpenses from './steps/FixedExpenses';
import SavingsReserves from './steps/SavingsReserves';
import DebtAssessment from './steps/DebtAssessment';
import FinancialGoals from './steps/FinancialGoals';
import './Register.css';

// Step configuration
const STEPS = [
    { id: 1, title: 'Personal & Pendapatan', icon: '👤' },
    { id: 2, title: 'Pengeluaran Rutin', icon: '📋' },
    { id: 3, title: 'Tabungan & Dana Darurat', icon: '💰' },
    { id: 4, title: 'Evaluasi Utang', icon: '💳' },
    { id: 5, title: 'Tujuan Keuangan', icon: '🎯' },
];

// Initial form data with improved fields
const initialFormData = {
    // Step 1: Personal & Income (Improved)
    employment_status: '',
    industry: '',
    income_stability: '',        // NEW: 'stable' or 'fluctuating'
    income_type: 'net',          // NEW: 'gross' or 'net'
    monthly_income: '',
    has_additional_income: false,
    additional_income: '',
    salary_date: '',

    // Step 2: Fixed Expenses (Improved)
    expenses_needs: '',          // NEW: Kebutuhan wajib
    expenses_wants: '',          // NEW: Gaya hidup
    monthly_fixed_expenses: '',  // Kept for backward compatibility
    largest_expense_category: '',
    annual_expenses: [],         // NEW: Array of annual expense types
    annual_expenses_total: '',   // NEW: Total annual expenses

    // Step 3: Savings & Reserves
    total_savings: '',
    emergency_fund: '',
    average_monthly_expenses: '',

    // Step 4: Debt Assessment (Improved)
    has_debt: false,
    monthly_debt_payment: '',
    total_outstanding_debt: '',
    debt_types: [],
    debt_interest_level: '',     // NEW: 'low', 'medium', 'high', 'mixed'
    debt_category: '',           // NEW: 'productive', 'consumptive', 'mixed'

    // Step 5: Financial Goals
    financial_goals: '',
};

// Employment types with variable income
const VARIABLE_INCOME_TYPES = ['freelance', 'business_owner'];

function Register() {
    const navigate = useNavigate();
    const { user, profile, loading, hasCompletedRegistration, fetchProfile, isSuperAdmin } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Redirect if not authenticated or already completed registration
    // Note: ?preview=true allows superadmin to view this page without redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isPreviewMode = urlParams.get('preview') === 'true';

        if (!loading) {
            if (!user) {
                navigate('/login', { replace: true });
            } else if (isSuperAdmin() && !isPreviewMode) {
                navigate('/admin', { replace: true });
            } else if (!isSuperAdmin() && hasCompletedRegistration()) {
                navigate('/', { replace: true });
            }
        }
    }, [user, loading, hasCompletedRegistration, isSuperAdmin, navigate]);

    // Update form data
    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Validate current step
    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.employment_status) newErrors.employment_status = 'Status pekerjaan wajib dipilih';
                if (!formData.monthly_income) newErrors.monthly_income = 'Pendapatan bulanan wajib diisi';
                if (!formData.salary_date) newErrors.salary_date = 'Tanggal gajian wajib diisi';
                if (formData.has_additional_income && !formData.additional_income) {
                    newErrors.additional_income = 'Pendapatan tambahan wajib diisi';
                }
                // Validate income stability for variable income types
                if (VARIABLE_INCOME_TYPES.includes(formData.employment_status) && !formData.income_stability) {
                    newErrors.income_stability = 'Stabilitas pendapatan wajib dipilih';
                }
                break;
            case 2:
                // New validation for needs and wants
                if (!formData.expenses_needs) newErrors.expenses_needs = 'Pengeluaran wajib (Needs) harus diisi';
                if (!formData.expenses_wants) newErrors.expenses_wants = 'Pengeluaran gaya hidup (Wants) harus diisi';
                if (!formData.largest_expense_category) newErrors.largest_expense_category = 'Kategori pengeluaran wajib dipilih';
                break;
            case 3:
                if (!formData.total_savings) newErrors.total_savings = 'Total tabungan wajib diisi';
                if (!formData.average_monthly_expenses) newErrors.average_monthly_expenses = 'Rata-rata pengeluaran wajib diisi';
                break;
            case 4:
                if (formData.has_debt) {
                    if (!formData.monthly_debt_payment) newErrors.monthly_debt_payment = 'Cicilan bulanan wajib diisi';
                    if (!formData.total_outstanding_debt) newErrors.total_outstanding_debt = 'Total utang wajib diisi';
                    if (formData.debt_types.length === 0) newErrors.debt_types = 'Pilih minimal satu jenis utang';
                    if (!formData.debt_interest_level) newErrors.debt_interest_level = 'Tingkat suku bunga wajib dipilih';
                }
                break;
            case 5:
                if (!formData.financial_goals) newErrors.financial_goals = 'Tujuan keuangan wajib diisi';
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next step
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    // Handle previous step
    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // Determine debt category from selected types
    const getDebtCategory = () => {
        const productiveTypes = ['kpr', 'education', 'business'];
        const selectedTypes = formData.debt_types || [];

        if (selectedTypes.length === 0) return null;

        const hasProductive = selectedTypes.some(t => productiveTypes.includes(t));
        const hasConsumptive = selectedTypes.some(t => !productiveTypes.includes(t));

        if (hasProductive && hasConsumptive) return 'mixed';
        if (hasProductive) return 'productive';
        return 'consumptive';
    };

    // Convert form data to numbers for database
    const prepareDataForSubmission = () => {
        // Calculate monthly_fixed_expenses from needs + wants for backward compatibility
        const needsAmount = parseFloat(formData.expenses_needs) || 0;
        const wantsAmount = parseFloat(formData.expenses_wants) || 0;

        return {
            user_id: user.id,

            // Step 1
            employment_status: formData.employment_status,
            industry: formData.industry || null,
            income_stability: VARIABLE_INCOME_TYPES.includes(formData.employment_status)
                ? formData.income_stability
                : 'stable',
            income_type: formData.income_type || 'net',
            monthly_income: parseFloat(formData.monthly_income) || 0,
            has_additional_income: formData.has_additional_income,
            additional_income: formData.has_additional_income ? parseFloat(formData.additional_income) || 0 : null,
            salary_date: formData.salary_date === 'varies' ? null : parseInt(formData.salary_date) || null,

            // Step 2
            expenses_needs: needsAmount,
            expenses_wants: wantsAmount,
            monthly_fixed_expenses: needsAmount + wantsAmount, // Backward compatibility
            largest_expense_category: formData.largest_expense_category,
            annual_expenses: formData.annual_expenses || [],
            annual_expenses_total: parseFloat(formData.annual_expenses_total) || 0,

            // Step 3
            total_savings: parseFloat(formData.total_savings) || 0,
            emergency_fund: parseFloat(formData.emergency_fund) || 0,
            average_monthly_expenses: parseFloat(formData.average_monthly_expenses) || 0,

            // Step 4
            has_debt: formData.has_debt,
            monthly_debt_payment: formData.has_debt ? parseFloat(formData.monthly_debt_payment) || 0 : null,
            total_outstanding_debt: formData.has_debt ? parseFloat(formData.total_outstanding_debt) || 0 : null,
            debt_types: formData.has_debt ? formData.debt_types : [],
            debt_interest_level: formData.has_debt ? formData.debt_interest_level : null,
            debt_category: formData.has_debt ? getDebtCategory() : null,

            // Step 5
            financial_goals: formData.financial_goals,
        };
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const dataToSubmit = prepareDataForSubmission();

            // STEP 1: Ensure profile exists (fixes FK constraint error)
            // Use upsert to create profile if it doesn't exist
            const { error: profileUpsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    registration_completed: false, // Will be updated after financial_profiles insert
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'id',
                    ignoreDuplicates: false, // Update if exists
                });

            if (profileUpsertError) {
                console.error('Profile upsert error:', profileUpsertError);
                // Continue anyway - profile might already exist with RLS restrictions
            }

            // STEP 2: Insert financial profile
            const { error: insertError } = await supabase
                .from('financial_profiles')
                .insert([dataToSubmit]);

            if (insertError) throw insertError;

            // STEP 3: Update profiles table to mark registration as completed
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ registration_completed: true, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Refresh profile data
            await fetchProfile(user.id);

            // Navigate to success page
            navigate('/onboarding-success', { replace: true });

        } catch (err) {
            console.error('Registration error:', err);
            setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan data');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading while checking auth
    if (loading) {
        return <LoadingSpinner fullScreen message="Memuat..." />;
    }

    // Get current step component
    const renderStepContent = () => {
        const stepProps = { formData, updateFormData, errors };

        switch (currentStep) {
            case 1:
                return <PersonalIncome {...stepProps} />;
            case 2:
                return <FixedExpenses {...stepProps} />;
            case 3:
                return <SavingsReserves {...stepProps} />;
            case 4:
                return <DebtAssessment {...stepProps} />;
            case 5:
                return <FinancialGoals {...stepProps} />;
            default:
                return null;
        }
    };

    return (
        <main className="register-page">
            <div className="register-container">
                {/* Header */}
                <div className="register-header">
                    <div className="register-logo">
                        <div className="logo-icon">
                            <span>₿</span>
                        </div>
                        <span className="logo-text">
                            Finance<span className="logo-accent">AI</span>
                        </span>
                    </div>
                    <h1 className="register-title">Lengkapi Profil Keuangan Anda</h1>
                    <p className="register-subtitle">
                        Data ini akan membantu AI memberikan rekomendasi keuangan yang personal dan akurat.
                    </p>
                </div>

                {/* Progress Bar */}
                <ProgressBar steps={STEPS} currentStep={currentStep} />

                {/* Form Card */}
                <div className="register-card">
                    {/* Step Header */}
                    <div className="step-header">
                        <span className="step-icon">{STEPS[currentStep - 1].icon}</span>
                        <div className="step-info">
                            <span className="step-number">Langkah {currentStep} dari {STEPS.length}</span>
                            <h2 className="step-title">{STEPS[currentStep - 1].title}</h2>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="step-content">
                        {renderStepContent()}
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                        <div className="submit-error">
                            <span>⚠️</span>
                            <span>{submitError}</span>
                        </div>
                    )}

                    {/* Navigation */}
                    <StepNavigation
                        currentStep={currentStep}
                        totalSteps={STEPS.length}
                        onBack={handleBack}
                        onNext={handleNext}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>

                {/* Security Note */}
                <div className="security-note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Data Anda terenkripsi dan aman</span>
                </div>
            </div>
        </main>
    );
}

export default Register;
