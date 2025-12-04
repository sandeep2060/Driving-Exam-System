-- Database Schema for Driving License System
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Update profiles table to add verification fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_reason TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Add other missing columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name_en TEXT,
ADD COLUMN IF NOT EXISTS full_name_nepali TEXT,
ADD COLUMN IF NOT EXISTS dob_ad DATE,
ADD COLUMN IF NOT EXISTS dob_bs TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS guardian_name TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS municipality TEXT,
ADD COLUMN IF NOT EXISTS ward TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS temporary_address TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS government_id_type TEXT CHECK (government_id_type IN ('citizenship', 'national_id')),
ADD COLUMN IF NOT EXISTS citizenship_number TEXT,
ADD COLUMN IF NOT EXISTS citizenship_issue_date DATE,
ADD COLUMN IF NOT EXISTS citizenship_issue_district TEXT,
ADD COLUMN IF NOT EXISTS national_id_number TEXT;

-- 2. Create exam_questions table
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  question_image_url TEXT,
  option_a TEXT,
  option_a_type TEXT DEFAULT 'text' CHECK (option_a_type IN ('text', 'image_url', 'image_file')),
  option_a_image_url TEXT,
  option_b TEXT,
  option_b_type TEXT DEFAULT 'text' CHECK (option_b_type IN ('text', 'image_url', 'image_file')),
  option_b_image_url TEXT,
  option_c TEXT,
  option_c_type TEXT DEFAULT 'text' CHECK (option_c_type IN ('text', 'image_url', 'image_file')),
  option_c_image_url TEXT,
  option_d TEXT,
  option_d_type TEXT DEFAULT 'text' CHECK (option_d_type IN ('text', 'image_url', 'image_file')),
  option_d_image_url TEXT,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create exam_results table
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  answers JSONB,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create a function to check if user is admin (bypasses RLS to avoid recursion)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for exam_questions
-- Drop policies if they exist, then create them
DROP POLICY IF EXISTS "Anyone can read exam questions" ON exam_questions;
CREATE POLICY "Anyone can read exam questions"
  ON exam_questions FOR SELECT
  USING (true);

-- Only admins can insert/update/delete questions (using function to avoid recursion)
DROP POLICY IF EXISTS "Admins can manage exam questions" ON exam_questions;
CREATE POLICY "Admins can manage exam questions"
  ON exam_questions FOR ALL
  USING (is_admin(auth.uid()));

-- 7. Create RLS Policies for exam_results
-- Drop policies if they exist, then create them
DROP POLICY IF EXISTS "Users can read their own exam results" ON exam_results;
CREATE POLICY "Users can read their own exam results"
  ON exam_results FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own results
DROP POLICY IF EXISTS "Users can insert their own exam results" ON exam_results;
CREATE POLICY "Users can insert their own exam results"
  ON exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all results (using function to avoid recursion)
DROP POLICY IF EXISTS "Admins can read all exam results" ON exam_results;
CREATE POLICY "Admins can read all exam results"
  ON exam_results FOR SELECT
  USING (is_admin(auth.uid()));

-- 8. Update profiles RLS to allow admins to read all profiles
-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    is_admin(auth.uid())
    OR auth.uid() = id
  );

-- Allow admins to update verification status (using function to avoid recursion)
-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Admins can update verification status" ON profiles;
CREATE POLICY "Admins can update verification status"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 9. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_taken_at ON exam_results(taken_at);

