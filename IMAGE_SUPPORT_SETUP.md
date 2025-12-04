# Image Support Setup Guide

## Overview

The exam system now supports images in questions and options. You can use:
- **Text** - Plain text options
- **Image URL** - Direct URL to an image
- **Image File** - Upload image files (requires Supabase Storage setup)

## Database Update

Run the `database_schema_update.sql` file in Supabase SQL Editor to add image support columns, OR the main `database_schema.sql` has been updated to include these columns.

## Supabase Storage Setup (for Image Uploads)

If you want to use the "Upload Image" feature, you need to set up Supabase Storage:

### Step 1: Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Name it: `exam-images`
4. Set it as **Public** (so images can be accessed)
5. Click **"Create bucket"**

### Step 2: Set Storage Policies

Go to **Storage** → **Policies** → `exam-images` and add:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Authenticated users can upload exam images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exam-images');
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public can read exam images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exam-images');
```

**Policy 3: Allow admins to delete**
```sql
CREATE POLICY "Admins can delete exam images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'exam-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

## Alternative: Use Image URLs Only

If you don't want to set up storage, you can:
1. Upload images to a hosting service (Imgur, Cloudinary, etc.)
2. Use the "Image URL" option in the question form
3. Paste the image URL directly

## Using Images in Questions

### For Admins:

1. **Add Question Image:**
   - Enter question text
   - Optionally add a question image URL

2. **Add Option Images:**
   - For each option (A, B, C, D), choose:
     - **Text** - Enter text
     - **Image URL** - Paste image URL
     - **Upload Image** - Upload file (requires storage setup)

3. **Preview:**
   - Images will show previews when you enter URLs or upload files

### For Users Taking Exam:

- Questions with images will display the images
- Options with images will show the images instead of text
- Users can click on image options just like text options

## Troubleshooting

### "Failed to save question" Error

**Common causes:**
1. **RLS Policy Issue** - Make sure you're logged in as admin
2. **Missing Columns** - Run the database schema update SQL
3. **Validation Error** - Check that all required fields are filled

**To debug:**
- Open browser console (F12)
- Look for error messages
- Check the error details in the console

### Images Not Displaying

1. **Check URL** - Make sure image URLs are valid and accessible
2. **CORS Issues** - Some image hosts block cross-origin requests
3. **Storage Setup** - If using file upload, ensure storage bucket is set up correctly

### File Upload Not Working

1. **Storage Bucket** - Ensure `exam-images` bucket exists
2. **Storage Policies** - Check that upload policies are set correctly
3. **File Size** - Maximum file size is 5MB
4. **File Type** - Only image files are allowed

## Best Practices

1. **Image URLs** - Use reliable image hosting services
2. **File Size** - Keep images under 1MB for faster loading
3. **Image Dimensions** - Use reasonable sizes (max 800x600px recommended)
4. **Alt Text** - The system uses option labels as alt text
5. **Backup** - Keep copies of uploaded images

## Notes

- Image uploads use Supabase Storage if configured
- If storage is not set up, file uploads will fall back to data URLs (base64)
- Data URLs work but increase database size
- For production, use proper image hosting or Supabase Storage

