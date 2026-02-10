/**
 * Step 2: Fixed Expenses (Improved)
 * 
 * Collects monthly expenses with separation of Needs vs Wants
 * for accurate 50/30/20 budgeting analysis.
 * 
 * Improvements:
 * - Separate Needs (kebutuhan) and Wants (keinginan)
 * - Annual expenses checklist
 * - Better categorization for AI analysis
 */

const EXPENSE_CATEGORIES = [
    { value: 'food', label: 'Makanan & Minuman', icon: '🍽️', type: 'needs' },
    { value: 'transport', label: 'Transportasi', icon: '🚗', type: 'needs' },
    { value: 'housing', label: 'Tempat Tinggal', icon: '🏠', type: 'needs' },
    { value: 'utilities', label: 'Utilitas & Tagihan', icon: '💡', type: 'needs' },
    { value: 'installments', label: 'Cicilan', icon: '💳', type: 'needs' },
    { value: 'entertainment', label: 'Hiburan', icon: '🎮', type: 'wants' },
    { value: 'shopping', label: 'Belanja', icon: '🛍️', type: 'wants' },
    { value: 'health', label: 'Kesehatan', icon: '🏥', type: 'needs' },
    { value: 'subscriptions', label: 'Langganan', icon: '📱', type: 'wants' },
    { value: 'other', label: 'Lainnya', icon: '📦', type: 'needs' },
];

const ANNUAL_EXPENSES = [
    { value: 'vehicle_tax', label: 'Pajak Kendaraan', icon: '🚗' },
    { value: 'property_tax', label: 'PBB (Pajak Bumi Bangunan)', icon: '🏠' },
    { value: 'insurance_yearly', label: 'Asuransi Tahunan', icon: '🛡️' },
    { value: 'holiday_budget', label: 'Budget Liburan/Mudik', icon: '✈️' },
    { value: 'education_yearly', label: 'Biaya Pendidikan Tahunan', icon: '🎓' },
    { value: 'zakat_infaq', label: 'Zakat/Infaq/Sedekah', icon: '🤲' },
    { value: 'vehicle_maintenance', label: 'Servis Kendaraan', icon: '🔧' },
    { value: 'other_annual', label: 'Lainnya', icon: '📅' },
];

