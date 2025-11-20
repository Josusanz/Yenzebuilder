# 🚀 YENZE Builder - Deployment Checklist

Use this checklist to ensure everything is properly configured before going live.

---

## ✅ Pre-Deployment Checklist

### 1. Supabase Configuration

- [ ] Created Supabase project
- [ ] Ran `supabase-schema.sql` in SQL Editor successfully
- [ ] Confirmed all tables created:
  - [ ] `projects`
  - [ ] `subscriptions`
  - [ ] `deployments`
  - [ ] `profiles`
- [ ] Verified RLS policies are enabled on all tables
- [ ] Enabled Email/Password authentication
- [ ] (Optional) Configured Google OAuth
- [ ] (Optional) Configured GitHub OAuth
- [ ] Copied Project URL and anon key
- [ ] Updated `config.js` with Supabase credentials
- [ ] Tested signup with email
- [ ] Tested login with email
- [ ] Confirmed user appears in `auth.users` table
- [ ] Confirmed profile created automatically in `profiles` table

### 2. Stripe Configuration

- [ ] Created Stripe account
- [ ] Created PRO product ($9.99/month)
- [ ] Created BUSINESS product ($29.99/month)
- [ ] Copied Price IDs for PRO and BUSINESS
- [ ] Updated `config.js` with Stripe Price IDs
- [ ] Got Stripe publishable key (pk_test_...)
- [ ] Got Stripe secret key (sk_test_...)
- [ ] Stored Stripe keys securely (not in code!)

### 3. Backend API Setup

**Choose ONE option:**

#### Option A: Supabase Edge Functions
- [ ] Installed Supabase CLI: `npm install -g supabase`
- [ ] Initialized Supabase: `supabase init`
- [ ] Created Edge Functions:
  - [ ] `create-checkout-session`
  - [ ] `stripe-webhook`
  - [ ] `create-portal-session`
- [ ] Implemented function logic
- [ ] Set function secrets (Stripe keys)
- [ ] Deployed functions: `supabase functions deploy`
- [ ] Tested functions with curl/Postman

#### Option B: Vercel Serverless Functions
- [ ] Created `api/` directory
- [ ] Created API endpoints:
  - [ ] `api/create-checkout-session.js`
  - [ ] `api/stripe-webhook.js`
  - [ ] `api/create-portal-session.js`
- [ ] Implemented endpoint logic
- [ ] Set environment variables in Vercel
- [ ] Deployed to Vercel
- [ ] Tested endpoints

### 4. Stripe Webhook Setup

- [ ] Went to Stripe Dashboard → Developers → Webhooks
- [ ] Added endpoint URL (from Supabase or Vercel)
- [ ] Selected webhook events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Copied webhook signing secret (whsec_...)
- [ ] Added webhook secret to backend environment variables
- [ ] Tested webhook with Stripe CLI: `stripe listen --forward-to`

### 5. Environment Variables

**Local Development (.env.local)**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

- [ ] Created `.env.local` file
- [ ] Added all environment variables
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] NEVER committed secrets to Git

**Production (Vercel/Hosting)**
- [ ] Added all environment variables to hosting platform
- [ ] Used PRODUCTION Stripe keys (pk_live_... / sk_live_...)
- [ ] Verified environment variables are loaded

### 6. Security Checks

- [ ] Confirmed RLS policies prevent unauthorized access
- [ ] Verified users can only see their own projects
- [ ] Tested that unauthenticated users can't publish
- [ ] Checked that Stripe keys are not exposed in client code
- [ ] Ensured webhook signature verification is implemented
- [ ] Set up email verification (optional but recommended)
- [ ] Configured CORS properly (if using custom API)
- [ ] Rate limiting implemented (optional but recommended)

### 7. Frontend Testing

#### Authentication Flow
- [ ] Tested email signup
- [ ] Tested email login
- [ ] Tested Google OAuth (if enabled)
- [ ] Tested GitHub OAuth (if enabled)
- [ ] Tested password reset
- [ ] Tested logout
- [ ] Verified session persists after page reload
- [ ] Checked user profile dropdown shows correctly
- [ ] Confirmed user avatar displays initial

#### Publish Flow
- [ ] Tested publish without login (should show login modal)
- [ ] Tested publish with login (should show plan modal)
- [ ] Selected FREE plan (should deploy to subdomain)
- [ ] Verified project saved to database
- [ ] Checked deployment record created
- [ ] Confirmed published URL displayed

#### Stripe Checkout Flow
- [ ] Selected PRO plan
- [ ] Redirected to Stripe Checkout
- [ ] Used test card: 4242 4242 4242 4242
- [ ] Completed checkout successfully
- [ ] Redirected back to YENZE Builder
- [ ] Verified subscription created in database
- [ ] Checked subscription status is "active"
- [ ] Confirmed user can now use PRO features

### 8. Database Verification

After testing, check Supabase dashboard:

**auth.users table**
- [ ] User exists with correct email
- [ ] User confirmed (if email verification enabled)

