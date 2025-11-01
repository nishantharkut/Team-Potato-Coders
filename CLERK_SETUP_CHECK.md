# Clerk Setup Verification Checklist

## ✅ What's Already Done
- ✅ `@clerk/nextjs` is installed (v6.12.0)
- ✅ `ClerkProvider` is set up in `src/app/layout.js`
- ✅ Middleware updated to match Clerk's official pattern

## 🔧 What You Need to Do in Vercel

### Step 1: Get Your Clerk Keys
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** in the sidebar
4. Copy:
   - **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret Key** (starts with `sk_test_...` or `sk_live_...`)

### Step 2: Add Environment Variables to Vercel
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these two variables:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_... (your actual key)
   CLERK_SECRET_KEY = sk_test_... (your actual key)
   ```

4. **Important**: Enable for all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 3: Redeploy
**CRITICAL**: After adding environment variables, you MUST redeploy:

**Option A: Redeploy via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (⋮) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Option B: Push a new commit**
```bash
git add .
git commit -m "Update Clerk middleware"
git push
```

## 🧪 Testing
After redeployment, test:
1. Visit your Vercel URL: `https://team-potato-coders.vercel.app`
2. The Clerk handshake should work without 500 errors
3. Try signing in/signing up

## 🔍 Troubleshooting

### Still getting 500 errors?
1. **Verify keys are set correctly in Vercel**
   - Go to Settings → Environment Variables
   - Make sure both keys are present
   - Check for typos or extra spaces

2. **Check Vercel logs**
   - Go to Deployments → Select deployment → Functions tab
   - Look for middleware errors

3. **Verify Clerk Dashboard settings**
   - Make sure your application is active
   - Check that the domain is allowed in Clerk settings
   - Go to Clerk Dashboard → Domains
   - Add `team-potato-coders.vercel.app` if not present

### Common Issues
- **"Missing publishable key"**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing or incorrect
- **"Missing secret key"**: `CLERK_SECRET_KEY` is missing or incorrect
- **"Invalid domain"**: Your Vercel domain needs to be added to Clerk Dashboard → Domains

## 📝 Notes
- The middleware now uses Clerk's official pattern which properly handles handshake requests
- Public routes (like `/`, `/pricing`, `/sign-in`) don't require authentication
- Protected routes (`/dashboard`, `/resume`, etc.) will redirect to sign-in if not authenticated
