/**
 * Step 5: Financial Goals
 * 
 * Collects user's short-term financial goals.
 */

const GOAL_EXAMPLES = [
    'Menabung untuk dana darurat 6 bulan',
    'Melunasi utang kartu kredit',
    'Menyiapkan DP rumah/mobil',
    'Membangun portofolio investasi',
    'Menabung untuk liburan',
    'Mengurangi pengeluaran 20%',
];

function FinancialGoals({ formData, updateFormData, errors }) {
    // Insert example goal
    const insertExample = (example) => {
        const currentGoals = formData.financial_goals || '';
        if (currentGoals) {
            updateFormData('financial_goals', currentGoals + '\n• ' + example);
        } else {
            updateFormData('financial_goals', '• ' + example);
        }
    };

    return (
        <div className="step-form">
            {/* Introduction */}
            <div className="goal-intro">
                <h3>Apa tujuan keuangan Anda dalam 6-12 bulan ke depan?</h3>
                <p>
                    Dengan mengetahui tujuan Anda, AI dapat memberikan rekomendasi yang lebih
                    personal dan relevan untuk membantu Anda mencapainya.
                </p>
            </div>

            {/* Goal Examples */}
            <div className="form-group">
                <label className="form-label">Contoh tujuan (tap untuk menambahkan)</label>
                <div className="goal-chips">
                    {GOAL_EXAMPLES.map((example, index) => (
                        <button
                            key={index}
                            type="button"
                            className="goal-chip"
                            onClick={() => insertExample(example)}
                        >
                            + {example}
                        </button>
                    ))}
                </div>
            </div>

            {/* Financial Goals Textarea */}
            <div className="form-group">
                <label className="form-label" htmlFor="financial_goals">
                    Tujuan Keuangan Anda <span className="required">*</span>
                </label>
                <textarea
                    id="financial_goals"
                    className={`form-textarea ${errors.financial_goals ? 'error' : ''}`}
                    value={formData.financial_goals}
                    onChange={(e) => updateFormData('financial_goals', e.target.value)}
                    placeholder="Tuliskan tujuan keuangan Anda di sini...&#10;&#10;Contoh:&#10;• Menabung untuk dana darurat 6 bulan&#10;• Melunasi utang kartu kredit dalam 8 bulan&#10;• Menyisihkan 20% gaji untuk investasi"
                    rows={6}
                />
                {errors.financial_goals && (
                    <span className="form-error">⚠️ {errors.financial_goals}</span>
                )}
            </div>

            {/* Summary Card */}
            <div className="summary-card">
                <div className="summary-icon">🎯</div>
                <div className="summary-content">
                    <h4>Langkah Terakhir!</h4>
                    <p>
                        Setelah ini, AI akan menganalisis profil keuangan Anda dan memberikan
                        rekomendasi personal untuk membantu mencapai tujuan Anda.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FinancialGoals;
