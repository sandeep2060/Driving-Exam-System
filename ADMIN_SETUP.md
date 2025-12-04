# Admin Dashboard Setup Guide

This guide will help you set up the complete admin dashboard functionality for the Driving License System.

## Database Setup

### Step 1: Run the Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `database_schema.sql` file
4. Click **Run** to execute all the SQL commands

This will create:
- Verification fields in the `profiles` table
- `exam_questions` table for storing exam questions
- `exam_results` table for storing exam results
- Row Level Security (RLS) policies
- Indexes for better performance

### Step 2: Verify Tables

After running the SQL, verify that these tables exist:
- `profiles` (with verification fields)
- `exam_questions`
- `exam_results`

## Admin Dashboard Features

### 1. User Management

**Location:** Admin Dashboard → User Management

**Features:**
- View all users with their verification status
- Filter users by status (All, Not Submitted, Pending, Verified, Rejected)
- Search users by email, name, or phone
- View detailed user profile information
- Verify or reject user profiles
- Add rejection reasons when rejecting profiles

**How to Use:**
1. Navigate to "User Management" in the admin sidebar
2. Browse or search for users
3. Click "View Details" on any user
4. Review all profile information
5. Click "Verify Profile" to approve or "Reject Profile" to reject with a reason

### 2. Question Management

**Location:** Admin Dashboard → Question Management

**Features:**
- Add new exam questions
- Edit existing questions
- Delete questions
- View all questions with correct answers marked

**How to Use:**
1. Navigate to "Question Management" in the admin sidebar
2. Click "Add New Question"
3. Fill in:
   - Question text
   - Four options (A, B, C, D)
   - Correct answer
   - Optional explanation
4. Click "Add Question" to save
5. Use "Edit" or "Delete" buttons to manage existing questions

### 3. User Verification Workflow

**Process:**
1. User completes their profile (personal details, address, documents)
2. User submits profile for verification
3. Admin sees user in "Pending" status
4. Admin reviews user details
5. Admin either:
   - **Verifies** → User can now take the exam
   - **Rejects** → User must fix issues and resubmit

**Verification Statuses:**
- `not_submitted` - User hasn't submitted yet
- `pending` - Waiting for admin review
- `verified` - Approved, user can take exam
- `rejected` - Rejected, user needs to resubmit

## Exam System

### For Users:

1. **Profile Verification Required**
   - Users must have their profile verified before taking the exam
   - If not verified, they'll see a message to complete and submit their profile

2. **Taking the Exam**
   - Once verified, users can start the exam
   - Exam loads 20 random questions from the database
   - Users must answer all questions
   - Minimum 80% score required to pass
   - If failed, user must wait 90 days before retaking

3. **Exam Results**
   - Results are saved to the database
   - Users can see their score and pass/fail status

### For Admins:

- All exam questions are stored in `exam_questions` table
- Questions are randomly selected for each exam
- Exam results are stored in `exam_results` table
- Admins can view all exam results (future feature)

## Important Notes

1. **Admin Access**: Make sure your user account has `role = 'admin'` in the profiles table
2. **RLS Policies**: The database schema includes Row Level Security policies to ensure proper access control
3. **Question Pool**: Add at least 20 questions to the database for the exam system to work properly
4. **Verification**: Only verified users can take the exam

## Troubleshooting

### Admin can't see users
- Check that your profile has `role = 'admin'`
- Verify RLS policies are correctly set up

### Questions not loading
- Ensure `exam_questions` table exists
- Check that there are questions in the table
- Verify RLS policies allow reading questions

### Verification not working
- Check that `verification_status` column exists in profiles table
- Verify the status values match: 'not_submitted', 'pending', 'verified', 'rejected'

## Next Steps

1. Run the database schema SQL
2. Create an admin account (set role to 'admin' in profiles table)
3. Add some exam questions
4. Test the verification workflow
5. Test the exam system

