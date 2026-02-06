# 🔐 Supabase Role Setup Guide

Panduan lengkap untuk mengatur sistem role (superadmin/user) di aplikasi Finance AI.

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Setup Database](#setup-database)
3. [Membuat Superadmin](#membuat-superadmin)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Overview

### Role System

| Role | Akses | Redirect Setelah Login |
|------|-------|------------------------|
| `user` | Home, Register | `/` atau `/register` |
| `superadmin` | Semua + Admin Panel | `/admin` |

### Flow Diagram

```
User Login → Fetch Profile → Check Role
                                │
                    ┌───────────┴───────────┐
                    │                       │
              role = user            role = superadmin
                    │                       │
            ┌───────┴───────┐               │
            │               │               │
    registered?      not registered    → /admin
            │               │
         → /           → /register
```

---

## Setup Database

### Step 1: Buka Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri

### Step 2: Jalankan Migration

1. Copy **seluruh isi** file `supabase-setup.sql`
2. Paste di SQL Editor
3. Klik **Run** (atau Ctrl+Enter)
4. Pastikan muncul: `SUCCESS: Database setup with roles completed!`

### Step 3: Verifikasi Kolom Role

Cek apakah kolom `role` sudah ada:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
```

Hasil yang diharapkan:
```
column_name | data_type | column_default
role        | text      | 'user'::text
```

---

## Membuat Superadmin

### Metode 1: Via SQL Query (Recommended)

**Langkah:**

1. Buat akun baru melalui aplikasi (signup dengan email/password atau Google)
2. Buka **SQL Editor** di Supabase Dashboard
3. Jalankan query berikut:

```sql
-- Ganti dengan email Anda
UPDATE profiles 
SET role = 'superadmin', updated_at = NOW()
WHERE email = 'your-email@example.com';
```

**Verifikasi:**

```sql
SELECT id, email, role, registration_completed 
FROM profiles 
WHERE email = 'your-email@example.com';
```

### Metode 2: Via Helper Function

```sql
SELECT set_user_role('your-email@example.com', 'superadmin');
```

### Metode 3: Via Table Editor (GUI)

1. Buka **Table Editor** di Supabase Dashboard
2. Pilih tabel `profiles`
3. Cari row dengan email Anda
4. Klik cell `role`
5. Ubah dari `user` ke `superadmin`
6. Klik di luar cell untuk save

---

## Testing

### Test 1: User Biasa

1. **Signup** dengan email baru
2. **Login** dengan akun tersebut
3. ✅ Expected: Redirect ke `/register` (form registrasi)
4. Selesaikan form registrasi
5. ✅ Expected: Redirect ke `/` (home page)

### Test 2: Superadmin

1. **Pastikan** akun sudah diset sebagai `superadmin`
2. **Login** dengan akun tersebut
3. ✅ Expected: Redirect ke `/admin` (admin panel)
4. Cek sidebar ada link preview pages

### Test 3: Proteksi Admin Panel

1. **Login** sebagai user biasa
2. Akses URL `/admin` langsung di browser
3. ✅ Expected: Redirect ke `/` (home page, bukan admin)

### Test 4: Cek Role di Browser Console

Setelah login, buka browser console (F12), ketik:

```javascript
// Jika menggunakan React DevTools, cari AuthContext
// Atau cek localStorage
JSON.parse(localStorage.getItem('finance-assistant-auth'))
```

---

## Troubleshooting

### Error: "column 'role' does not exist"

**Penyebab:** SQL migration belum dijalankan

**Solusi:** Jalankan `supabase-setup.sql` di SQL Editor

---

### Error: "infinite recursion detected"

**Penyebab:** RLS policy konflik

**Solusi:** Jalankan ulang `supabase-setup.sql` yang sudah diperbaiki

---

### Tidak redirect ke Admin setelah login

**Kemungkinan penyebab:**
1. Role belum diset ke `superadmin`
2. Profile belum ter-fetch

**Debug:**
```sql
SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
```

**Solusi:**
```sql
UPDATE profiles SET role = 'superadmin' WHERE email = 'your-email@example.com';
```

---

### User bisa akses /admin padahal bukan superadmin

**Penyebab:** AdminProtectedRoute tidak bekerja

**Cek:**
1. `AdminProtectedRoute.jsx` sudah dibuat
2. Import di `App.jsx` sudah benar
3. Route `/admin` menggunakan `AdminProtectedRoute`

---

## Quick Reference

### SQL Queries

```sql
-- Lihat semua users dengan role
SELECT email, role, registration_completed FROM profiles;

-- Set user sebagai superadmin
UPDATE profiles SET role = 'superadmin' WHERE email = 'email@example.com';

-- Set user kembali ke user biasa
UPDATE profiles SET role = 'user' WHERE email = 'email@example.com';

-- Lihat jumlah user per role
SELECT role, COUNT(*) FROM profiles GROUP BY role;
```

### File Penting

| File | Fungsi |
|------|--------|
| `supabase-setup.sql` | Database migration dengan role |
| `AuthContext.jsx` | `isSuperAdmin()` helper |
| `AdminProtectedRoute.jsx` | Proteksi route admin |
| `Admin.jsx` | Halaman admin panel |
| `Login.jsx` | Redirect logic berdasarkan role |

---

## Superadmin Credentials Template

Buat akun superadmin dengan credentials:

```
Email: superadmin@financeai.app
Password: [set strong password]
Role: superadmin (set via SQL)
```

**Catatan:** Simpan credentials di tempat yang aman!
