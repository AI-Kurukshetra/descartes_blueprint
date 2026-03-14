-- Migration: Create test users for each role
-- Date: 2026-03-14
-- Description: Sets up RBAC role assignment based on email patterns
--
-- Test Credentials (create via Supabase Dashboard or /signup):
--   Admin:    admin@tradeguard.com     / Password123!
--   Manager:  manager@tradeguard.com   / Password123!
--   Analyst:  analyst@tradeguard.com   / Password123!
--   Viewer:   viewer@tradeguard.com    / Password123!
--
-- Users CANNOT change their own roles. Only admins can change OTHER users' roles
-- via the Settings > Team & Roles tab.

-- Update demo user to admin role (if exists)
UPDATE profiles
SET role = 'admin',
    full_name = 'Demo Admin',
    status = 'active'
WHERE email = 'demo@tradeguard.com';

-- Create a function to assign roles based on email pattern
-- This ensures new signups get the correct role automatically
CREATE OR REPLACE FUNCTION assign_role_by_email_pattern()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign role based on specific @tradeguard.com test emails
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
    -- Default role for regular signups
    NEW.role := COALESCE(NEW.role, 'viewer');
  END IF;

  -- Set status to active for all new users
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
