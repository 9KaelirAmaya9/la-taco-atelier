# Vercel Deployment - Step by Step Guide

Let's get your site deployed to Vercel in the next 5 minutes!

---

## Before You Start - What You Need

### 1. Your Supabase Credentials
You'll need these two values. Find them in your Supabase dashboard:

**Where to find them:**
- Go to https://supabase.com/dashboard
- Select your project
- Go to Settings → API
- You'll see:
  - `Project URL` → This is your `VITE_SUPABASE_URL`
  - `anon/public` key → This is your `VITE_SUPABASE_ANON_KEY`

**Copy both values somewhere** - you'll paste them in Vercel in a minute.

---

## Step 1: Sign Up / Sign In to Vercel

1. **Go to:** https://vercel.com
2. **Click:** "Sign Up" (top right)
3. **Choose:** "Continue with GitHub"
4. **Authorize** Vercel to access your GitHub account
5. You'll be redirected to Vercel dashboard

**Note:** If you already have a Vercel account, just sign in!

---

## Step 2: Import Your Project

1. **On Vercel dashboard**, click "Add New..." button
2. Choose **"Project"**
3. **Import Git Repository** section appears
4. Click **"Import"** next to `la-taco-atelier` repository
   - If you don't see it, click "Add GitHub Account" to grant access
   - Make sure you're selecting the correct repository (the one with all your code)

---

## Step 3: Configure Project

You'll see a configuration page. Here's what to do:

### Project Settings:
- **Project Name:** `la-taco-atelier` (or whatever you want)
- **Framework Preset:** Should auto-detect as "Vite" ✓
- **Root Directory:** Leave as `./` (default)
- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `dist` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

### Node.js Version:
- Use the default (20.x or 18.x is fine)

---

## Step 4: Add Environment Variables (IMPORTANT!)

This is the most important step - don't skip!

1. **Expand** "Environment Variables" section
2. **Add these TWO variables:**

**Variable 1:**
- **Key:** `VITE_SUPABASE_URL`
- **Value:** [Paste your Supabase Project URL here]
- Click "Add"

**Variable 2:**
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** [Paste your Supabase anon public key here]
- Click "Add"

**Double-check:**
- ✅ Both variables are added
- ✅ Names are EXACTLY: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ✅ Values are pasted correctly (no extra spaces)

---

## Step 5: Deploy!

1. **Click the big "Deploy" button**
2. **Wait 2-3 minutes** - you'll see:
   - Building... (installing dependencies)
   - Building... (running build command)
   - Deploying... (uploading to Vercel)
   - ✓ Success!

**What you'll see:**
- A progress screen with logs
- You can watch the build happen in real-time
- Any errors will show up here (hopefully none!)

---

## Step 6: Your Site is Live! 🎉

Once deployment completes:

1. You'll see **"Congratulations!"** or similar success message
2. You'll get a URL like: `https://la-taco-atelier-xxx.vercel.app`
3. **Click "Visit"** button to see your live site

---

## Step 7: Verify Everything Works

### Test these things:

1. **Homepage loads** - ✓ Should look exactly like localhost
2. **Try to login** - ✓ Should work with your Supabase credentials
3. **Navigate to dashboard** - ✓ Should load properly
4. **Test the features** - ✓ Everything should work

### If something doesn't work:
- Check the browser console (F12) for errors
- Go back to Vercel dashboard → Project → Settings → Environment Variables
- Make sure both variables are set correctly
- If you need to fix them, click "Redeploy" after updating

---

## Step 8: Set Up Auto-Deploy (Already Done!)

Good news - this is automatic! Now whenever you:
1. Make changes locally
2. Commit to git
3. Push to GitHub (`git push origin main`)

Vercel will automatically:
- Detect the change
- Build your code
- Deploy the update
- Usually takes 2-3 minutes

**No manual work needed!**

---

## Your New Workflow

### Making Updates:
```bash
# 1. Make your changes in VS Code
# 2. Save files

# 3. Commit changes
git add .
git commit -m "Your update message"

# 4. Push to GitHub
git push origin main

# 5. Wait 2-3 minutes - Vercel auto-deploys!
# 6. Visit your Vercel URL to see changes
```

---

## Troubleshooting

### Build Fails
**Check:** Vercel dashboard → Your Project → Deployments → Click latest → View Build Logs
**Look for:** Error messages in red
**Common fixes:**
- Missing environment variables
- Build command issue (should be `npm run build`)
- Dependencies issue (usually auto-resolves)

### Site Loads but Auth Doesn't Work
**Problem:** Environment variables not set
**Fix:**
1. Go to Project Settings → Environment Variables
2. Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist
3. If missing/wrong, add/fix them
4. Click "Redeploy" button

### Changes Not Showing Up
**Wait:** 2-3 minutes after pushing to GitHub
**Check:** Vercel dashboard shows "Building" or "Deploying"
**Try:** Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Optional: Custom Domain

Want `yourdomain.com` instead of `vercel.app`?

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow Vercel's instructions to:
   - Update DNS settings at your domain registrar
   - Wait for DNS propagation (can take a few hours)
5. Done!

**Cost:** Domain registration only ($10-15/year), Vercel hosting still FREE

---

## Next Steps After Deployment

1. ✅ **Test everything** on your new Vercel URL
2. ✅ **Bookmark the URL** for easy access
3. ✅ **Share it** - your site is now live!
4. ✅ **Optional:** Set up custom domain
5. ✅ **Optional:** Disconnect Lovable if you're done with it

---

## Quick Reference

**Your Vercel Dashboard:** https://vercel.com/dashboard
**View Deployments:** Dashboard → Your Project → Deployments
**View Logs:** Click any deployment → View Function Logs or Build Logs
**Environment Variables:** Project → Settings → Environment Variables
**Redeploy:** Project → Deployments → ⋯ menu → Redeploy

---

## Questions?

If something doesn't work:
1. Check build logs in Vercel dashboard
2. Check browser console (F12)
3. Verify environment variables are set correctly
4. Try redeploying

**Most common issue:** Forgetting to set environment variables!

---

Ready? Let's do this! 🚀

**Start at Step 1** and work your way down. Should take about 5 minutes total.
