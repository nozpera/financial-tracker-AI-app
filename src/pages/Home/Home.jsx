import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    const features = [
        {
            icon: '📱',
            title: 'Input via Telegram',
            description: 'Catat pengeluaran dengan mudah langsung dari Telegram. Cukup kirim pesan, AI akan memahami dan mencatatnya.'
        },
        {
            icon: '☁️',
            title: 'Cloud Database',
            description: 'Data keuanganmu tersimpan aman di cloud. Akses kapan saja, di mana saja, dari perangkat apa saja.'
        },
        {
            icon: '📊',
            title: 'Dashboard Interaktif',
            description: 'Visualisasi data keuangan yang cantik dan mudah dipahami. Lihat tren, kategori, dan insight dalam satu tampilan.'
        },
        {
            icon: '🤖',
            title: 'AI Financial Assistant',
            description: 'Tanya apa saja tentang keuanganmu. AI akan menjawab berdasarkan data pengeluaran dan pemasukan kamu.'
        }
    ];

    return (
        <main className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>
                <div className="hero-content container">
                    <div className="hero-text">
                        <span className="hero-badge">Platform Keuangan Berbasis AI</span>
                        <h1 className="hero-title">
                            Kelola Keuangan
                            <span className="gradient-text"> Berbasis AI</span>
                        </h1>
                        <p className="hero-description">
                            Platform personal finance tracker cerdas yang membantu Anda mencatat pengeluaran via Telegram,
                            melihat dashboard keuangan, dan mendapat insight dari AI assistant.
                        </p>
                        <div className="hero-cta">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Mulai Sekarang
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <a href="#features" className="btn btn-secondary btn-lg">
                                Pelajari Lebih Lanjut
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">10K+</span>
                                <span className="stat-label">Pengguna Aktif</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-value">1M+</span>
                                <span className="stat-label">Transaksi Tercatat</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-value">4.9</span>
                                <span className="stat-label">Rating Pengguna</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card">
                            <div className="card-header">
                                <span className="card-dot"></span>
                                <span className="card-dot"></span>
                                <span className="card-dot"></span>
                            </div>
                            <div className="card-content">
                                <div className="card-balance">
                                    <span className="balance-label">Total Saldo</span>
                                    <span className="balance-value">Rp 12.450.000</span>
                                </div>
                                <div className="card-chart">
                                    <div className="chart-bar" style={{ height: '60%' }}></div>
                                    <div className="chart-bar" style={{ height: '80%' }}></div>
                                    <div className="chart-bar" style={{ height: '45%' }}></div>
                                    <div className="chart-bar" style={{ height: '90%' }}></div>
                                    <div className="chart-bar" style={{ height: '70%' }}></div>
                                    <div className="chart-bar active" style={{ height: '85%' }}></div>
                                </div>
                                <div className="card-transactions">
                                    <div className="transaction">
                                        <span className="transaction-icon">🛒</span>
                                        <div className="transaction-info">
                                            <span className="transaction-name">Belanja Bulanan</span>
                                            <span className="transaction-date">Hari ini</span>
                                        </div>
                                        <span className="transaction-amount expense">-Rp 450.000</span>
                                    </div>
                                    <div className="transaction">
                                        <span className="transaction-icon">💰</span>
                                        <div className="transaction-info">
                                            <span className="transaction-name">Gaji</span>
                                            <span className="transaction-date">Kemarin</span>
                                        </div>
                                        <span className="transaction-amount income">+Rp 8.500.000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="floating-card chat-card">
                            <div className="chat-message">
                                <span className="chat-avatar">🤖</span>
                                <div className="chat-bubble">
                                    Pengeluaran terbesar bulan ini adalah kategori <strong>Makanan</strong> sebesar Rp 2.3 juta
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Fitur Lengkap</span>
                        <h2 className="section-title">Semua yang Anda Butuhkan</h2>
                        <p className="section-description">
                            Fitur-fitur canggih yang dirancang untuk membantu Anda mengelola keuangan dengan lebih efisien.
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-bg"></div>
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Siap Mengelola Keuangan dengan Lebih Baik?</h2>
                        <p className="cta-description">
                            Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan mengelola keuangan dengan AI.
                            Gratis untuk memulai, tidak perlu kartu kredit.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Daftar Gratis Sekarang
                            </Link>
                        </div>
                        <div className="cta-trust">
                            <span>🔒 Data terenkripsi & aman</span>
                            <span>⚡ Setup dalam 2 menit</span>
                            <span>💬 Support 24/7</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;
