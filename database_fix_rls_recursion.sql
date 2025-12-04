-- Fix for infinite recursion in RLS policies
-- This creates a function that bypasses RLS to check admin status

-- 1. Create a function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$;

-- 2. Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage exam questions" ON exam_questions;
DROP POLICY IF EXISTS "Admins can read all exam results" ON exam_results;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update verification status" ON profiles;

-- 3. Recreate policies using the function (avoids recursion)
CREATE POLICY "Admins can manage exam questions"
  ON exam_questions FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read all exam results"
  ON exam_results FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    is_admin(auth.uid())
    OR auth.uid() = id
  );

CREATE POLICY "Admins can update verification status"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 4. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon;

