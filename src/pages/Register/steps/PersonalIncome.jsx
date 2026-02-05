/**
 * Step 1: Personal & Income
 * 
 * Collects employment status, industry, income, and salary date.
 */

const EMPLOYMENT_OPTIONS = [
    { value: 'full_time', label: 'Karyawan Full-time', icon: '💼' },
    { value: 'part_time', label: 'Karyawan Part-time', icon: '⏰' },
    { value: 'freelance', label: 'Freelancer', icon: '💻' },
    { value: 'business_owner', label: 'Pemilik Usaha', icon: '🏢' },
    { value: 'student', label: 'Mahasiswa', icon: '🎓' },
    { value: 'unemployed', label: 'Tidak Bekerja', icon: '🏠' },
];

const INDUSTRY_OPTIONS = [
    'Teknologi & IT',
    'Keuangan & Perbankan',
    'Kesehatan',
    'Pendidikan',
    'Manufaktur',
    'Retail & E-commerce',
    'Media & Hiburan',
    'Pemerintahan',
    'Lainnya',
];

function PersonalIncome({ formData, updateFormData, errors }) {
    return (
        <div className="step-form">
            {/* Employment Status */}
            <div className="form-group">
                <label className="form-label">
                    Status Pekerjaan <span className="required">*</span>
                </label>
                <div className="options-grid">
                    {EMPLOYMENT_OPTIONS.map(option => (
                        <label
                            key={option.value}
                            className={`option-card ${formData.employment_status === option.value ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="employment_status"
                                value={option.value}
                                checked={formData.employment_status === option.value}
                                onChange={(e) => updateFormData('employment_status', e.target.value)}
                            />
                            <span className="option-icon">{option.icon}</span>
                            <span className="option-text">{option.label}</span>
                        </label>
                    ))}
                </div>
                {errors.employment_status && (
                    <span className="form-error">⚠️ {errors.employment_status}</span>
                )}
            </div>

            {/* Industry */}
            <div className="form-group">
                <label className="form-label" htmlFor="industry">
                    Industri / Bidang Kerja
                </label>
                <select
                    id="industry"
                    className="form-select"
                    value={formData.industry}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                >
                    <option value="">Pilih industri</option>
                    {INDUSTRY_OPTIONS.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                    ))}
                </select>
            </div>

            {/* Monthly Income */}
            <div className="form-group">
                <label className="form-label" htmlFor="monthly_income">
                    Pendapatan Bulanan <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                        type="number"
                        id="monthly_income"
                        className={`form-input ${errors.monthly_income ? 'error' : ''}`}
                        value={formData.monthly_income}
                        onChange={(e) => updateFormData('monthly_income', e.target.value)}
                        placeholder="5.000.000"
                        min="0"
                    />
                </div>
                <span className="form-hint">Pendapatan bersih setelah pajak</span>
                {errors.monthly_income && (
                    <span className="form-error">⚠️ {errors.monthly_income}</span>
                )}
            </div>

            {/* Additional Income Toggle */}
            <div className="toggle-group">
                <span className="toggle-label">Punya pendapatan tambahan?</span>
                <button
                    type="button"
                    className={`toggle-switch ${formData.has_additional_income ? 'active' : ''}`}
                    onClick={() => updateFormData('has_additional_income', !formData.has_additional_income)}
                    aria-pressed={formData.has_additional_income}
                />
            </div>

            {/* Additional Income (conditional) */}
            {formData.has_additional_income && (
                <div className="form-group">
                    <label className="form-label" htmlFor="additional_income">
                        Pendapatan Tambahan per Bulan <span className="required">*</span>
                    </label>
                    <div className="input-with-prefix">
                        <span className="input-prefix">Rp</span>
                        <input
                            type="number"
                            id="additional_income"
                            className={`form-input ${errors.additional_income ? 'error' : ''}`}
                            value={formData.additional_income}
                            onChange={(e) => updateFormData('additional_income', e.target.value)}
                            placeholder="2.000.000"
                            min="0"
                        />
                    </div>
                    <span className="form-hint">Dari freelance, investasi, atau sumber lain</span>
                    {errors.additional_income && (
                        <span className="form-error">⚠️ {errors.additional_income}</span>
                    )}
                </div>
            )}

            {/* Salary Date */}
            <div className="form-group">
                <label className="form-label" htmlFor="salary_date">
                    Tanggal Gajian <span className="required">*</span>
                </label>
                <select
                    id="salary_date"
                    className={`form-select ${errors.salary_date ? 'error' : ''}`}
                    value={formData.salary_date}
                    onChange={(e) => updateFormData('salary_date', e.target.value)}
                >
                    <option value="">Pilih tanggal</option>
                    {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Tanggal {i + 1}</option>
                    ))}
                </select>
                <span className="form-hint">Untuk menghitung siklus pengeluaran Anda</span>
                {errors.salary_date && (
                    <span className="form-error">⚠️ {errors.salary_date}</span>
                )}
            </div>
        </div>
    );
}

export default PersonalIncome;
