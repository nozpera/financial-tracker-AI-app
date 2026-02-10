/**
 * Step 4: Debt Assessment (Improved)
 * 
 * Collects debt information with categorization for AI analysis.
 * 
 * Improvements:
 * - Categorize debts as Productive vs Consumptive
 * - Interest rate indicator for Snowball vs Avalanche strategy
 * - Better debt health analysis
 */

// Debt types with productive/consumptive categorization
const DEBT_TYPES = [
    // Productive Debts (can generate value or appreciation)
    { value: 'kpr', label: 'KPR / Kredit Rumah', icon: '🏠', category: 'productive', hint: 'Aset yang bisa naik nilai' },
    { value: 'education', label: 'Pinjaman Pendidikan', icon: '🎓', category: 'productive', hint: 'Investasi untuk karir' },
    { value: 'business', label: 'Modal Usaha', icon: '🏢', category: 'productive', hint: 'Menghasilkan income' },

    // Consumptive Debts (depreciating or no value)
    { value: 'kpm', label: 'Kredit Kendaraan', icon: '🚗', category: 'consumptive', hint: 'Aset yang turun nilai' },
    { value: 'credit_card', label: 'Kartu Kredit', icon: '💳', category: 'consumptive', hint: 'Bunga tinggi' },
    { value: 'paylater', label: 'PayLater', icon: '📱', category: 'consumptive', hint: 'Bunga tinggi' },
    { value: 'personal_loan', label: 'Pinjaman Pribadi', icon: '🏦', category: 'consumptive', hint: 'KTA, pinjol' },
    { value: 'family', label: 'Pinjaman Keluarga', icon: '👨‍👩‍👧', category: 'consumptive', hint: 'Tanpa bunga' },
    { value: 'other', label: 'Lainnya', icon: '📄', category: 'consumptive', hint: '' },
];

