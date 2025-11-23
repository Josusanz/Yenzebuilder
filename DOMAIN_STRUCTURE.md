# 🌐 YENZE - Domain Structure

## Domain Setup

YENZE ahora usa una estructura de subdominios para separar marketing del producto:

### **yenze.io** - Marketing Landing Page
- **Purpose**: Landing page pública de marketing
- **Location**: `/landing/index.html`
- **Content**:
  - Hero section con descripción del producto
  - Features grid (6 features principales)
  - Pricing section (4 planes)
  - CTA para signup
  - Footer
- **Design**: Framer-style light mode, minimalista, profesional
- **Goal**: Convertir visitantes en usuarios

### **builder.yenze.io** - Product (Editor/Builder)
- **Purpose**: Aplicación principal del HTML builder
- **Location**: `/public/`
- **Content**:
  - Editor visual (index.html)
  - Dashboard (dashboard.html)
  - Authentication (login.html, signup.html)
  - Todas las herramientas del builder
- **Access**: Requiere login para funcionalidad completa

### **[user].yenze.io** - User Sites (Subdomain hosting)
- **Purpose**: Sites publicados por usuarios en subdominios gratis
- **Example**: `john.yenze.io`, `maria.yenze.io`
- **Content**: Sites creados por usuarios en el plan FREE o STARTER

### **[custom-domain].com** - Custom Domains
- **Purpose**: Dominios custom de usuarios PRO/BUSINESS
- **Example**: `mybrand.com`, `startup.io`
- **Managed by**: Vercel DNS + Custom domain API

## Vercel Configuration

### vercel.json Setup

```json
{
  "rewrites": [
    // Published sites (all domains)
    {
      "source": "/s/:slug",
      "destination": "/api/view-project?slug=:slug"
    },

    // Builder subdomain → /public/
    {
      "source": "/:path*",
      "destination": "/public/:path*",
      "has": [
        {
          "type": "host",
          "value": "builder.yenze.io"
        }
      ]
    },

    // Main domain → landing page
    {
      "source": "/",
      "destination": "/landing/index.html",
      "has": [
        {
          "type": "host",
          "value": "yenze.io"
        }
      ]
    }
  ]
}
```

## Directory Structure

```
/
├── landing/              # Marketing site (yenze.io)
│   └── index.html        # Landing page
│
├── public/               # Builder app (builder.yenze.io)
│   ├── index.html        # Editor
│   ├── dashboard.html    # Dashboard
│   ├── login.html        # Auth
│   ├── signup.html       # Auth
│   ├── app.js            # Editor logic
│   ├── dashboard.js      # Dashboard logic
│   ├── config.js         # Config
│   └── ...
│
├── api/                  # Serverless functions
│   ├── view-project.js   # Serve published sites
│   ├── create-checkout-session.js  # Stripe
│   └── stripe-webhook.js # Webhooks
│
└── vercel.json           # Vercel config
```

## URLs Map

| URL | Destination | Purpose |
|-----|-------------|---------|
| `yenze.io` | `/landing/index.html` | Marketing landing page |
| `www.yenze.io` | `/landing/index.html` | Marketing (www redirect) |
| `builder.yenze.io` | `/public/` | HTML builder app |
| `builder.yenze.io/dashboard.html` | `/public/dashboard.html` | User dashboard |
| `john.yenze.io/s/my-site` | `/api/view-project?slug=my-site` | Published user site |
| `mybrand.com` | `/api/view-project` (custom) | Custom domain site |

## DNS Configuration

### Required DNS Records

**For yenze.io (main domain):**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For builder.yenze.io (subdomain):**
```
Type: CNAME
Name: builder
Value: cname.vercel-dns.com
```

**For wildcard subdomains (*.yenze.io):**
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

## Vercel Dashboard Setup

### 1. Add Domains

In Vercel project settings → Domains:

1. Add `yenze.io` (primary)
2. Add `www.yenze.io` (redirect to yenze.io)
3. Add `builder.yenze.io` (product)
4. Add `*.yenze.io` (wildcard for user sites)

### 2. Configure Redirects

- `www.yenze.io` → `yenze.io` (301 redirect)
- All other traffic handled by vercel.json rewrites

## User Flow

### New Visitor Flow
1. Lands on `yenze.io` (marketing)
2. Clicks "Get Started Free"
3. Redirected to `builder.yenze.io/public/signup.html`
4. Creates account
5. Redirected to `builder.yenze.io/public/dashboard.html`

### Existing User Flow
1. Goes to `builder.yenze.io`
2. Logs in
3. Access dashboard and editor
4. Publishes site to `username.yenze.io/s/site-name`

### Custom Domain User Flow
1. User on PRO/BUSINESS plan
2. Adds custom domain in dashboard
3. Configures DNS (CNAME to cname.vercel-dns.com)
4. Site accessible at `mybrand.com`

## Benefits of This Structure

### ✅ Separation of Concerns
- Marketing content separate from product
- Easier to update landing without affecting builder
- Can have different teams work on each

### ✅ Better SEO
- Clean URL structure
- Marketing content at root domain
- Product at subdomain doesn't dilute main domain SEO

### ✅ Professional Appearance
- `builder.yenze.io` looks professional
- Clear distinction between marketing and product
- Easier to explain to users

### ✅ Scalability
- Can add more subdomains (docs.yenze.io, blog.yenze.io)
- Easy to add A/B testing on landing
- Can move landing to different stack if needed

### ✅ Security
- Product authentication isolated to builder subdomain
- Can set different security policies per subdomain
- Easier to implement CSP and other security headers

## Migration Plan

### Phase 1: Setup (Done ✅)
- [x] Create `/landing/` directory
- [x] Build marketing landing page
- [x] Update `vercel.json` with rewrites
- [x] Create documentation

### Phase 2: DNS Configuration (User Action Required)
- [ ] Add `builder.yenze.io` in Vercel dashboard
- [ ] Update DNS records for builder subdomain
- [ ] Test builder.yenze.io works correctly

### Phase 3: Update Links
- [ ] Update all builder internal links to use relative paths
- [ ] Update signup/login redirects
- [ ] Update dashboard links
- [ ] Update email templates with new URLs

### Phase 4: Deploy & Test
- [ ] Deploy to production
- [ ] Test all user flows
- [ ] Test published sites still work
- [ ] Test custom domains still work

## Testing Checklist

- [ ] Landing page loads at `yenze.io`
- [ ] Builder loads at `builder.yenze.io`
- [ ] Dashboard loads at `builder.yenze.io/public/dashboard.html`
- [ ] Login/signup works
- [ ] Published sites work at `*.yenze.io/s/slug`
- [ ] Custom domains still work
- [ ] Stripe checkout redirects correctly
- [ ] Email links point to correct domains

## Troubleshooting

### Issue: builder.yenze.io shows 404
**Solution**: Ensure subdomain is added in Vercel dashboard and DNS CNAME is set

### Issue: yenze.io shows builder instead of landing
**Solution**: Check vercel.json rewrites order, landing rewrite should be last

### Issue: Styles not loading on builder.yenze.io
**Solution**: Check CSS/JS paths are relative, not absolute

### Issue: User sites not working
**Solution**: Wildcard subdomain `*.yenze.io` must be configured in Vercel

## Future Enhancements

- [ ] Add `docs.yenze.io` for documentation
- [ ] Add `blog.yenze.io` for blog/content marketing
- [ ] Add `status.yenze.io` for system status page
- [ ] Add `api.yenze.io` for public API docs
- [ ] Implement A/B testing on landing page
- [ ] Add analytics to landing page
