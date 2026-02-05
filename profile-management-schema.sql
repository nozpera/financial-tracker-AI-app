-- ============================================
-- EXTENSIONS
-- ============================================
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text search
CREATE EXTENSION IF NOT EXISTS "citext";


-- ============================================
-- CUSTOM TYPES & ENUMS
-- ============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin', 'superadmin');

-- Account status enum
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deleted', 'pending_verification');

-- Auth provider enum
CREATE TYPE auth_provider AS ENUM ('google', 'github', 'facebook', 'email', 'apple');


-- ============================================
-- MAIN TABLES
-- ============================================

-- ====== PROFILES TABLE ======
-- Extended user profile information
CREATE TABLE public.profiles (
  -- Primary Key
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic Info
  email CITEXT UNIQUE NOT NULL,
  username CITEXT UNIQUE,
  full_name TEXT,
  display_name TEXT,
  
  -- Profile Details
  avatar_url TEXT,
  bio TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Location
  country_code TEXT,
  city TEXT,
  timezone TEXT DEFAULT 'UTC',
  
  -- Account Management
  role user_role DEFAULT 'user',
  status account_status DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Preferences
  language TEXT DEFAULT 'id',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notification_enabled BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  
  -- Soft Delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;


-- ====== AUTH PROVIDERS TABLE ======
-- Track multiple auth providers per user
CREATE TABLE public.user_auth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider auth_provider NOT NULL,
  provider_user_id TEXT,
  provider_email TEXT,
  provider_data JSONB DEFAULT '{}'::jsonb,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate provider connections
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_auth_providers_user_id ON public.user_auth_providers(user_id);
CREATE INDEX idx_auth_providers_provider ON public.user_auth_providers(provider);


-- ====== USER SESSIONS TABLE ======
-- Track active sessions for security
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Session Info
  session_token TEXT UNIQUE,
  refresh_token TEXT,
  
  -- Device & Location
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  
  -- Session Lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  -- Flags
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = TRUE;


-- ====== ACTIVITY LOGS TABLE ======
-- Audit trail for user actions
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Activity Details
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  description TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);


-- ====== USER SETTINGS TABLE ======
-- Flexible key-value settings storage
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Settings
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, setting_key)
);

CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_user_settings_key ON public.user_settings(setting_key);


-- ====== EMAIL VERIFICATION TABLE ======
-- Track email verification tokens
CREATE TABLE public.email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email CITEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_user_id ON public.email_verifications(user_id);
CREATE INDEX idx_email_verifications_token ON public.email_verifications(token);


-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;


-- === PROFILES POLICIES ===

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Public profiles viewable by username (for public pages)
CREATE POLICY "Public profiles viewable"
  ON public.profiles
  FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);


-- === AUTH PROVIDERS POLICIES ===

CREATE POLICY "Users can view own auth providers"
  ON public.user_auth_providers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own auth providers"
  ON public.user_auth_providers
  FOR ALL
  USING (auth.uid() = user_id);


-- === USER SESSIONS POLICIES ===

CREATE POLICY "Users can view own sessions"
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke own sessions"
  ON public.user_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);


-- === ACTIVITY LOGS POLICIES ===

CREATE POLICY "Users can view own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );


-- === USER SETTINGS POLICIES ===

CREATE POLICY "Users can manage own settings"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id);


-- === EMAIL VERIFICATIONS POLICIES ===

