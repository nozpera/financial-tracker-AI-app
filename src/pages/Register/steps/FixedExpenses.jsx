/**
 * Step 2: Fixed Expenses
 * 
 * Collects monthly fixed expenses and largest expense category.
 */

const EXPENSE_CATEGORIES = [
    { value: 'food', label: 'Makanan & Minuman', icon: '🍽️' },
    { value: 'transport', label: 'Transportasi', icon: '🚗' },
    { value: 'housing', label: 'Tempat Tinggal', icon: '🏠' },
    { value: 'utilities', label: 'Utilitas & Tagihan', icon: '💡' },
    { value: 'installments', label: 'Cicilan', icon: '💳' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '🎮' },
    { value: 'health', label: 'Kesehatan', icon: '🏥' },
    { value: 'other', label: 'Lainnya', icon: '📦' },
];

function FixedExpenses({ formData, updateFormData, errors }) {
    return (
        <div className="step-form">
            {/* Monthly Fixed Expenses */}
            <div className="form-group">
                <label className="form-label" htmlFor="monthly_fixed_expenses">
                    Total Pengeluaran Rutin per Bulan <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                        type="number"
                        id="monthly_fixed_expenses"
                        className={`form-input ${errors.monthly_fixed_expenses ? 'error' : ''}`}
                        value={formData.monthly_fixed_expenses}
                        onChange={(e) => updateFormData('monthly_fixed_expenses', e.target.value)}
                        placeholder="3.000.000"
                        min="0"
                    />
                </div>
                <span className="form-hint">
                    Termasuk sewa, tagihan, makan, transportasi, dll.
                </span>
                {errors.monthly_fixed_expenses && (
                    <span className="form-error">⚠️ {errors.monthly_fixed_expenses}</span>
                )}
            </div>

            {/* Largest Expense Category */}
            <div className="form-group">
                <label className="form-label">
                    Kategori Pengeluaran Terbesar <span className="required">*</span>
                </label>
                <div className="options-grid">
                    {EXPENSE_CATEGORIES.map(category => (
                        <label
                            key={category.value}
                            className={`option-card ${formData.largest_expense_category === category.value ? 'selected' : ''}`}
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

            {/* Expense Insight */}
            <div className="insight-card">
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                    <h4>Tip Keuangan</h4>
                    <p>
                        Idealnya, pengeluaran rutin tidak melebihi 50% dari pendapatan bulanan.
                        AI kami akan membantu menganalisis dan memberikan rekomendasi personal.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FixedExpenses;
