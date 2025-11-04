# NextAuth Migration Guide

This project has been migrated from Clerk to NextAuth.js v5 (Auth.js).

## Database Migration Required

You need to run a database migration on your Supabase database. Follow these steps:

### 1. Connect to your Supabase database

Go to your Supabase project → SQL Editor and run the following migration:

```sql
-- Add NextAuth fields to User table
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "password" TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

-- Remove Clerk field (if exists)
ALTER TABLE "User" 
  DROP COLUMN IF EXISTS "clerkUserId";

-- Create NextAuth tables
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" 
  ON "Account"("provider", "providerAccountId");

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" 
  ON "Session"("sessionToken");

-- Add foreign keys
ALTER TABLE "Account" 
  ADD CONSTRAINT "Account_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" 
  ADD CONSTRAINT "Session_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;
```

### 2. Update Environment Variables

Remove all Clerk-related environment variables and add NextAuth variables:

**Remove these:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

**Add these:**
```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
```

Generate a secret with:
```bash
openssl rand -base64 32
```

**Optional (for password reset emails):**
```bash
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourapp.com
```

### 3. Notes on User Data

⚠️ **Important:** All existing user data has been reset. Users will need to create new accounts.

If you need to migrate existing users:
1. Export user data from Clerk
2. Create a migration script to:
   - Hash passwords using bcrypt
   - Map Clerk user IDs to new system
   - Import into the database

### 4. Deploy Changes

1. Push your code changes to your repository
2. Vercel will automatically redeploy
3. Make sure all environment variables are set in Vercel

### 5. Testing

Test the following flows:
- ✅ Sign up with new account
- ✅ Sign in with credentials
- ✅ Password reset flow
- ✅ Protected routes redirect to sign-in
- ✅ User profile updates
- ✅ All authenticated features work

## New Authentication Flow

### Sign Up
- Users create accounts with email/password
- Passwords are hashed with bcrypt (12 rounds)
- Auto sign-in after registration

### Sign In
- Email and password authentication
- Session-based with JWT tokens
- Automatic redirect to dashboard

### Password Reset
1. User requests reset at `/forgot-password`
2. Reset token generated and stored
3. Email sent with reset link (if configured)
4. User sets new password at `/reset-password?token=...`
5. Auto sign-in after successful reset

## UI Preservation

All UI components have been updated to match the previous Clerk styling:
- Custom sign-in/sign-up pages with matching design
- User profile dropdown with same functionality
- Protected routes work the same way
- Session management is transparent to users

## API Changes

Server actions and API routes now use:
```javascript
import { auth } from "@/auth";

const session = await auth();
const userId = session?.user?.id;
```

Instead of Clerk's:
```javascript
const { userId } = await auth();
```

## Support

If you encounter any issues:
1. Check that all environment variables are set
2. Verify the database migration ran successfully
3. Clear browser cookies and try again
4. Check Vercel logs for errors


