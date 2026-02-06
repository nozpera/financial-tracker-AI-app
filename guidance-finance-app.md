# 📚 Finance AI - Dokumentasi Lengkap

> Dokumentasi ini menjelaskan cara kerja website Finance AI dari awal sampai progress saat ini.

---

## 📋 Daftar Isi

1. [Overview Aplikasi](#overview-aplikasi)
2. [Tech Stack](#tech-stack)
3. [Struktur Folder](#struktur-folder)
4. [Flow Autentikasi](#flow-autentikasi)
5. [Flow Registrasi](#flow-registrasi)
6. [Database Schema](#database-schema)
7. [Komponen Utama](#komponen-utama)
8. [Debugging Guide](#debugging-guide)

---

## Overview Aplikasi

Finance AI adalah aplikasi web untuk mengelola keuangan pribadi dengan bantuan AI. Fitur utama:

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Auth dengan Email/Password | User bisa daftar dan login dengan email | ✅ Done |
| Auth dengan Google | OAuth login via Google | ✅ Done |
| Multi-step Registration | Form 5 langkah untuk data keuangan | ✅ Done |
| Dashboard | Pantau kondisi keuangan | 🔜 Coming |
| AI Assistant | Tanya jawab keuangan | 🔜 Coming |
| Telegram Bot | Input via chat | 🔜 Coming |

---

## Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  ┌─────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │  React  │  │ React Router│  │ Vite (Build Tool)    │ │
│  └─────────┘  └─────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND (BaaS)                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                    SUPABASE                          │ │
│  │  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │   Auth    │  │  PostgreSQL  │  │  Realtime    │  │ │
│  │  │  (OAuth)  │  │  (Database)  │  │  (Coming)    │  │ │
│  │  └───────────┘  └──────────────┘  └──────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Struktur Folder

```
src/
├── components/           # Komponen reusable
│   ├── Navbar.jsx       # Navigation bar
│   ├── Footer.jsx       # Footer
│   ├── ProtectedRoute.jsx # Route guard
│   └── LoadingSpinner.jsx # Loading indicator
│
├── contexts/            # React Context
│   └── AuthContext.jsx  # State management auth
│
├── lib/                 # Library/utilities
│   └── supabase.js      # Supabase client config
│
├── pages/               # Halaman-halaman
│   ├── Home/            # Landing page
│   ├── Login/           # Login & Signup
│   ├── Register/        # Multi-step form
│   │   ├── Register.jsx
│   │   ├── components/  # ProgressBar, StepNavigation
│   │   └── steps/       # 5 step forms
│   ├── AuthCallback/    # OAuth callback handler
│   └── OnboardingSuccess/ # Success page
│
├── App.jsx              # Main app + routing
├── main.jsx             # Entry point
└── index.css            # Global styles
```

---

## Flow Autentikasi

### Diagram Lengkap

```mermaid
flowchart TD
    subgraph USER["👤 User Action"]
        A[Buka Website]
    end

    subgraph INIT["🔄 Inisialisasi"]
        B[App.jsx dimuat]
        C[AuthProvider aktif]
        D["getSession() dipanggil"]
        E{Session ada?}
    end

    subgraph NO_SESSION["❌ Belum Login"]
        F[user = null]
        G[loading = false]
        H[Render halaman]
    end

    subgraph HAS_SESSION["✅ Sudah Login"]
        I[Set user dari session]
        J["fetchProfile(user.id)"]
        K{Profile ada?}
        L[Set profile]
        M[profile = null]
    end

    subgraph ROUTING["🛣️ Routing Decision"]
        N{Akses route mana?}
        O["/login"]
        P["/ (Home)"]
        Q["/register"]
    end

    subgraph LOGIN_PAGE["📝 Login Page"]
        R{User sudah login?}
        S[Tampilkan form login]
        T{Registration selesai?}
        U["Redirect ke /"]
        V["Redirect ke /register"]
    end

    A --> B --> C --> D --> E
    E -->|Tidak| F --> G --> H
    E -->|Ya| I --> J --> K
    K -->|Ya| L --> H
    K -->|Tidak| M --> H
    
    H --> N
    N --> O --> R
    N --> P
    N --> Q
    
    R -->|Ya| T
    R -->|Tidak| S
    T -->|Ya| U
    T -->|Tidak| V
```

### Penjelasan Step-by-Step

#### 1. **User Buka Website**
```
Browser → http://localhost:5173
```

#### 2. **React App Dimuat**
```javascript
// main.jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

#### 3. **App.jsx Render**
```javascript
// App.jsx
function App() {
  return (
    <Router>
      <AuthProvider>  {/* ← AuthContext membungkus semua */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
```

#### 4. **AuthProvider Inisialisasi**
```javascript
// AuthContext.jsx - useEffect saat mount
useEffect(() => {
  const initializeAuth = async () => {
    // 1. Cek session yang tersimpan
    const { data: { session } } = await supabase.auth.getSession();
    
    // 2. Jika ada session, set user
    if (session?.user) {
      setUser(session.user);
      fetchProfile(session.user.id);
    }
    
    // 3. Selesai loading
    setLoading(false);
  };
  
  initializeAuth();
}, []);
```

#### 5. **Routing Decision**
```javascript
// App.jsx - Routes
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  <Route path="/register" element={
    <ProtectedRoute requireRegistration={false}>
      <Register />
    </ProtectedRoute>
  } />
  <Route path="/" element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  } />
</Routes>
```

---

## Flow Registrasi

### Diagram Signup Email/Password

```mermaid
sequenceDiagram
    participant U as User
    participant LP as Login Page
    participant AC as AuthContext
    participant SB as Supabase Auth
    participant DB as Database
    participant TR as Trigger

    U->>LP: Klik tab "Daftar"
    U->>LP: Isi email, password, nama
    U->>LP: Klik "Daftar Sekarang"
    
    LP->>AC: signUpWithEmail(email, password, name)
    AC->>SB: supabase.auth.signUp({...})
    
    alt Email Confirmation Required
        SB-->>AC: { user, session: null }
        AC-->>LP: "Cek email untuk konfirmasi"
        LP-->>U: Tampilkan pesan sukses
    else Auto Login
        SB-->>AC: { user, session }
        SB->>DB: INSERT ke auth.users
        DB->>TR: Trigger on_auth_user_created
        TR->>DB: INSERT ke profiles
        AC->>AC: setUser(user)
        AC->>DB: SELECT * FROM profiles
        DB-->>AC: profile data
        AC->>AC: setProfile(profile)
        AC-->>LP: Success
        LP->>U: Redirect ke /register
    end
```

### Diagram Multi-Step Registration Form

```mermaid
flowchart LR
    subgraph STEPS["📝 5 Steps Registration"]
        S1["Step 1<br/>Personal & Income"]
        S2["Step 2<br/>Fixed Expenses"]
        S3["Step 3<br/>Savings"]
        S4["Step 4<br/>Debt"]
        S5["Step 5<br/>Goals"]
    end

    subgraph DATA["💾 Data Collected"]
        D1["employment_status<br/>industry<br/>monthly_income<br/>salary_date"]
        D2["monthly_fixed_expenses<br/>largest_expense_category"]
        D3["total_savings<br/>emergency_fund<br/>average_monthly_expenses"]
        D4["has_debt<br/>debt_types<br/>monthly_debt_payment<br/>total_outstanding_debt"]
        D5["financial_goals"]
    end

    S1 --> S2 --> S3 --> S4 --> S5
    S1 -.-> D1
    S2 -.-> D2
    S3 -.-> D3
    S4 -.-> D4
    S5 -.-> D5

    S5 --> SUBMIT["Submit to Database"]
    SUBMIT --> FP["INSERT financial_profiles"]
    SUBMIT --> UP["UPDATE profiles<br/>registration_completed = true"]
    UP --> SUCCESS["/onboarding-success"]
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "1:1"
    PROFILES ||--o| FINANCIAL_PROFILES : "1:0..1"
    
    AUTH_USERS {
        uuid id PK
        string email
        string encrypted_password
        jsonb raw_user_meta_data
        timestamp created_at
        timestamp last_sign_in_at
    }
    
    PROFILES {
        uuid id PK,FK
        string email
        string full_name
        string avatar_url
        boolean registration_completed
        timestamp created_at
        timestamp updated_at
    }
    
    FINANCIAL_PROFILES {
        uuid id PK
        uuid user_id FK
        string employment_status
        string industry
        decimal monthly_income
        boolean has_additional_income
        decimal additional_income
        int salary_date
        decimal monthly_fixed_expenses
        string largest_expense_category
        decimal total_savings
        decimal emergency_fund
        decimal average_monthly_expenses
        boolean has_debt
        decimal monthly_debt_payment
        decimal total_outstanding_debt
        jsonb debt_types
        text financial_goals
        timestamp created_at
        timestamp updated_at
    }
```

### Penjelasan Tabel

#### 1. `auth.users` (Managed by Supabase)
> Tabel bawaan Supabase untuk authentication

| Column | Type | Description |
|--------|------|-------------|
| [id](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/src/pages/Login/Login.jsx#68-99) | UUID | Primary key, auto-generated |
| `email` | TEXT | Email user |
| `encrypted_password` | TEXT | Password yang di-hash |
| `raw_user_meta_data` | JSONB | Data tambahan (full_name, dll) |

#### 2. `public.profiles`
> Extended user info, dibuat otomatis oleh trigger saat signup

| Column | Type | Description |
|--------|------|-------------|
| [id](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/src/pages/Login/Login.jsx#68-99) | UUID | FK ke auth.users |
| `email` | TEXT | Duplikat untuk kemudahan query |
| `full_name` | TEXT | Nama lengkap user |
| `avatar_url` | TEXT | URL foto profil |
| `registration_completed` | BOOLEAN | Sudah isi form registrasi? |

#### 3. `public.financial_profiles`
> Data keuangan dari form registrasi 5 langkah

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | FK ke profiles |
| `employment_status` | TEXT | full_time, freelance, dll |
| `monthly_income` | DECIMAL | Pendapatan bulanan |
| `has_debt` | BOOLEAN | Punya utang? |
| `debt_types` | JSONB | Array jenis utang |
| `financial_goals` | TEXT | Tujuan keuangan |

### Trigger Flow

```mermaid
flowchart TD
    A["INSERT INTO auth.users"] --> B["Trigger: on_auth_user_created"]
    B --> C["Function: handle_new_user()"]
    C --> D["INSERT INTO profiles<br/>(id, email, full_name, avatar_url)"]
    D --> E["Profile ready!"]
```

---

## Komponen Utama

### AuthContext - State Management

```mermaid
stateDiagram-v2
    [*] --> Loading: App Start
    Loading --> LoggedOut: No Session
    Loading --> LoggedIn: Has Session
    
    LoggedOut --> Loading: signInWithEmail()
    LoggedOut --> Loading: signUpWithEmail()
    LoggedOut --> Redirecting: signInWithGoogle()
    
    Redirecting --> Loading: OAuth Callback
    
    LoggedIn --> LoggedOut: signOut()
    LoggedIn --> LoggedIn: updateProfile()
    
    state LoggedIn {
        [*] --> NoProfile
        NoProfile --> HasProfile: fetchProfile()
        HasProfile --> RegistrationPending: registration_completed = false
        HasProfile --> RegistrationComplete: registration_completed = true
    }
```

### ProtectedRoute - Route Guard

```javascript
// Cara kerja ProtectedRoute
function ProtectedRoute({ children, requireRegistration = true }) {
  const { user, profile, loading, hasCompletedRegistration } = useAuth();

  // 1. Masih loading? Tampilkan spinner
  if (loading) return <LoadingSpinner />;

  // 2. Belum login? Redirect ke /login
  if (!user) return <Navigate to="/login" />;

  // 3. Butuh registrasi tapi belum selesai? Redirect ke /register
  if (requireRegistration && profile && !hasCompletedRegistration()) {
    return <Navigate to="/register" />;
  }

  // 4. Semua OK, render children
  return children;
}
```

---

## Debugging Guide

### Common Issues

#### 1. "Infinite recursion detected in policy"
**Penyebab**: RLS policy konflik dengan trigger

**Solusi**: Jalankan SQL dari [supabase-setup.sql](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/supabase-setup.sql) yang sudah diperbaiki

#### 2. "Database error saving new user"
**Penyebab**: Trigger gagal insert ke profiles

**Solusi**: Pastikan tabel profiles ada dan trigger sudah benar

#### 3. Loading stuck / infinite loading
**Penyebab**: getSession() atau fetchProfile() hang

**Solusi**: Sudah ditambahkan timeout 5 detik di AuthContext

### Debug Checklist

```
□ Cek browser console untuk error
□ Cek Supabase Dashboard → Authentication → Users
□ Cek Supabase Dashboard → Table Editor → profiles
□ Pastikan .env.local ada dan benar
□ Pastikan SQL migration sudah dijalankan
```

### Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_URL=http://localhost:5173
```

---

## Quick Reference

### File Penting

| File | Fungsi |
|------|--------|
| [AuthContext.jsx](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/src/contexts/AuthContext.jsx) | Semua logic auth |
| [supabase.js](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/src/lib/supabase.js) | Config Supabase client |
| [ProtectedRoute.jsx](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/src/components/ProtectedRoute.jsx) | Route guard |
| [supabase-setup.sql](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/supabase-setup.sql) | Database setup |
| [.env.local](file:///c:/Users/Ryan/Projects/AI-Enhanced%20Personal%20Finance%20Assistant/.env.local) | Environment variables |

### Auth Methods

```javascript
const { 
  signUpWithEmail,    // Daftar dengan email
  signInWithEmail,    // Login dengan email
  signInWithGoogle,   // Login dengan Google
  signOut,            // Logout
  updateProfile,      // Update profile
  hasCompletedRegistration // Cek status registrasi
} = useAuth();
```
