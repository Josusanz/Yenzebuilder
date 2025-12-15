# YENZE 2.0 Migration Guide

## 🎉 What's New in Version 2.0

### Security Improvements
- ✅ All credentials moved to environment variables
- ✅ Secure API proxy for configuration
- ✅ DOMPurify integration for XSS protection
- ✅ Updated dependencies (no vulnerabilities)

### New Features
- ✅ **Undo/Redo System** - Full command pattern implementation
- ✅ **Autosave** - Automatic saving every 30 seconds
- ✅ **Responsive Preview** - Real-time multi-device preview
- ✅ **i18n Support** - English and Spanish languages
- ✅ **Component Library** - Save and reuse components
- ✅ **Enhanced Analytics** - Advanced insights and metrics
- ✅ **Interactive Onboarding** - Guided tour for new users

### Improved Plans
- 🆓 **FREE Plan**: Now includes **3 projects** (up from 1), 5k visitors, 25MB storage
- 🚀 **STARTER Plan**: 5 projects, 10k visitors, 100MB storage
- 💎 **PRO Plan**: 20 projects, 50k visitors, 1GB storage, 3 custom domains
- 🏢 **BUSINESS Plan**: Unlimited projects, 250k visitors, 5GB storage, 10 custom domains

### DevOps & Quality
- ✅ CI/CD with GitHub Actions
- ✅ Sentry error monitoring
- ✅ Playwright E2E tests
- ✅ Vite bundler for optimization
- ✅ ESLint & Prettier configured

---

## 📋 Migration Steps

### 1. Update Environment Variables

Create a `.env` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your actual values:

