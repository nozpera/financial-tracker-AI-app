/**
 * Step 4: Debt Assessment
 * 
 * Collects debt status, monthly payments, total outstanding debt, and debt types.
 */

const DEBT_TYPES = [
    { value: 'kpr', label: 'KPR / Kredit Rumah', icon: '🏠' },
    { value: 'kpm', label: 'Kredit Kendaraan', icon: '🚗' },
    { value: 'credit_card', label: 'Kartu Kredit', icon: '💳' },
    { value: 'personal_loan', label: 'Pinjaman Pribadi', icon: '🏦' },
    { value: 'education', label: 'Pinjaman Pendidikan', icon: '🎓' },
    { value: 'paylater', label: 'PayLater', icon: '📱' },
    { value: 'family', label: 'Pinjaman Keluarga', icon: '👨‍👩‍👧' },
    { value: 'other', label: 'Lainnya', icon: '📄' },
];

function DebtAssessment({ formData, updateFormData, errors }) {
    // Handle debt type toggle
    const toggleDebtType = (value) => {
        const currentTypes = formData.debt_types || [];
        if (currentTypes.includes(value)) {
            updateFormData('debt_types', currentTypes.filter(t => t !== value));
        } else {
            updateFormData('debt_types', [...currentTypes, value]);
        }
    };

    // Calculate Debt-to-Income ratio if possible
    const getDTIRatio = () => {
        const debtPayment = parseFloat(formData.monthly_debt_payment) || 0;
        // Assuming monthly_income from step 1 is accessible through formData
        // For display, we'll just show the debt payment amount
        return null;
    };

    return (
        <div className="step-form">
            {/* Has Debt Toggle */}
            <div className="toggle-group large">
                <div className="toggle-info">
                    <span className="toggle-label">Apakah Anda memiliki utang atau cicilan?</span>
                    <span className="toggle-hint">KPR, kredit kendaraan, kartu kredit, paylater, dll.</span>
                </div>
                <button
                    type="button"
                    className={`toggle-switch ${formData.has_debt ? 'active' : ''}`}
                    onClick={() => updateFormData('has_debt', !formData.has_debt)}
                    aria-pressed={formData.has_debt}
                />
            </div>

            {/* Debt Details (conditional) */}
            {formData.has_debt && (
                <>
                    {/* Debt Types */}
                    <div className="form-group">
                        <label className="form-label">
                            Jenis Utang / Cicilan <span className="required">*</span>
                        </label>
                        <div className="checkbox-group">
                            {DEBT_TYPES.map(type => (
                                <label
                                    key={type.value}
                                    className={`checkbox-item ${formData.debt_types?.includes(type.value) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.debt_types?.includes(type.value) || false}
                                        onChange={() => toggleDebtType(type.value)}
                                    />
                                    <span className="checkbox-box">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                    <span className="checkbox-text">{type.icon} {type.label}</span>
                                </label>
                            ))}
                        </div>
                        {errors.debt_types && (
                            <span className="form-error">⚠️ {errors.debt_types}</span>
                        )}
                    </div>

                    {/* Monthly Debt Payment */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="monthly_debt_payment">
                            Total Cicilan per Bulan <span className="required">*</span>
                        </label>
                        <div className="input-with-prefix">
                            <span className="input-prefix">Rp</span>
                            <input
                                type="number"
                                id="monthly_debt_payment"
                                className={`form-input ${errors.monthly_debt_payment ? 'error' : ''}`}
                                value={formData.monthly_debt_payment}
                                onChange={(e) => updateFormData('monthly_debt_payment', e.target.value)}
                                placeholder="2.000.000"
                                min="0"
                            />
                        </div>
                        <span className="form-hint">
                            Jumlah semua cicilan yang harus dibayar setiap bulan
                        </span>
                        {errors.monthly_debt_payment && (
                            <span className="form-error">⚠️ {errors.monthly_debt_payment}</span>
                        )}
                    </div>

                    {/* Total Outstanding Debt */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="total_outstanding_debt">
                            Total Sisa Utang <span className="required">*</span>
                        </label>
                        <div className="input-with-prefix">
                            <span className="input-prefix">Rp</span>
                            <input
                                type="number"
                                id="total_outstanding_debt"
                                className={`form-input ${errors.total_outstanding_debt ? 'error' : ''}`}
                                value={formData.total_outstanding_debt}
                                onChange={(e) => updateFormData('total_outstanding_debt', e.target.value)}
                                placeholder="50.000.000"
                                min="0"
                            />
                        </div>
                        <span className="form-hint">
                            Perkiraan total utang yang masih harus dilunasi
                        </span>
                        {errors.total_outstanding_debt && (
                            <span className="form-error">⚠️ {errors.total_outstanding_debt}</span>
                        )}
                    </div>

                    {/* Debt Insight */}
                    <div className="insight-card warning">
                        <div className="insight-icon">⚠️</div>
                        <div className="insight-content">
                            <h4>Perhatian</h4>
                            <p>
                                Rasio utang terhadap pendapatan (DTI) yang sehat adalah di bawah 36%.
                                AI akan membantu Anda membuat strategi pelunasan utang yang efektif.
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* No Debt Message */}
            {!formData.has_debt && (
                <div className="status-card success">
                    <div className="status-icon">🎉</div>
                    <div className="status-content">
                        <h4>Tidak Ada Utang</h4>
                        <p>
                            Bagus! Tidak memiliki utang memberi Anda lebih banyak fleksibilitas
                            untuk menabung dan berinvestasi.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DebtAssessment;
