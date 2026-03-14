-- Seed Script: Create Test Users for RBAC Testing
-- Date: 2026-03-14
--
-- IMPORTANT: This script sets up profiles that will automatically get assigned
-- when users sign up with these specific emails.
--
-- Test Credentials:
-- ==================
-- Admin:    admin@tradeguard.com     / Password123!
-- Manager:  manager@tradeguard.com   / Password123!
-- Analyst:  analyst@tradeguard.com   / Password123!
-- Viewer:   viewer@tradeguard.com    / Password123!
--
-- HOW TO CREATE USERS:
-- ====================
-- Option 1: Use Supabase Dashboard
--   1. Go to Authentication > Users
--   2. Click "Add user" > "Create new user"
--   3. Enter email and password from above
--   4. The profile trigger will auto-assign role based on email
--
-- Option 2: Use the signup page
--   1. Go to /signup
--   2. Create account with one of the emails above
--   3. Role is auto-assigned based on email pattern

-- First, ensure the role assignment function exists
CREATE OR REPLACE FUNCTION assign_role_by_email_pattern()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign role based on email pattern for testing
  IF NEW.email LIKE 'admin%@tradeguard.com' THEN
    NEW.role := 'admin';
  ELSIF NEW.email LIKE 'manager%@tradeguard.com' THEN
    NEW.role := 'manager';
  ELSIF NEW.email LIKE 'analyst%@tradeguard.com' THEN
    NEW.role := 'analyst';
  ELSIF NEW.email LIKE 'viewer%@tradeguard.com' THEN
    NEW.role := 'viewer';
  ELSIF NEW.email = 'demo@tradeguard.com' THEN
    NEW.role := 'admin';
  ELSE
    -- Default role for other signups
    NEW.role := COALESCE(NEW.role, 'viewer');
  END IF;

  -- Set status to active
  NEW.status := COALESCE(NEW.status, 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS assign_role_on_profile_create ON profiles;
CREATE TRIGGER assign_role_on_profile_create
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_role_by_email_pattern();

-- Also update existing profiles if they exist with test emails
UPDATE profiles SET role = 'admin', status = 'active'
WHERE email LIKE 'admin%@tradeguard.com' OR email = 'demo@tradeguard.com';

UPDATE profiles SET role = 'manager', status = 'active'
WHERE email LIKE 'manager%@tradeguard.com';

UPDATE profiles SET role = 'analyst', status = 'active'
WHERE email LIKE 'analyst%@tradeguard.com';

UPDATE profiles SET role = 'viewer', status = 'active'
WHERE email LIKE 'viewer%@tradeguard.com';

-- Grant notification that setup is complete
DO $$
BEGIN
  RAISE NOTICE 'RBAC Test User Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Test Credentials:';
  RAISE NOTICE '  Admin:   admin@tradeguard.com   / Password123!';
  RAISE NOTICE '  Manager: manager@tradeguard.com / Password123!';
  RAISE NOTICE '  Analyst: analyst@tradeguard.com / Password123!';
  RAISE NOTICE '  Viewer:  viewer@tradeguard.com  / Password123!';
  RAISE NOTICE '';
  RAISE NOTICE 'Create users via Supabase Dashboard or /signup page.';
END $$;
