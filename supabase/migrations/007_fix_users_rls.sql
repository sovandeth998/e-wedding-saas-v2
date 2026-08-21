-- Drop the problematic self-referencing policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Simple: user can read own profile
-- Admin can be checked via API or server-side only
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Allow authenticated users to read own row (including role)
CREATE POLICY "Users read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Ensure all registered users have a row
-- Run this if needed:
-- INSERT INTO users (id, email) SELECT id, email FROM auth.users ON CONFLICT (id) DO NOTHING;