CREATE POLICY "Users can view own email verifications"
  ON public.email_verifications
  FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- === AUTO-UPDATE TIMESTAMP FUNCTION ===
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Apply to user_settings
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- === AUTO-CREATE PROFILE ON SIGNUP ===
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  provider_type auth_provider;
BEGIN
  -- Determine auth provider
  CASE 
    WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN provider_type := 'google';
    WHEN NEW.raw_app_meta_data->>'provider' = 'github' THEN provider_type := 'github';
    WHEN NEW.raw_app_meta_data->>'provider' = 'facebook' THEN provider_type := 'facebook';
    WHEN NEW.raw_app_meta_data->>'provider' = 'apple' THEN provider_type := 'apple';
    ELSE provider_type := 'email';
  END CASE;

  -- Insert into profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    email_verified,
    last_sign_in_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email_confirmed_at IS NOT NULL,
    NOW()
  );

  -- Insert into auth_providers
  INSERT INTO public.user_auth_providers (
    user_id,
    provider,
    provider_user_id,
    provider_email,
    provider_data
  ) VALUES (
    NEW.id,
    provider_type,
    NEW.raw_app_meta_data->>'provider_id',
    NEW.email,
    NEW.raw_user_meta_data
  );

  -- Log activity
  INSERT INTO public.activity_logs (
    user_id,
    action,
    description
  ) VALUES (
    NEW.id,
    'user_signup',
    'New user registered via ' || provider_type
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- === UPDATE LAST SIGN IN ===
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_sign_in_at
  UPDATE public.profiles
  SET last_sign_in_at = NOW()
  WHERE id = NEW.id;

  -- Update auth provider last_used_at
  UPDATE public.user_auth_providers
  SET last_used_at = NOW()
  WHERE user_id = NEW.id 
    AND provider = COALESCE(
      (NEW.raw_app_meta_data->>'provider')::auth_provider,
      'email'::auth_provider
    );

  -- Log activity
  INSERT INTO public.activity_logs (
    user_id,
    action,
    description,
    ip_address
  ) VALUES (
    NEW.id,
    'user_login',
    'User signed in',
    NEW.last_sign_in_at -- This won't have IP, but we can add via app
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_user_login();


-- === SOFT DELETE FUNCTION ===
CREATE OR REPLACE FUNCTION public.soft_delete_user(user_id_to_delete UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    deleted_at = NOW(),
    status = 'deleted',
    email = 'deleted_' || id || '@deleted.local'
  WHERE id = user_id_to_delete;

  -- Revoke all sessions
  UPDATE public.user_sessions
  SET 
    is_active = FALSE,
    revoked_at = NOW()
  WHERE user_id = user_id_to_delete;

  -- Log activity
  INSERT INTO public.activity_logs (
    user_id,
    action,
    description
  ) VALUES (
    user_id_to_delete,
    'user_deleted',
    'User account soft deleted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- === GET USER STATS FUNCTION ===
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_logins', (
      SELECT COUNT(*) 
      FROM public.activity_logs 
      WHERE user_id = target_user_id AND action = 'user_login'
    ),
    'active_sessions', (
      SELECT COUNT(*) 
      FROM public.user_sessions 
      WHERE user_id = target_user_id AND is_active = TRUE
    ),
    'auth_providers', (
      SELECT json_agg(provider) 
      FROM public.user_auth_providers 
      WHERE user_id = target_user_id
    ),
    'account_age_days', (
      SELECT EXTRACT(DAY FROM NOW() - created_at) 
      FROM public.profiles 
      WHERE id = target_user_id
    ),
    'last_activity', (
      SELECT MAX(created_at) 
      FROM public.activity_logs 
      WHERE user_id = target_user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- INITIAL DATA & DEFAULTS
-- ============================================

-- Create default admin user settings template
CREATE OR REPLACE FUNCTION public.create_default_settings(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, setting_key, setting_value) VALUES
    (target_user_id, 'notifications', '{"email": true, "push": true, "sms": false}'::jsonb),
    (target_user_id, 'privacy', '{"profile_visible": true, "show_email": false}'::jsonb),
    (target_user_id, 'preferences', '{"theme": "light", "language": "id"}'::jsonb)
  ON CONFLICT (user_id, setting_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- UTILITY VIEWS
-- ============================================

-- Active users view
CREATE OR REPLACE VIEW public.active_users AS
SELECT 
  p.*,
  (SELECT json_agg(provider) FROM public.user_auth_providers WHERE user_id = p.id) as auth_providers,
  (SELECT COUNT(*) FROM public.user_sessions WHERE user_id = p.id AND is_active = TRUE) as active_sessions_count
FROM public.profiles p
WHERE p.status = 'active' AND p.deleted_at IS NULL;


-- User statistics view
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as users_last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as users_last_7d,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as users_last_30d,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE status = 'active') as active_users,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_users,
  COUNT(*) FILTER (WHERE role = 'premium') as premium_users
FROM public.profiles;


-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.profiles IS 'Main user profiles table with extended information';
COMMENT ON TABLE public.user_auth_providers IS 'Tracks authentication providers used by each user';
COMMENT ON TABLE public.user_sessions IS 'Active user sessions for security monitoring';
COMMENT ON TABLE public.activity_logs IS 'Audit trail of user actions';
COMMENT ON TABLE public.user_settings IS 'Flexible key-value user settings storage';
COMMENT ON TABLE public.email_verifications IS 'Email verification tokens and status';

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile and logs when new user signs up';
COMMENT ON FUNCTION public.handle_user_login() IS 'Updates last sign in time and logs user login';
COMMENT ON FUNCTION public.soft_delete_user(UUID) IS 'Soft deletes user account while preserving data';
COMMENT ON FUNCTION public.get_user_stats(UUID) IS 'Returns comprehensive statistics for a user';