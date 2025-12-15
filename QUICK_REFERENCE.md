# YENZE 2.0 - Quick Reference Card

## 🚀 Quick Start

```bash
# Install
bash install.sh

# Configure
cp .env.example .env
nano .env

# Run
npm run dev

# Test
npm test

# Deploy
npm run deploy
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + K` | Component Library |
| `Ctrl/Cmd + /` | Help |
| `Esc` | Close Modals |

## 📦 NPM Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run dev:api          # Start Vercel dev (APIs)

# Build & Deploy
npm run build            # Build for production
npm run preview          # Preview build
npm run deploy           # Deploy to production
npm run deploy:staging   # Deploy to staging

# Testing
npm test                 # Run all tests
npm run test:ui          # Interactive UI mode
npm run test:debug       # Debug mode
npm run test:chromium    # Chrome only
npm run test:mobile      # Mobile tests

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run format:check     # Check formatting

# Utilities
npm run setup            # Quick setup (copy .env)
npm run check            # Lint + Format + Test
npm run release          # Full release (check + build + deploy)
```

## 🔧 Environment Variables

```env
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
STRIPE_PUBLIC_KEY=pk_live_xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# Optional
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## 📊 New Features API

### Undo/Redo
```javascript
window.historyManager.undo();
window.historyManager.redo();
window.historyManager.canUndo();
window.historyManager.canRedo();
```

### Autosave
```javascript
window.autosaveManager.forceSave();
window.autosaveManager.setEnabled(true);
window.autosaveManager.getStatusText();
```

### Responsive Preview
```javascript
window.responsivePreview.switchDevice('mobile');
window.responsivePreview.switchDevice('tablet');
window.responsivePreview.switchDevice('desktop');
window.responsivePreview.rotateDevice();
```

### i18n
```javascript
window.i18n.setLanguage('es');
window.i18n.setLanguage('en');
window.i18n.t('builder.save');
window.i18n.getCurrentLanguage();
```

### Component Library
```javascript
await window.componentLibrary.saveComponent(element, {
    name: 'My Component',
    category: 'user',
    tags: ['button']
});

window.componentLibrary.getAllComponents();
window.componentLibrary.toggle();
```

### Onboarding
```javascript
window.onboarding.start();
window.onboarding.complete();
```

## 🗄️ Database Queries

### Get user projects
```sql
SELECT * FROM projects
WHERE user_id = auth.uid()
ORDER BY updated_at DESC;
```

### Get user components
```sql
SELECT * FROM user_components
WHERE user_id = auth.uid();
```

### Get analytics
```sql
SELECT * FROM analytics_events
WHERE project_id = 'xxx'
AND timestamp > NOW() - INTERVAL '7 days';
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/client-config` | GET | Get client configuration |
| `/api/stripe-webhook` | POST | Stripe webhook handler |
| `/api/subdomain` | GET | Serve subdomain projects |
| `/api/view-project` | GET | View published project |
| `/api/s/:slug` | GET | View project by slug |

## 🎨 CSS Variables

```css
--bg: #F5F5F5
--bg-secondary: #FFFFFF
--text: #18181B
--border: #E4E4E7
--primary: #0EA5E9
--accent: #18181B
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--radius-sm: 6px
--radius-md: 8px
```

## 📝 Plan Limits

| Plan | Projects | Visitors | Storage | Domains |
|------|----------|----------|---------|---------|
| FREE | 3 | 5k | 25MB | 0 |
| STARTER | 5 | 10k | 100MB | 1 |
| PRO | 20 | 50k | 1GB | 3 |
| BUSINESS | ∞ | 250k | 5GB | 10 |

## 🐛 Common Issues

### Config not loading
```bash
curl https://your-domain.com/api/client-config
# Should return JSON with credentials
```

### Autosave not working
```javascript
// Check console for errors
// Verify user is logged in
console.log(window.supabaseClient.getUser());
```

### Tests failing
```bash
# Start dev server first
npm run dev  # Terminal 1
npm test     # Terminal 2
```

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentation Files

- `README_V2.md` - Complete documentation
- `MIGRATION_GUIDE_V2.md` - Migration instructions
- `UPGRADE_SUMMARY.md` - What's new summary
- `QUICK_REFERENCE.md` - This file

## 🔗 Useful Links

- Supabase: https://supabase.com
- Stripe: https://stripe.com/docs
- Vite: https://vitejs.dev
- Playwright: https://playwright.dev
- Sentry: https://sentry.io

## 🆘 Support

- GitHub Issues: Report bugs
- Email: support@yenze.io
- Docs: docs.yenze.io

---

**Quick tip:** Press `Ctrl/Cmd + /` in the builder for context-sensitive help!