\`\`\`env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_BUSINESS=price_xxxxx

# Stripe Payment Links
STRIPE_LINK_STARTER=https://buy.stripe.com/xxxxx
STRIPE_LINK_PRO=https://buy.stripe.com/xxxxx
STRIPE_LINK_BUSINESS=https://buy.stripe.com/xxxxx

# Google
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Sentry (optional)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# URLs
APP_URL=https://yenze.io
BUILDER_URL=https://builder.yenze.io
\`\`\`

### 2. Add Environment Variables to Vercel

\`\`\`bash
# Via Vercel CLI
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add STRIPE_PUBLIC_KEY
# ... add all variables

# Or via Vercel Dashboard:
# https://vercel.com/your-project/settings/environment-variables
\`\`\`

### 3. Update Database Schema

Run the new migrations for component library and enhanced analytics:

\`\`\`sql
-- Add user_components table
CREATE TABLE IF NOT EXISTS user_components (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'user',
    html TEXT NOT NULL,
    thumbnail TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own components"
    ON user_components FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own components"
    ON user_components FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own components"
    ON user_components FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own components"
    ON user_components FOR DELETE
    USING (auth.uid() = user_id);

-- Enhanced analytics tables
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    user_agent TEXT,
    device TEXT,
    referrer TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER,
    page_count INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_components_user ON user_components(user_id);
CREATE INDEX idx_components_category ON user_components(category);
CREATE INDEX idx_sessions_project ON analytics_sessions(project_id);
CREATE INDEX idx_events_project ON analytics_events(project_id);
CREATE INDEX idx_events_type ON analytics_events(event_type);
\`\`\`

### 4. Install New Dependencies

\`\`\`bash
npm install
\`\`\`

This will install all new dependencies including:
- DOMPurify
- i18next
- @sentry/browser
- Vite
- Playwright
- Updated Supabase and Stripe SDKs

### 5. Build Project

\`\`\`bash
npm run build
\`\`\`

### 6. Deploy

\`\`\`bash
npm run deploy
\`\`\`

Or let GitHub Actions handle it automatically on push to main.

---

## 🔧 Configuration

### GitHub Actions Setup

1. Add secrets to your GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

2. Push to main branch to trigger automatic deployment

### Sentry Setup (Optional)

1. Create account at https://sentry.io
2. Create new project
3. Copy DSN and add to `.env`:
   \`\`\`
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   \`\`\`
4. Add to Vercel environment variables

---

## 🎨 Using New Features

### Undo/Redo

\`\`\`javascript
// Keyboard shortcuts work automatically
// Ctrl/Cmd + Z = Undo
// Ctrl/Cmd + Shift + Z = Redo

// Programmatic usage
import { historyManager } from './src/editor/history-manager.js';
historyManager.undo();
historyManager.redo();
\`\`\`

### Autosave

\`\`\`javascript
// Automatically initialized in builder
// To force save:
window.autosaveManager.forceSave();

// To disable:
window.autosaveManager.setEnabled(false);
\`\`\`

### Responsive Preview

\`\`\`javascript
// Switch devices
window.responsivePreview.switchDevice('mobile');
window.responsivePreview.switchDevice('tablet');
window.responsivePreview.switchDevice('desktop');

// Rotate device
window.responsivePreview.rotateDevice();
\`\`\`

### i18n

\`\`\`javascript
// Change language
window.i18n.setLanguage('es'); // Spanish
window.i18n.setLanguage('en'); // English

// In HTML:
<button data-i18n="builder.save">Save</button>

// In JavaScript:
const text = window.i18n.t('builder.save');
\`\`\`

### Component Library

\`\`\`javascript
// Save component
const element = document.querySelector('.my-element');
await window.componentLibrary.saveComponent(element, {
    name: 'My Button',
    category: 'user',
    tags: ['button', 'cta']
});

// Load components
const components = window.componentLibrary.getAllComponents();

// Toggle library panel
window.componentLibrary.toggle();
\`\`\`

---

## 🔄 Breaking Changes

### Configuration File Changes

**Old way:**
\`\`\`html
<script src="/config.js"></script>
\`\`\`

**New way:**
\`\`\`html
<script src="/config.secure.js"></script>
\`\`\`

The new system loads credentials securely from API endpoint.

### Plan Limits Updated

Free plan users now have more generous limits. Existing users automatically upgraded.

---

## 📊 Testing

### Run Tests Locally

\`\`\`bash
# E2E tests
npm test

# UI mode
npm run test:ui

# Specific browser
npx playwright test --project=chromium
\`\`\`

### Generate Test Report

\`\`\`bash
npx playwright show-report
\`\`\`

---

## 🐛 Troubleshooting

### Issue: Config not loading

**Solution:** Make sure `/api/client-config.js` endpoint is accessible and environment variables are set in Vercel.

### Issue: Autosave not working

**Solution:** Check browser console for errors. Ensure user is logged in and has proper permissions.

### Issue: Tests failing

**Solution:** Run `npm run dev` in one terminal, then run tests in another. Make sure port 3000 is available.

### Issue: Build errors with Vite

**Solution:** Clear node_modules and reinstall:
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

---

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Sentry Documentation](https://docs.sentry.io/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [i18next Documentation](https://www.i18next.com/)

---

## 🎯 Rollback Plan

If you need to rollback to v1.x:

1. Revert to previous commit:
   \`\`\`bash
   git revert HEAD
   git push
   \`\`\`

2. Restore old config:
   \`\`\`bash
   mv public/config.js.deprecated public/config.js
   \`\`\`

3. Redeploy:
   \`\`\`bash
   vercel --prod
   \`\`\`

---

## ✅ Post-Migration Checklist

- [ ] Environment variables set in Vercel
- [ ] Database migrations run successfully
- [ ] New dependencies installed
- [ ] Tests passing
- [ ] Build successful
- [ ] Deployed to production
- [ ] Sentry receiving errors (if configured)
- [ ] GitHub Actions running
- [ ] Users can login/signup
- [ ] Projects can be saved/published
- [ ] Analytics working
- [ ] Component library accessible
- [ ] i18n switching languages correctly

---

## 🚀 What's Next

Planned for v2.1:
- Real-time collaboration
- Advanced SEO tools
- AI-powered design suggestions
- Custom code export
- API access for Business plan

---

For questions or issues, please open an issue on GitHub or contact support.