function FixedExpenses({ formData, updateFormData, errors }) {
    // Toggle annual expense
    const toggleAnnualExpense = (value) => {
        const currentExpenses = formData.annual_expenses || [];
        if (currentExpenses.includes(value)) {
            updateFormData('annual_expenses', currentExpenses.filter(e => e !== value));
        } else {
            updateFormData('annual_expenses', [...currentExpenses, value]);
        }
    };

    // Calculate total monthly expenses
    const totalMonthly = (parseFloat(formData.expenses_needs) || 0) + (parseFloat(formData.expenses_wants) || 0);

    // Calculate annual allocation per month
    const annualPerMonth = parseFloat(formData.annual_expenses_total) ?
        (parseFloat(formData.annual_expenses_total) / 12).toFixed(0) : 0;

    return (
        <div className="step-form">
            {/* Section Header */}
            <div className="section-info">
                <h3>Pengeluaran Bulanan</h3>
                <p>Pisahkan pengeluaran Anda ke dalam Kebutuhan (Needs) dan Keinginan (Wants) untuk analisis budgeting yang lebih akurat.</p>
            </div>

            {/* Expenses Needs */}
            <div className="form-group">
                <label className="form-label" htmlFor="expenses_needs">
                    💰 Pengeluaran Wajib (Needs) <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                        type="number"
                        id="expenses_needs"
                        className={`form-input ${errors.expenses_needs ? 'error' : ''}`}
                        value={formData.expenses_needs}
                        onChange={(e) => updateFormData('expenses_needs', e.target.value)}
                        placeholder="3.000.000"
                        min="0"
                    />
                </div>
                <span className="form-hint">
                    Sewa/KPR, listrik, air, internet, makan pokok, transportasi kerja, tagihan rutin
                </span>
                {errors.expenses_needs && (
                    <span className="form-error">⚠️ {errors.expenses_needs}</span>
                )}
            </div>

            {/* Expenses Wants */}
            <div className="form-group">
                <label className="form-label" htmlFor="expenses_wants">
                    🎮 Pengeluaran Gaya Hidup (Wants) <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                        type="number"
                        id="expenses_wants"
                        className={`form-input ${errors.expenses_wants ? 'error' : ''}`}
                        value={formData.expenses_wants}
                        onChange={(e) => updateFormData('expenses_wants', e.target.value)}
                        placeholder="1.500.000"
                        min="0"
                    />
                </div>
                <span className="form-hint">
                    Makan di luar, hiburan, belanja, langganan streaming, hobi
                </span>
                {errors.expenses_wants && (
                    <span className="form-error">⚠️ {errors.expenses_wants}</span>
                )}
            </div>

            {/* Total Summary */}
            {totalMonthly > 0 && (
                <div className="summary-card">
                    <div className="summary-row">
                        <span>Total Pengeluaran Bulanan</span>
                        <span className="summary-value">Rp {totalMonthly.toLocaleString('id-ID')}</span>
                    </div>
                    {formData.monthly_income && (
                        <div className="summary-row sub">
                            <span>Rasio terhadap Pendapatan</span>
                            <span className={`summary-value ${((totalMonthly / formData.monthly_income) * 100) > 80 ? 'warning' : 'good'}`}>
                                {((totalMonthly / formData.monthly_income) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Largest Expense Category */}
            <div className="form-group">
                <label className="form-label">
                    Kategori Pengeluaran Terbesar <span className="required">*</span>
                </label>
                <div className="options-grid small">
                    {EXPENSE_CATEGORIES.map(category => (
                        <label
                            key={category.value}
                            className={`option-card compact ${formData.largest_expense_category === category.value ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="largest_expense_category"
                                value={category.value}
                                checked={formData.largest_expense_category === category.value}
                                onChange={(e) => updateFormData('largest_expense_category', e.target.value)}
                            />
                            <span className="option-icon">{category.icon}</span>
                            <span className="option-text">{category.label}</span>
                        </label>
                    ))}
                </div>
                {errors.largest_expense_category && (
                    <span className="form-error">⚠️ {errors.largest_expense_category}</span>
                )}
            </div>

            {/* Separator */}
            <div className="section-divider">
                <span>Pengeluaran Tahunan</span>
            </div>

            {/* Annual Expenses Info */}
            <div className="info-box">
                <span className="info-icon">💡</span>
                <p>Pengeluaran tahunan sering terlupakan dan bisa menyebabkan "kejutan" cashflow. Tandai yang relevan agar AI bisa membantu Anda menyisihkan dana setiap bulan.</p>
            </div>

            {/* Annual Expenses Checkboxes */}
            <div className="form-group">
                <label className="form-label">
                    Pengeluaran Tahunan Anda
                </label>
                <div className="checkbox-group compact">
                    {ANNUAL_EXPENSES.map(expense => (
                        <label
                            key={expense.value}
                            className={`checkbox-item ${formData.annual_expenses?.includes(expense.value) ? 'selected' : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={formData.annual_expenses?.includes(expense.value) || false}
                                onChange={() => toggleAnnualExpense(expense.value)}
                            />
                            <span className="checkbox-box">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </span>
                            <span className="checkbox-text">{expense.icon} {expense.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Annual Expenses Total (conditional) */}
            {formData.annual_expenses?.length > 0 && (
                <div className="form-group">
                    <label className="form-label" htmlFor="annual_expenses_total">
                        Total Pengeluaran Tahunan
                    </label>
                    <div className="input-with-prefix">
                        <span className="input-prefix">Rp</span>
                        <input
                            type="number"
                            id="annual_expenses_total"
                            className="form-input"
                            value={formData.annual_expenses_total}
                            onChange={(e) => updateFormData('annual_expenses_total', e.target.value)}
                            placeholder="5.000.000"
                            min="0"
                        />
                    </div>
                    <span className="form-hint">
                        Perkiraan total dari semua pengeluaran tahunan yang Anda tandai
                    </span>
                    {annualPerMonth > 0 && (
                        <div className="calculation-hint">
                            💡 Anda perlu menyisihkan sekitar <strong>Rp {parseInt(annualPerMonth).toLocaleString('id-ID')}</strong> per bulan untuk pengeluaran tahunan
                        </div>
                    )}
                </div>
            )}

            {/* Expense Insight */}
            <div className="insight-card">
                <div className="insight-icon">📊</div>
                <div className="insight-content">
                    <h4>Metode Budgeting 50/30/20</h4>
                    <p>
                        <strong>50%</strong> untuk Kebutuhan (Needs)<br />
                        <strong>30%</strong> untuk Keinginan (Wants)<br />
                        <strong>20%</strong> untuk Tabungan & Investasi
                    </p>
                    <p className="insight-note">
                        AI akan menganalisis dan memberikan rekomendasi personal berdasarkan data Anda.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FixedExpenses;
