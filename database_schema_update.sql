-- Update exam_questions table to support images
-- Run this SQL to add image support columns

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

-- Note: For image_file type, we'll store the file path/URL after uploading to Supabase Storage
-- You'll need to set up a storage bucket for exam images

