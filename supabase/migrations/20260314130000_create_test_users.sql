-- Migration: Create test users for each role
-- Date: 2026-03-14
-- Description: Creates demo accounts for testing RBAC

-- Note: Users are created via Supabase Auth, but we can update profiles
-- for existing users or prepare the profile entries

-- Update demo user to admin role (if exists)
UPDATE profiles
SET role = 'admin',
    full_name = 'Demo Admin',
    status = 'active'
WHERE email = 'demo@tradeguard.com';

-- Insert test user profiles (these will be linked when users sign up)
-- The actual auth users need to be created via signup or Supabase dashboard

-- For testing, we can insert placeholder profiles that match when users sign up:
-- Email patterns for role assignment trigger

-- Create a function to assign roles based on email pattern
CREATE OR REPLACE FUNCTION assign_role_by_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign role based on email pattern for testing
  IF NEW.email LIKE '%admin%' THEN
    NEW.role := 'admin';
  ELSIF NEW.email LIKE '%manager%' THEN
    NEW.role := 'manager';
  ELSIF NEW.email LIKE '%analyst%' THEN
    NEW.role := 'analyst';
  ELSIF NEW.email LIKE '%viewer%' THEN
    NEW.role := 'viewer';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS assign_role_on_profile_create ON profiles;
CREATE TRIGGER assign_role_on_profile_create
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_role_by_email();
