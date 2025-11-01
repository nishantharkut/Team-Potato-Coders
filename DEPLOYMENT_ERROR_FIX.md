# Fix Deployment Errors - Step by Step

## Common Deployment Errors & Solutions

### Error 1: `MIDDLEWARE_INVOCATION_FAILED` (500 Error)

**Cause**: Clerk environment variables missing or incorrect

**Fix**:

1. **Check Vercel Environment Variables**:
   - Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
   - Verify these are set:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
     CLERK_SECRET_KEY=sk_test_... (or sk_live_...)
     ```

2. **Get Clerk Keys** (if missing):
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Select your application
   - Go to **API Keys** section
   - Copy both keys

3. **Add to Vercel**:
   - Click "Add New" in Environment Variables
   - Add each key separately
   - Enable for: Production, Preview, Development
   - **Save**

4. **Redeploy** (CRITICAL):
   - Deployments → Latest deployment → Three dots (⋮) → **Redeploy**
   - OR push a new commit: `git push`

---

### Error 2: Build Fails - Prisma Generation Error

**Cause**: Database connection string missing or Prisma can't generate client

**Fix**:

1. **Check DATABASE_URL is set in Vercel**:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

2. **If using Supabase**:
   - Go to Supabase Dashboard → Settings → Database
   - Copy connection string (Session mode, port 5432)
   - Replace `[YOUR-PASSWORD]` with actual password
   - Add to Vercel Environment Variables

3. **Run migrations** (if database is empty):
   - Locally: `pnpm prisma migrate deploy`
   - OR migrations run automatically via `vercel.json` buildCommand

---

### Error 3: Build Succeeds But Site Shows 500 Errors

**Cause**: Missing required environment variables at runtime

**Fix**:

Check ALL these are set in Vercel:

#### Required Minimum:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
```

#### Recommended:
```
NEXT_PUBLIC_APP_URL=https://team-potato-coders.vercel.app
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### Optional (if using features):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
CLOUDINARY_URL=cloudinary://...
```

---

## Quick Diagnostic Steps

### Step 1: Verify Build Logs
1. Go to Vercel → Deployments
2. Click on the failed deployment
3. Check **Build Logs** tab
4. Look for specific error messages

### Step 2: Check Function Logs
1. Same deployment page
2. Click **Functions** tab
3. Look for runtime errors

### Step 3: Verify Environment Variables
1. Vercel → Settings → Environment Variables
2. Make sure all required variables are present
3. Check they're enabled for the correct environment (Production/Preview)

### Step 4: Test Locally First
```bash
# Make sure .env.local has all variables
pnpm build
pnpm start
```

---

## Emergency Workaround: Deploy Without Clerk

If Clerk keys are still missing and you need to deploy:

The middleware now has a safety check that bypasses Clerk if keys are missing. However, for production, you should always set Clerk keys.

---

## Still Not Working?

1. **Share the exact error message** from Vercel logs
2. **Check Vercel Status**: https://vercel-status.com
3. **Verify**:
   - Database is accessible (test connection string)
   - Clerk application is active
   - All environment variables have no typos or extra spaces

---

## Success Checklist

Before deploying, verify:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set in Vercel
- ✅ `CLERK_SECRET_KEY` set in Vercel
- ✅ `DATABASE_URL` set in Vercel (if using database)
- ✅ All variables enabled for Production environment
- ✅ Build completes successfully
- ✅ No middleware errors in logs