**profiles table**
- [ ] Profile auto-created for user
- [ ] Full name and avatar saved (if provided)

**projects table**
- [ ] Project saved with correct user_id
- [ ] HTML content stored
- [ ] Published URL recorded
- [ ] Plan field set correctly (free/pro/business)

**subscriptions table**
- [ ] Subscription created for paid user
- [ ] Stripe customer ID saved
- [ ] Stripe subscription ID saved
- [ ] Plan field correct (pro/business)
- [ ] Status is "active"
- [ ] Period end date is correct

**deployments table**
- [ ] Deployment record created
- [ ] Deployment URL recorded
- [ ] Status is "ready"

### 9. Production Deployment

#### Before Going Live
- [ ] All tests passed locally
- [ ] Environment variables set for production
- [ ] Stripe switched to live mode (pk_live_... / sk_live_...)
- [ ] Stripe webhook updated to production URL
- [ ] Supabase project ready for production traffic
- [ ] Domain configured (if using custom domain)

#### Deploy to Vercel
- [ ] Pushed code to GitHub
- [ ] Connected repo to Vercel
- [ ] Set all environment variables in Vercel
- [ ] Deployed to production
- [ ] Verified deployment successful
- [ ] Checked logs for errors

#### Post-Deployment Verification
- [ ] Visited production URL
- [ ] Tested full signup → login → publish → payment flow
- [ ] Checked all environment variables loaded correctly
- [ ] Verified Stripe webhook receiving events
- [ ] Monitored Supabase logs for errors
- [ ] Tested on multiple devices (desktop, mobile)
- [ ] Tested on multiple browsers (Chrome, Firefox, Safari)

### 10. DNS & Domain Setup (Optional)

If using custom domain:
- [ ] Domain purchased
- [ ] DNS configured in Vercel/Netlify
- [ ] SSL certificate issued (automatic with Vercel)
- [ ] Supabase redirect URLs updated with new domain
- [ ] OAuth provider redirect URLs updated
- [ ] Stripe webhook URL updated if needed
- [ ] Tested with custom domain

### 11. Monitoring & Analytics

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configured analytics (Google Analytics, Plausible, etc.)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Created alerts for critical errors
- [ ] Monitoring Stripe webhook delivery
- [ ] Watching Supabase database performance

### 12. User Communication

- [ ] Email templates configured (welcome email, receipts)
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] Contact/Support page created
- [ ] Help documentation written
- [ ] FAQ page created

### 13. Business Setup

- [ ] Stripe account fully verified (required for live mode)
- [ ] Bank account connected to Stripe
- [ ] Business information complete in Stripe
- [ ] Tax settings configured
- [ ] Pricing finalized
- [ ] Refund policy decided
- [ ] Support email set up (support@yourdomain.com)

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid API key" error
**Solution:** Check that Supabase URL and anon key are correct in `config.js`

### Issue: Login modal not showing
**Solution:** Check browser console for errors. Ensure all scripts loaded in correct order.

### Issue: "User must be authenticated" error
**Solution:** Verify user is actually logged in. Check `supabaseClient.isAuthenticated()` returns true.

### Issue: Stripe checkout not working
**Solution:** Ensure backend API endpoints are deployed and accessible. Check Stripe keys are correct.

### Issue: Webhook events not received
**Solution:** Verify webhook URL is correct and publicly accessible. Check webhook signing secret matches.

### Issue: Database errors
**Solution:** Confirm RLS policies are correctly set up. Check user has permission to access the resource.

### Issue: Projects not saving
**Solution:** Check that user is authenticated. Verify Supabase connection. Check browser console for errors.

---

## 📊 Success Criteria

Before marking deployment as complete, verify:

✅ Users can sign up and log in
✅ Users can edit HTML without authentication
✅ Publishing requires authentication
✅ FREE plan deploys successfully
✅ PRO plan checkout works
✅ Subscriptions created in database
✅ Projects save to database
✅ Deployments recorded correctly
✅ No errors in console
✅ No errors in Supabase logs
✅ Stripe webhooks delivering successfully
✅ All environment variables set
✅ SSL certificate active
✅ Site accessible from any device

---

## 🎯 Post-Launch Tasks

After successful deployment:

1. **Monitor for 24 hours**
   - Watch error logs
   - Check webhook deliveries
   - Monitor user signups
   - Verify payments processing

2. **Gather feedback**
   - Test with real users
   - Fix critical bugs immediately
   - Note feature requests

3. **Marketing**
   - Share on social media
   - Submit to directories
   - Create demo videos
   - Write launch post

4. **Iterate**
   - Implement user feedback
   - Add requested features
   - Improve performance
   - Enhance UI/UX

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Setup Guide**: [SETUP-GUIDE.md](SETUP-GUIDE.md)
- **Implementation Summary**: [AUTHENTICATION-SUMMARY.md](AUTHENTICATION-SUMMARY.md)

---

**Good luck with your launch! 🚀**
