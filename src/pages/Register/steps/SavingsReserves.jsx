/**
 * Step 3: Savings & Reserves
 * 
 * Collects savings, emergency fund, and average monthly expenses.
 */

function SavingsReserves({ formData, updateFormData, errors }) {
    // Calculate emergency fund ratio if both values exist
    const getEmergencyMonths = () => {
        const emergency = parseFloat(formData.emergency_fund) || 0;
        const monthly = parseFloat(formData.average_monthly_expenses) || 0;

        if (emergency > 0 && monthly > 0) {
            const months = (emergency / monthly).toFixed(1);
            return months;
        }
        return null;
    };

    const emergencyMonths = getEmergencyMonths();

    return (
        <div className="step-form">
            {/* Total Savings */}
            <div className="form-group">
                <label className="form-label" htmlFor="total_savings">
                    Total Tabungan Saat Ini <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                        type="number"
                        id="total_savings"
                        className={`form-input ${errors.total_savings ? 'error' : ''}`}
                        value={formData.total_savings}
                        onChange={(e) => updateFormData('total_savings', e.target.value)}
                        placeholder="10.000.000"
                        min="0"
                    />
                </div>
                <span className="form-hint">
                    Termasuk tabungan bank, deposito, dan investasi likuid
                </span>
                {errors.total_savings && (
                    <span className="form-error">⚠️ {errors.total_savings}</span>
                )}
            </div>

            {/* Emergency Fund */}
            <div className="form-group">
                <label className="form-label" htmlFor="emergency_fund">
                    Dana Darurat
                </label>
                <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                        type="number"
                        id="emergency_fund"
                        className="form-input"
                        value={formData.emergency_fund}
                        onChange={(e) => updateFormData('emergency_fund', e.target.value)}
                        placeholder="15.000.000"
                        min="0"
                    />
                </div>
                <span className="form-hint">
                    Dana khusus untuk keadaan darurat (jika dipisahkan)
                </span>
            </div>

            {/* Average Monthly Expenses */}
            <div className="form-group">
                <label className="form-label" htmlFor="average_monthly_expenses">
                    Rata-rata Pengeluaran Bulanan <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                        type="number"
                        id="average_monthly_expenses"
                        className={`form-input ${errors.average_monthly_expenses ? 'error' : ''}`}
                        value={formData.average_monthly_expenses}
                        onChange={(e) => updateFormData('average_monthly_expenses', e.target.value)}
                        placeholder="4.000.000"
                        min="0"
                    />
                </div>
                <span className="form-hint">
                    Untuk kebutuhan hidup sehari-hari
                </span>
                {errors.average_monthly_expenses && (
                    <span className="form-error">⚠️ {errors.average_monthly_expenses}</span>
                )}
            </div>

            {/* Emergency Fund Status */}
            {emergencyMonths && (
                <div className={`status-card ${parseFloat(emergencyMonths) >= 3 ? 'success' : 'warning'}`}>
                    <div className="status-icon">
                        {parseFloat(emergencyMonths) >= 6 ? '✅' : parseFloat(emergencyMonths) >= 3 ? '🟡' : '⚠️'}
                    </div>
                    <div className="status-content">
                        <h4>Status Dana Darurat</h4>
                        <p>
                            Dana darurat Anda cukup untuk <strong>{emergencyMonths} bulan</strong> pengeluaran.
                            {parseFloat(emergencyMonths) < 3 && ' Idealnya, dana darurat mencakup 3-6 bulan pengeluaran.'}
                            {parseFloat(emergencyMonths) >= 6 && ' Anda sudah memiliki dana darurat yang baik!'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SavingsReserves;
