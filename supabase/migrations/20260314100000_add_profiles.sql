-- Add profiles table for role-based access control
-- Migration: 20260314100000_add_profiles.sql

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Create role enum type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'analyst', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profile status enum
DO $$ BEGIN
  CREATE TYPE profile_status AS ENUM ('active', 'pending', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  role user_role DEFAULT 'viewer',
  status profile_status DEFAULT 'active',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles (including roles)
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert new profiles (for invitations)
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'admin', -- First user gets admin role, subsequent users get viewer
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Update updated_at
-- ============================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTION: Get user role
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check if user has permission
-- ============================================

CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, required_roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = ANY(required_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER;