const INTEREST_LEVELS = [
    {
        value: 'low',
        label: 'Rendah',
        description: '< 10% per tahun',
        examples: 'KPR, pinjaman bank',
        icon: '🟢',
        color: 'var(--color-success)'
    },
    {
        value: 'medium',
        label: 'Sedang',
        description: '10-20% per tahun',
        examples: 'Kredit motor, KTA',
        icon: '🟡',
        color: 'var(--color-warning)'
    },
    {
        value: 'high',
        label: 'Tinggi',
        description: '> 20% per tahun',
        examples: 'Kartu kredit, paylater',
        icon: '🔴',
        color: 'var(--color-danger)'
    },
    {
        value: 'mixed',
        label: 'Campuran',
        description: 'Ada yang rendah & tinggi',
        examples: 'Beberapa jenis utang',
        icon: '🔵',
        color: 'var(--color-primary)'
    },
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

    // Calculate debt category based on selected types
    const getDebtCategory = () => {
        const selectedTypes = formData.debt_types || [];
        if (selectedTypes.length === 0) return null;

        const hasProductive = selectedTypes.some(type =>
            DEBT_TYPES.find(d => d.value === type)?.category === 'productive'
        );
        const hasConsumptive = selectedTypes.some(type =>
            DEBT_TYPES.find(d => d.value === type)?.category === 'consumptive'
        );

        if (hasProductive && hasConsumptive) return 'mixed';
        if (hasProductive) return 'productive';
        if (hasConsumptive) return 'consumptive';
        return null;
    };

    // Group debt types by category
    const productiveDebts = DEBT_TYPES.filter(d => d.category === 'productive');
    const consumptiveDebts = DEBT_TYPES.filter(d => d.category === 'consumptive');

    // Calculate DTI ratio if possible
    const monthlyIncome = parseFloat(formData.monthly_income) || 0;
    const monthlyDebt = parseFloat(formData.monthly_debt_payment) || 0;
    const dtiRatio = monthlyIncome > 0 ? ((monthlyDebt / monthlyIncome) * 100).toFixed(1) : null;

    // Determine debt category
    const debtCategory = getDebtCategory();

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
                    {/* Productive Debts Section */}
                    <div className="form-group">
                        <label className="form-label with-badge">
                            <span>Utang Produktif</span>
                            <span className="badge productive">💎 Bisa menghasilkan nilai</span>
                        </label>
                        <div className="checkbox-group">
                            {productiveDebts.map(type => (
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
                                    <div className="checkbox-content">
                                        <span className="checkbox-text">{type.icon} {type.label}</span>
                                        {type.hint && <span className="checkbox-hint">{type.hint}</span>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Consumptive Debts Section */}
                    <div className="form-group">
                        <label className="form-label with-badge">
                            <span>Utang Konsumtif</span>
                            <span className="badge consumptive">📉 Prioritas pelunasan</span>
                        </label>
                        <div className="checkbox-group">
                            {consumptiveDebts.map(type => (
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
                                    <div className="checkbox-content">
                                        <span className="checkbox-text">{type.icon} {type.label}</span>
                                        {type.hint && <span className="checkbox-hint">{type.hint}</span>}
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.debt_types && (
                            <span className="form-error">⚠️ {errors.debt_types}</span>
                        )}
                    </div>

                    {/* Debt Category Summary */}
                    {debtCategory && (
                        <div className={`category-indicator ${debtCategory}`}>
                            {debtCategory === 'productive' && (
                                <>
                                    <span className="category-icon">✅</span>
                                    <span>Utang Anda tergolong <strong>Produktif</strong> - bisa menghasilkan nilai jangka panjang</span>
                                </>
                            )}
                            {debtCategory === 'consumptive' && (
                                <>
                                    <span className="category-icon">⚠️</span>
                                    <span>Utang Anda tergolong <strong>Konsumtif</strong> - prioritaskan pelunasan</span>
                                </>
                            )}
                            {debtCategory === 'mixed' && (
                                <>
                                    <span className="category-icon">ℹ️</span>
                                    <span>Anda memiliki <strong>campuran</strong> utang produktif dan konsumtif</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Interest Rate Level */}
                    <div className="form-group">
                        <label className="form-label">
                            Tingkat Suku Bunga Utang <span className="required">*</span>
                        </label>
                        <p className="form-description">
                            Pilih yang paling mendekati rata-rata suku bunga utang Anda
                        </p>
                        <div className="interest-options">
                            {INTEREST_LEVELS.map(level => (
                                <label
                                    key={level.value}
                                    className={`interest-card ${formData.debt_interest_level === level.value ? 'selected' : ''}`}
                                    style={{ '--accent-color': level.color }}
                                >
                                    <input
                                        type="radio"
                                        name="debt_interest_level"
                                        value={level.value}
                                        checked={formData.debt_interest_level === level.value}
                                        onChange={(e) => updateFormData('debt_interest_level', e.target.value)}
                                    />
                                    <span className="interest-icon">{level.icon}</span>
                                    <div className="interest-content">
                                        <span className="interest-label">{level.label}</span>
                                        <span className="interest-desc">{level.description}</span>
                                        <span className="interest-examples">{level.examples}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.debt_interest_level && (
                            <span className="form-error">⚠️ {errors.debt_interest_level}</span>
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

                    {/* DTI Indicator */}
                    {dtiRatio && (
                        <div className={`dti-indicator ${parseFloat(dtiRatio) > 36 ? 'warning' : 'good'}`}>
                            <div className="dti-header">
                                <span className="dti-label">Debt-to-Income Ratio (DTI)</span>
                                <span className="dti-value">{dtiRatio}%</span>
                            </div>
                            <div className="dti-bar">
                                <div
                                    className="dti-fill"
                                    style={{ width: `${Math.min(parseFloat(dtiRatio), 100)}%` }}
                                />
                                <div className="dti-threshold" style={{ left: '36%' }}>
                                    <span>36%</span>
                                </div>
                            </div>
                            <span className="dti-note">
                                {parseFloat(dtiRatio) <= 36
                                    ? '✅ DTI Anda dalam batas sehat (< 36%)'
                                    : '⚠️ DTI Anda melebihi batas sehat (> 36%), pertimbangkan untuk menurunkan utang'}
                            </span>
                        </div>
                    )}

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

                    {/* Debt Strategy Insight */}
                    <div className="insight-card info">
                        <div className="insight-icon">🎯</div>
                        <div className="insight-content">
                            <h4>Strategi Pelunasan Utang</h4>
                            {formData.debt_interest_level === 'high' && (
                                <p>
                                    <strong>Metode Avalanche</strong> cocok untuk Anda - lunasi utang dengan bunga tertinggi dulu
                                    untuk menghemat total bunga yang dibayar.
                                </p>
                            )}
                            {formData.debt_interest_level === 'low' && (
                                <p>
                                    <strong>Metode Snowball</strong> bisa efektif - lunasi utang terkecil dulu untuk membangun
                                    momentum dan motivasi.
                                </p>
                            )}
                            {(formData.debt_interest_level === 'medium' || formData.debt_interest_level === 'mixed') && (
                                <p>
                                    AI akan menganalisis dan merekomendasikan strategi <strong>Snowball atau Avalanche</strong>
                                    yang paling efektif berdasarkan profil utang Anda.
                                </p>
                            )}
                            {!formData.debt_interest_level && (
                                <p>
                                    Pilih tingkat suku bunga di atas untuk mendapatkan rekomendasi strategi pelunasan.
                                </p>
                            )}
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
                            untuk menabung dan berinvestasi. AI akan membantu Anda memaksimalkan
                            alokasi dana untuk pertumbuhan aset.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DebtAssessment;
