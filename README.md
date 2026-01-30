# YENZE Builder

**The open-source visual HTML editor for everyone.**

Build, edit, and publish websites visually — no coding required. 100% free, unlimited projects, open source.

[![GitHub stars](https://img.shields.io/github/stars/Josusanz/Yenzebuilder?style=social)](https://github.com/Josusanz/Yenzebuilder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Twitter Follow](https://img.shields.io/twitter/follow/josusanz?style=social)](https://twitter.com/josusanz)

<p align="center">
  <a href="https://yenze.io/builder.html">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#self-hosting">Self-Hosting</a> •
  <a href="#templates-marketplace">Templates</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Why YENZE?

Most website builders are either expensive, complicated, or lock you into their platform. YENZE is different:

- **Free forever** — No hidden costs, no premium tiers for basic features
- **Open source** — See exactly how it works, modify it, self-host it
- **No lock-in** — Download your HTML anytime, host it anywhere
- **Simple** — Drag, drop, edit. That's it.

---

## Features

### Editor
- **Visual editing** — Click any element to edit text, colors, fonts, spacing
- **Drag & drop** — Import HTML files or paste code directly
- **Responsive preview** — See your site on desktop, tablet, and mobile
- **Real-time preview** — Changes appear instantly as you edit
- **Layer panel** — Navigate complex HTML structures easily
- **Code view** — Switch between visual and code editing

### Publishing
- **Free subdomain** — Publish to `yoursite.yenze.io` instantly
- **Download HTML** — Export clean HTML to host anywhere
- **Custom domains** — Connect your own domain (self-hosted)

### Templates
- **Free templates** — Start with professional designs
- **Premium marketplace** — Buy and sell templates
- **Creator program** — Earn 70% selling your templates

---

## Quick Start

### Use Online (Easiest)

Just open [yenze.io/builder.html](https://yenze.io/builder.html) and start building.

1. **Import your HTML** — Drag a `.html` file or paste code
2. **Edit visually** — Click elements to modify them
3. **Publish or download** — Get a free URL or download your code

### Self-Host (Full Control)

Want to run your own instance? See the [Self-Hosting Guide](#self-hosting) below.

---

## Self-Hosting

Deploy your own YENZE instance in 5 minutes.

### Prerequisites

- GitHub account
- [Vercel](https://vercel.com) or [Cloudflare](https://cloudflare.com) account (free tier works)
- [Supabase](https://supabase.com) account (free tier works)

### Step 1: Fork & Deploy

```bash
# 1. Fork this repository
# 2. Go to vercel.com and import your fork
# 3. Deploy (Vercel will auto-detect settings)
```

### Step 2: Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:

```sql
-- Run the contents of supabase-schema.sql
-- Then run migrations/leads-table.sql
```

3. Get your API keys from Settings → API

### Step 3: Configure Environment

Add these environment variables in Vercel:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (keep secret) |

### Step 4: Done!

Your YENZE instance is live. Visit your Vercel URL to start building.

📖 **Full guide:** [DEPLOY-TUTORIAL.md](DEPLOY-TUTORIAL.md)

---

## Templates Marketplace

YENZE includes a templates marketplace where creators can sell their designs.

### For Buyers

Browse templates at [yenze.io/templates](https://yenze.io/templates):
- Free templates to get started
- Premium templates from $15-$49
- One-time purchase, use forever

### For Creators

Sell your templates and earn 70% of each sale:

1. Create beautiful HTML templates
2. Apply to become a creator
3. Upload your templates
4. Earn money when people buy

**Interested?** Email [hello@yenze.io](mailto:hello@yenze.io?subject=I%20want%20to%20sell%20templates)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Backend | Vercel Serverless Functions |
| Database | Supabase (PostgreSQL) |
| Auth | Email-based (simple, no passwords) |
| Payments | Stripe Connect |
| Hosting | Vercel Edge Network |

---

## Project Structure

```
yenzehtml/
├── public/
│   ├── builder.html      # Main editor interface
│   ├── templates.html    # Templates marketplace
│   ├── app.js            # Editor logic
│   ├── email-gate.js     # Email capture system
│   └── templates/        # Template HTML files
├── api/
│   ├── buy-template.js   # Stripe checkout for templates
│   ├── subdomain.js      # Subdomain routing
│   └── ...               # Other API endpoints
├── migrations/           # SQL migrations
├── SELF-HOSTING.md       # Self-hosting guide
├── DEPLOY-TUTORIAL.md    # Step-by-step deploy tutorial
└── supabase-schema.sql   # Database schema
```

---

## Contributing

Contributions are welcome! Here's how you can help:

### Report Bugs

Found a bug? [Open an issue](https://github.com/Josusanz/Yenzebuilder/issues/new) with:
- What you expected to happen
- What actually happened
- Steps to reproduce

### Suggest Features

Have an idea? [Open an issue](https://github.com/Josusanz/Yenzebuilder/issues/new) and describe:
- The problem you're trying to solve
- Your proposed solution

### Submit Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

- [x] Visual HTML editor
- [x] Free subdomain publishing
- [x] Download HTML export
- [x] Templates marketplace
- [x] Stripe Connect for creators
- [ ] AI-powered design suggestions
- [ ] Team collaboration
- [ ] Version history
- [ ] Custom components library
- [ ] WordPress export

---

## Support

- 📖 [Documentation](SELF-HOSTING.md)
- 🐛 [Report Issues](https://github.com/Josusanz/Yenzebuilder/issues)
- 💬 [Twitter](https://twitter.com/josusanz)

---

## License

MIT License — use it however you want.

See [LICENSE](LICENSE) for details.

---

## Author

<p align="center">
  <img src="https://github.com/josusanz.png" width="100" height="100" style="border-radius: 50%;" alt="Josu Sanz">
</p>

<p align="center">
  <strong>Built by <a href="https://josusanz.com">Josu Sanz</a></strong>
</p>

<p align="center">
  <a href="https://twitter.com/josusanz">Twitter</a> •
  <a href="https://josusanz.com">Website</a> •
  <a href="https://github.com/josusanz">GitHub</a>
</p>

---

<p align="center">
  <sub>If YENZE helps you, consider giving it a ⭐ on GitHub!</sub>
</p>
