-- Migration script to add image support to existing exam_questions table
-- Run this if you already have the exam_questions table

-- First, make option columns nullable (if they're not already)
ALTER TABLE exam_questions 
ALTER COLUMN option_a DROP NOT NULL,
ALTER COLUMN option_b DROP NOT NULL,
ALTER COLUMN option_c DROP NOT NULL,
ALTER COLUMN option_d DROP NOT NULL;

-- Add new columns for image support
ALTER TABLE exam_questions 
ADD COLUMN IF NOT EXISTS question_image_url TEXT,
ADD COLUMN IF NOT EXISTS option_a_type TEXT DEFAULT 'text' CHECK (option_a_type IN ('text', 'image_url', 'image_file')),
ADD COLUMN IF NOT EXISTS option_a_image_url TEXT,
ADD COLUMN IF NOT EXISTS option_b_type TEXT DEFAULT 'text' CHECK (option_b_type IN ('text', 'image_url', 'image_file')),
ADD COLUMN IF NOT EXISTS option_b_image_url TEXT,
ADD COLUMN IF NOT EXISTS option_c_type TEXT DEFAULT 'text' CHECK (option_c_type IN ('text', 'image_url', 'image_file')),
ADD COLUMN IF NOT EXISTS option_c_image_url TEXT,
ADD COLUMN IF NOT EXISTS option_d_type TEXT DEFAULT 'text' CHECK (option_d_type IN ('text', 'image_url', 'image_file')),
ADD COLUMN IF NOT EXISTS option_d_image_url TEXT;

-- Update existing rows to have 'text' type
UPDATE exam_questions 
SET 
  option_a_type = 'text',
  option_b_type = 'text',
  option_c_type = 'text',
  option_d_type = 'text'
WHERE option_a_type IS NULL;

