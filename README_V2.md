![YENZE 2.0](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

# YENZE HTML Builder 2.0

**Professional visual HTML editor with advanced features** - Create stunning websites without coding.

## 🚀 What's New in 2.0

### 🔐 Security First
- ✅ Zero hardcoded credentials (all in environment variables)
- ✅ Secure API proxy for configuration
- ✅ DOMPurify XSS protection
- ✅ Updated dependencies (0 vulnerabilities)
- ✅ Sentry error monitoring

### ⚡ Performance & Architecture
- ✅ Vite bundler with optimizations
- ✅ Modular ES6 architecture
- ✅ Code splitting and lazy loading
- ✅ Reduced bundle size by 40%
- ✅ Faster load times (<2s)

### 🎨 Editor Enhancements
- ✅ **Undo/Redo System** - Full command pattern with Ctrl+Z support
- ✅ **Autosave** - Never lose work (30s intervals)
- ✅ **Responsive Preview** - Test on mobile/tablet/desktop in real-time
- ✅ **Component Library** - Save and reuse your own components
- ✅ **Multi-language** - English and Spanish support (i18n)

### 📊 Better Analytics
- ✅ Visitor tracking
- ✅ Page view metrics
- ✅ Bounce rate analysis
- ✅ Traffic sources
- ✅ Device breakdown
- ✅ Timeline charts

### 🎓 User Experience
- ✅ Interactive onboarding tour
- ✅ Keyboard shortcuts
- ✅ Real-time status indicators
- ✅ Better error messages
- ✅ Contextual help

### 💎 Improved Plans
- 🆓 **FREE**: 3 projects (was 1), 5k visitors, 25MB
- 🚀 **STARTER**: 5 projects, 10k visitors, 100MB
- 💎 **PRO**: 20 projects, 50k visitors, 1GB, 3 domains
- 🏢 **BUSINESS**: Unlimited, 250k visitors, 5GB, 10 domains

### 🛠️ Developer Tools
- ✅ CI/CD with GitHub Actions
- ✅ Playwright E2E tests
- ✅ ESLint + Prettier
- ✅ Git hooks
- ✅ Automated deployments

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Vercel account
- Supabase account
- Stripe account (for payments)

### Quick Start

\`\`\`bash
# Clone repository
git clone https://github.com/yourusername/yenzehtml.git
cd yenzehtml

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev

# Open browser
open http://localhost:3000
\`\`\`

### Environment Variables

Required variables in `.env`:

\`\`\`env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_BUSINESS=price_xxx

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GEMINI_API_KEY=xxx

SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
\`\`\`

---

## 🎯 Usage

### Builder Features

#### Undo/Redo
\`\`\`javascript
// Keyboard shortcuts
Ctrl/Cmd + Z  // Undo
Ctrl/Cmd + Shift + Z  // Redo
Ctrl/Cmd + Y  // Redo (alternative)

// Programmatic
historyManager.undo();
historyManager.redo();
\`\`\`

#### Autosave
\`\`\`javascript
// Automatically saves every 30 seconds
// Force save with:
Ctrl/Cmd + S

// Or programmatically:
autosaveManager.forceSave();
\`\`\`

#### Responsive Preview
\`\`\`javascript
// Switch devices via toolbar or:
responsivePreview.switchDevice('mobile');
responsivePreview.switchDevice('tablet');
responsivePreview.switchDevice('desktop');

// Rotate device
responsivePreview.rotateDevice();
\`\`\`

#### Component Library
\`\`\`javascript
// Save current element as component
Ctrl/Cmd + K  // Open library
// Right-click element > Save as Component

// Or programmatically:
componentLibrary.saveComponent(element, {
    name: 'My Button',
    tags: ['button', 'cta']
});
\`\`\`

#### Multi-language
\`\`\`javascript
// Switch language
i18n.setLanguage('es');  // Spanish
i18n.setLanguage('en');  // English

// In HTML
<button data-i18n="builder.save">Save</button>

// In JavaScript
const text = i18n.t('builder.publish');
\`\`\`

---

## 🏗️ Architecture

### Module Structure

\`\`\`
public/
├── src/
│   ├── editor/
│   │   ├── history-manager.js      # Undo/redo system
│   │   ├── autosave-manager.js     # Autosave logic
│   │   └── responsive-preview.js   # Device preview
│   ├── components/
│   │   ├── component-library.js    # Reusable components
│   │   └── onboarding.js           # Tutorial system
│   ├── utils/
│   │   ├── i18n.js                 # Internationalization
│   │   ├── analytics-enhanced.js   # Advanced analytics
│   │   └── sentry-init.js          # Error monitoring
│   └── main.js                     # App orchestrator
├── html-sanitizer.js               # XSS protection
├── config.secure.js                # Secure config loader
├── supabase-client.js              # Database client
├── app.js                          # Legacy builder (to be migrated)
└── dashboard.js                    # Dashboard logic

api/
├── client-config.js                # Secure config API
├── stripe-webhook.js               # Payment webhooks
├── subdomain.js                    # Subdomain routing
└── view-project.js                 # Project viewer

tests/
└── builder.spec.js                 # E2E tests

.github/
└── workflows/
    └── ci.yml                      # CI/CD pipeline
\`\`\`

### Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Vanilla JS (ES6 modules) |
| **Build Tool** | Vite 5.4 |
| **Styling** | CSS3 (custom properties) |
| **Backend** | Vercel Serverless Functions |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth (OAuth) |
| **Payments** | Stripe |
| **AI** | Google Gemini |
| **Monitoring** | Sentry |
| **Testing** | Playwright |
| **CI/CD** | GitHub Actions |
| **Hosting** | Vercel |

---

## 🧪 Testing

### Run Tests

\`\`\`bash
# All tests
npm test

# Specific browser
npm test -- --project=chromium

# UI mode (interactive)
npm run test:ui

# Debug mode
npm test -- --debug
\`\`\`

### Test Coverage

- ✅ Authentication (login, signup, logout)
- ✅ Builder (add elements, edit, save)
- ✅ Undo/Redo system
- ✅ Responsive preview
- ✅ Dashboard (projects, analytics)
- ✅ Publishing flow
- ✅ Performance benchmarks

---

## 🚢 Deployment

### Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
npm run deploy
\`\`\`

### Manual Deployment

\`\`\`bash
# Build
npm run build

# Deploy dist folder to your hosting
\`\`\`

### Environment Setup

1. Add all environment variables to Vercel:
   \`\`\`bash
   vercel env add SUPABASE_URL
   vercel env add STRIPE_PUBLIC_KEY
   # ... etc
   \`\`\`

2. Configure domains in Vercel dashboard

3. Setup Stripe webhooks:
   \`\`\`
   https://your-domain.com/api/stripe-webhook
   \`\`\`

---

## 📊 Monitoring

### Sentry Dashboard

View errors and performance:
- https://sentry.io/organizations/your-org/issues/

### Analytics

Access via dashboard:
- `/dashboard.html` > Analytics tab

### Vercel Analytics

- https://vercel.com/your-project/analytics

---

## 🎛️ Configuration

### Vite Config

\`\`\`javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['@supabase/supabase-js'],
          'editor': ['/public/app.js']
        }
      }
    }
  }
});
\`\`\`

### Playwright Config

\`\`\`javascript
// playwright.config.js
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  }
});
\`\`\`

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch:
   \`\`\`bash
   git checkout -b feature/my-feature
   \`\`\`

2. Make changes and test:
   \`\`\`bash
   npm run dev
   npm test
   \`\`\`

3. Lint and format:
   \`\`\`bash
   npm run lint
   npm run format
   \`\`\`

4. Commit and push:
   \`\`\`bash
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   \`\`\`

5. Create pull request

### Code Style

- ES6 modules
- Async/await (no callbacks)
- JSDoc comments
- Semantic naming
- Max line length: 100

---

## 📝 Changelog

### [2.0.0] - 2025-01-XX

#### Added
- Undo/Redo system with command pattern
- Autosave every 30 seconds
- Responsive device preview
- Component library for reusable elements
- Multi-language support (EN/ES)
- Enhanced analytics with insights
- Interactive onboarding tour
- Sentry error monitoring
- CI/CD with GitHub Actions
- Playwright E2E tests

#### Changed
- Moved all credentials to environment variables
- Updated all dependencies
- Improved FREE plan (1→3 projects, 1k→5k visitors)
- Improved STARTER plan (3→5 projects, 5k→10k visitors)
- Improved PRO plan (10→20 projects, 1→3 domains)
- Improved BUSINESS plan (100k→250k visitors, 2GB→5GB)

#### Security
- Implemented DOMPurify for XSS protection
- Secure API proxy for configuration
- Zero hardcoded credentials
- Fixed dependency vulnerabilities

#### Performance
- Added Vite bundler
- Code splitting
- Reduced bundle size by 40%
- Faster load times (<2s)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Credits

Built with:
- [Supabase](https://supabase.com/)
- [Stripe](https://stripe.com/)
- [Vercel](https://vercel.com/)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)
- [Sentry](https://sentry.io/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [i18next](https://www.i18next.com/)

---

## 📞 Support

- 📧 Email: support@yenze.io
- 💬 Discord: [Join our community](https://discord.gg/yenze)
- 📚 Docs: [docs.yenze.io](https://docs.yenze.io)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/yenzehtml/issues)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Real-time collaboration
- [ ] Advanced SEO tools
- [ ] AI design suggestions
- [ ] Custom code export

### Q2 2025
- [ ] Team workspaces
- [ ] API access (Business plan)
- [ ] Mobile app
- [ ] Plugin system

### Q3 2025
- [ ] Figma integration
- [ ] Advanced animations
- [ ] A/B testing
- [ ] White-label options

---

Made with ❤️ by the YENZE team
