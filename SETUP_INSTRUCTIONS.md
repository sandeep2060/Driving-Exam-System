# Database Setup Instructions

## How to Run the SQL Schema in Supabase

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Log in to your account
3. Select your project

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"** button

### Step 3: Copy the SQL File
1. Open the file `database_schema.sql` from your project folder
2. **Copy ALL the contents** of the file (Ctrl+A, then Ctrl+C)

### Step 4: Paste and Run
1. Paste the SQL code into the SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for the execution to complete

### Step 5: Verify
You should see a success message. The following tables and columns should now exist:
- ✅ `profiles` table with verification fields
- ✅ `exam_questions` table
- ✅ `exam_results` table
- ✅ RLS policies created

## Important Notes

⚠️ **DO NOT** try to run JavaScript/React files (`.jsx`, `.js`) in the SQL Editor
- Only run `.sql` files
- The file `database_schema.sql` is the correct file to use

## Troubleshooting

### If you get "relation already exists" errors:
- This is OK - it means the tables already exist
- The `IF NOT EXISTS` clauses prevent errors

### If you get permission errors:
- Make sure you're logged in as the project owner
- Check that you have the correct permissions

### If policies fail to create:
- Some policies might already exist
- You can ignore "already exists" errors for policies

## After Running the SQL

1. **Set your admin account:**
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

2. **Verify it worked:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name = 'verification_status';
   ```
   This should return a row if the column exists.

3. **Check tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('exam_questions', 'exam_results');
   ```

