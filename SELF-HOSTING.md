# Self-Hosting YENZE Builder

This guide will help you deploy your own instance of YENZE Builder on Vercel or Cloudflare.

## Prerequisites

- GitHub account
- Vercel or Cloudflare account (free tier works)
- Supabase account (free tier works)

## Quick Start (5 minutes)

### 1. Fork the Repository

1. Go to [github.com/yourusername/yenze](https://github.com/yourusername/yenze)
2. Click "Fork" button
3. Name it whatever you want

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose a name and password
4. Wait for project to be created (~2 minutes)

### 3. Set Up Database

1. In Supabase, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this repo
3. Paste and run the query
4. Then run `migrations/leads-table.sql` for email capture

### 4. Get Your Supabase Keys

1. Go to **Settings** > **API**
2. Copy:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key

### 5. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your forked repository
4. Add Environment Variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Click "Deploy"

### 6. Update Config

After deployment, update `public/config.secure.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

## Deploy to Cloudflare Pages

### 1. Connect Repository

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select "Pages" from sidebar
3. Click "Create a project"
4. Connect to Git and select your repo

### 2. Configure Build

- **Build command:** (leave empty)
- **Build output directory:** `public`

### 3. Add Environment Variables

Same as Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Deploy

Click "Save and Deploy"

## Configuration Options

### Customize Branding

Edit `public/builder.html`:

```html
<!-- Change logo text -->
<span class="logo">YOUR BRAND</span>

<!-- Change colors in :root -->
--primary: #your-color;
--accent: #your-color;
```

### Disable Email Gate

If you don't want to capture emails, edit `public/email-gate.js`:

```javascript
hasEmail() {
    return true; // Always return true to skip email gate
}
```

### Custom Domain

1. In Vercel/Cloudflare, go to project settings
2. Add your custom domain
3. Update DNS records as instructed

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Public anon key for client | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for API | Yes |

## Database Schema

The project uses these main tables:

- `projects` - User HTML projects
- `leads` - Email captures
- `custom_domains` - Custom domain mappings

See `supabase-schema.sql` for full schema.

## Troubleshooting

### "Projects not saving"

1. Check Supabase URL and keys are correct
2. Verify RLS policies are set up
3. Check browser console for errors

### "Subdomains not working"

1. Configure wildcard domain in Vercel/Cloudflare
2. Add `*.yourdomain.com` to allowed origins in Supabase

### "Email gate not showing"

1. Verify `email-gate.js` is loaded in HTML
2. Check browser console for errors

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/yenze/issues)
- Twitter: [@yourusername](https://twitter.com/yourusername)

## License

MIT License - Use it however you want!
