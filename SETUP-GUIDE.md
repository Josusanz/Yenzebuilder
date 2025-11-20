# 🚀 YENZE Builder - Setup Guide

This guide will help you set up authentication, database, and payment processing for YENZE Builder.

---

## 📋 Prerequisites

- A [Supabase](https://supabase.com) account (FREE tier works)
- A [Stripe](https://stripe.com) account
- A [Vercel](https://vercel.com) account (for deployment)

---

## 1️⃣ Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: yenze-builder
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait ~2 minutes

### Step 2: Set Up Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open the `supabase-schema.sql` file from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** to execute the SQL
6. You should see: "Success. No rows returned"

This creates:
- `projects` table - stores user HTML projects
- `subscriptions` table - stores Stripe subscription data
- `deployments` table - tracks deployment history
- `profiles` table - additional user data
- Row Level Security (RLS) policies - ensures users can only access their own data

### Step 3: Enable Authentication Providers

1. Go to **Authentication** → **Providers** (left sidebar)
2. Enable the following providers:

#### Email/Password (Already enabled)
- Already enabled by default ✅

#### Google OAuth (Recommended)
1. Click on **Google** provider
2. Enable "Google enabled"
3. Follow [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
4. You'll need to:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth credentials
   - Add redirect URIs from Supabase
5. Copy Client ID and Client Secret to Supabase
6. Save

#### GitHub OAuth (Recommended)
1. Click on **GitHub** provider
2. Enable "GitHub enabled"
3. Follow [Supabase GitHub OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-github)
4. You'll need to:
   - Create a GitHub OAuth App
   - Add redirect URIs from Supabase
5. Copy Client ID and Client Secret to Supabase
6. Save

### Step 4: Get Your Supabase Credentials

1. Go to **Project Settings** → **API** (gear icon in sidebar)
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
3. Keep these safe - you'll need them in the next step

---

## 2️⃣ Configure YENZE Builder

### Update config.js

1. Open `config.js` in your project
2. Replace the placeholder values:

\`\`\`javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co', // Your Project URL
    anonKey: 'eyJhbGc...' // Your anon public key
};
\`\`\`

3. Save the file

---

## 3️⃣ Stripe Setup

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in
3. Complete your business profile

### Step 2: Create Products and Prices

1. Go to **Products** → **Add product**

#### PRO Plan Product
- **Name**: YENZE Pro
- **Description**: Custom domain, download HTML, remove badge, 5 projects
- **Pricing**:
  - Type: Recurring
  - Price: $9.99
  - Billing period: Monthly
- Click **Save product**
- Copy the **Price ID** (starts with `price_xxx`)

#### BUSINESS Plan Product
- **Name**: YENZE Business
- **Description**: Unlimited projects, white label, API access, team collaboration
- **Pricing**:
  - Type: Recurring
  - Price: $29.99
  - Billing period: Monthly
- Click **Save product**
- Copy the **Price ID** (starts with `price_xxx`)

### Step 3: Get Your Stripe Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode)
3. Keep these safe

### Step 4: Update config.js

1. Open `config.js`
2. Update Stripe configuration:

\`\`\`javascript
const STRIPE_CONFIG = {
    publicKey: 'pk_test_...' // Your Publishable key
};

const PLANS = {
    // ...
    PRO: {
        // ...
        priceId: 'price_xxx', // Your PRO Price ID from Stripe
        // ...
    },
    BUSINESS: {
        // ...
        priceId: 'price_xxx', // Your BUSINESS Price ID from Stripe
        // ...
    }
};
\`\`\`

3. Save the file

---

## 4️⃣ Create Stripe Webhook Handler (Backend API)

You'll need to create backend API endpoints to handle Stripe operations. Here's what you need:

### Option A: Use Supabase Edge Functions (Recommended)

1. Install Supabase CLI:
\`\`\`bash
npm install -g supabase
\`\`\`

2. Initialize Supabase in your project:
\`\`\`bash
supabase init
\`\`\`

3. Create Edge Functions:
\`\`\`bash
supabase functions new create-checkout-session
supabase functions new stripe-webhook
supabase functions new create-portal-session
\`\`\`

4. Implement the functions (see `supabase/functions/` folder for examples)

5. Deploy functions:
\`\`\`bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session
\`\`\`

### Option B: Use Vercel Serverless Functions

1. Create `api/` folder in your project
2. Create the following files:
   - `api/create-checkout-session.js`
   - `api/stripe-webhook.js`
   - `api/create-portal-session.js`
3. Implement the endpoints (see examples in documentation)
4. Deploy to Vercel

### Stripe Webhook Configuration

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your endpoint URL:
   - For Supabase: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - For Vercel: `https://your-domain.vercel.app/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it to your backend environment variables

---

## 5️⃣ Environment Variables

### For Development (Local)

Create `.env.local` file:

\`\`\`bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # From Project Settings → API

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel (optional)
VERCEL_TOKEN=your_vercel_token
\`\`\`

### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all the variables from above
4. Switch to **Production** keys from Stripe (use `pk_live_...` and `sk_live_...`)

---

## 6️⃣ Test Your Setup

### Test Authentication

1. Open your YENZE Builder locally or on Vercel
2. Click **Publish** button
3. You should see the login modal
4. Try signing up with email/password
5. Check your email for confirmation link
6. Try logging in with Google/GitHub (if configured)

### Test Database

1. After signing up, check your Supabase dashboard
2. Go to **Table Editor**
3. Open `profiles` table - you should see your user
4. Try creating a project and publishing

### Test Stripe (Development Mode)

1. Log in to YENZE Builder
2. Click **Publish**
3. Select **Pro** or **Business** plan
4. You should be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Expiry: Any future date
7. CVC: Any 3 digits
8. Complete checkout
9. You should be redirected back with success message

---

## 7️⃣ Deploy to Production

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **New Project**
4. Import your GitHub repository
5. Configure environment variables (see section 5️⃣)
6. Click **Deploy**
7. Your site will be live at `https://your-project.vercel.app`

### Update Redirect URLs

After deployment, update redirect URLs in:

1. **Supabase Authentication Settings**:
   - Add your production URL to **Redirect URLs**
   - Example: `https://your-domain.com`

2. **Stripe Webhooks**:
   - Update endpoint URL to production URL
   - Example: `https://your-domain.com/api/stripe-webhook`

3. **OAuth Providers** (Google, GitHub):
   - Update redirect URIs to include production URL

---

## 8️⃣ Switch to Production Mode

### Stripe Production Keys

1. Go to Stripe Dashboard
2. Toggle from **Test mode** to **Live mode** (top right)
3. Complete Stripe verification (required for live mode)
4. Get live API keys: `pk_live_...` and `sk_live_...`
5. Update your Vercel environment variables with live keys
6. Redeploy

### Supabase Production

1. Ensure your Supabase project is in production (not paused)
2. Consider upgrading to Pro plan for better performance
3. Set up database backups

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files to Git (already in `.gitignore`)
- [ ] Use Row Level Security (RLS) policies in Supabase (already set up)
- [ ] Keep Stripe secret keys secure (only on server-side)
- [ ] Enable HTTPS for production (Vercel does this automatically)
- [ ] Set up webhook signing verification
- [ ] Enable email verification for user signups
- [ ] Set up rate limiting for API endpoints
- [ ] Monitor Stripe webhooks for failures

---

## 📞 Troubleshooting

### Authentication Issues

**Problem**: "User must be authenticated" error
- **Solution**: Make sure Supabase is initialized before calling auth methods
- Check browser console for errors
- Verify Supabase credentials in `config.js`

**Problem**: OAuth providers not working
- **Solution**: Check redirect URIs are correctly set in OAuth provider settings
- Ensure Supabase redirect URLs include your domain

### Database Issues

**Problem**: "Failed to save project" error
- **Solution**: Check RLS policies are set up correctly
- Verify user is authenticated
- Check Supabase logs in Dashboard → Logs

### Stripe Issues

**Problem**: Checkout not redirecting
- **Solution**: Verify Stripe public key is correct
- Check backend API is deployed and accessible
- Check browser console for errors

**Problem**: Webhook not receiving events
- **Solution**: Verify webhook URL is correct and accessible
- Check webhook signing secret matches
- View webhook attempts in Stripe Dashboard → Developers → Webhooks

---

## 🎉 You're All Set!

Your YENZE Builder is now configured with:

✅ User authentication (email, Google, GitHub)
✅ Database for storing projects
✅ Subscription management via Stripe
✅ FREE, PRO, and BUSINESS tiers
✅ Secure with Row Level Security

### What's Next?

1. Test the complete flow end-to-end
2. Customize the branding (logo, colors)
3. Add custom domain support
4. Implement Vercel deployment API
5. Add analytics tracking
6. Create marketing pages
7. Launch! 🚀

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [YENZE Builder GitHub Issues](https://github.com/your-repo/issues)

---

## 💡 Need Help?

If you encounter any issues during setup:

1. Check the troubleshooting section above
2. Review Supabase/Stripe dashboard logs
3. Check browser console for errors
4. Open an issue on GitHub

Good luck with your YENZE Builder! 🎨✨
