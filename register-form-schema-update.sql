-- ============================================
-- REGISTER FORM IMPROVEMENTS - DATA CLEANUP & SCHEMA UPDATE
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DELETE TEST USERS (Keep Superadmin)
-- ============================================

-- First, delete financial_profiles for non-superadmin users
DELETE FROM financial_profiles 
WHERE user_id IN (
    SELECT id FROM profiles WHERE role = 'user' OR role IS NULL
);

-- Then delete profiles for non-superadmin users
DELETE FROM profiles WHERE role = 'user' OR role IS NULL;

-- Delete from auth.users (this will cascade)
-- Note: This requires service_role access or manual deletion from Auth dashboard
-- The above deletes should handle the data cleanup

-- Verify superadmin still exists
SELECT id, email, role FROM profiles;

-- ============================================
-- STEP 2: ADD NEW COLUMNS TO FINANCIAL_PROFILES
-- For improved AI data validity
-- ============================================

-- A. Income Improvements
-- Income stability indicator (for freelancers/business owners)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'income_stability'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN income_stability TEXT CHECK (income_stability IN ('stable', 'fluctuating'));
    END IF;
END $$;

-- Income type (gross or net)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'income_type'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN income_type TEXT DEFAULT 'net' CHECK (income_type IN ('gross', 'net'));
    END IF;
END $$;

-- B. Expense Improvements
-- Expenses Needs (pengeluaran wajib)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'expenses_needs'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN expenses_needs DECIMAL(15,2);
    END IF;
END $$;

-- Expenses Wants (pengeluaran gaya hidup)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'expenses_wants'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN expenses_wants DECIMAL(15,2);
    END IF;
END $$;

-- Annual expenses (json array of expense types)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'annual_expenses'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN annual_expenses JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Annual expenses total
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'annual_expenses_total'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN annual_expenses_total DECIMAL(15,2);
    END IF;
END $$;

-- C. Debt Improvements
-- Debt interest level indicator
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'debt_interest_level'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN debt_interest_level TEXT CHECK (debt_interest_level IN ('low', 'medium', 'high', 'mixed'));
    END IF;
END $$;

-- Debt category (productive/consumptive/mixed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_profiles' AND column_name = 'debt_category'
    ) THEN
        ALTER TABLE financial_profiles 
        ADD COLUMN debt_category TEXT CHECK (debt_category IN ('productive', 'consumptive', 'mixed'));
    END IF;
END $$;

-- ============================================
-- STEP 3: VERIFY SCHEMA
-- ============================================

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'financial_profiles'
ORDER BY ordinal_position;

-- ============================================
-- DONE!
-- ============================================

SELECT 'SUCCESS: Schema updated with new columns for AI data validity!' as result;
