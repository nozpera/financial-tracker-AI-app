-- ============================================
-- FINANCE AI - DATABASE SETUP WITH ROLES
-- Run this in Supabase SQL Editor
-- Includes: Role-based access system
-- ============================================

-- ============================================
-- STEP 1: CLEANUP EXISTING OBJECTS
-- ============================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_login();

-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: DROP ALL EXISTING RLS POLICIES
-- (This prevents conflicts and recursion)
-- ============================================

-- Drop ALL existing policies on profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Drop ALL existing policies on financial_profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'financial_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.financial_profiles', policy_record.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 3: CREATE/UPDATE PROFILES TABLE
-- ============================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
    registration_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'superadmin'));
    END IF;
END $$;

-- Add registration_completed column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'registration_completed'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Disable RLS temporarily to avoid issues during setup
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE TRIGGER FUNCTION
-- SECURITY DEFINER bypasses RLS for trigger operations
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        avatar_url, 
        role,
        registration_completed,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name', 
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        'user',  -- Default role is 'user'
        FALSE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, profiles.email),
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Error creating profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: ENABLE RLS WITH SIMPLE POLICIES
-- These policies avoid recursion by using simple checks
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Policy: Allow users to update their own profile  
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policy: Allow insert during signup (the trigger handles this with SECURITY DEFINER)
CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Policy: Allow service role full access (for triggers)
CREATE POLICY "profiles_service_role"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- STEP 6: FINANCIAL PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.financial_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    employment_status TEXT,
    industry TEXT,
    monthly_income DECIMAL(15,2),
    has_additional_income BOOLEAN DEFAULT FALSE,
    additional_income DECIMAL(15,2),
    salary_date INTEGER,
    monthly_fixed_expenses DECIMAL(15,2),
    largest_expense_category TEXT,
    total_savings DECIMAL(15,2),
    emergency_fund DECIMAL(15,2),
    average_monthly_expenses DECIMAL(15,2),
    has_debt BOOLEAN DEFAULT FALSE,
    monthly_debt_payment DECIMAL(15,2),
    total_outstanding_debt DECIMAL(15,2),
    debt_types JSONB DEFAULT '[]'::jsonb,
    financial_goals TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for financial_profiles
CREATE POLICY "financial_profiles_select_own"
    ON public.financial_profiles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "financial_profiles_insert_own"
    ON public.financial_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "financial_profiles_update_own"
    ON public.financial_profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "financial_profiles_delete_own"
    ON public.financial_profiles
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- STEP 7: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_financial_profiles_user_id ON public.financial_profiles(user_id);

-- ============================================
-- STEP 8: CREATE SUPERADMIN HELPER FUNCTION
-- Use this to promote a user to superadmin
-- ============================================

CREATE OR REPLACE FUNCTION public.set_user_role(user_email TEXT, new_role TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles 
    SET role = new_role, updated_at = NOW()
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE!
-- ============================================

SELECT 'SUCCESS: Database setup with roles completed!' as result;

-- ============================================
-- HOW TO CREATE SUPERADMIN:
-- ============================================
-- 1. First, create a user account via the app (signup)
-- 2. Then run this query in SQL Editor:
--
--    UPDATE profiles 
--    SET role = 'superadmin' 
--    WHERE email = 'your-email@example.com';
--
-- OR use the helper function:
--
--    SELECT set_user_role('your-email@example.com', 'superadmin');
--
-- ============================================
