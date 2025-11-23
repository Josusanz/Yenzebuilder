# 🚀 Quick Setup: builder.yenze.io

## Step-by-Step Guide

### 1️⃣ Add Subdomain in Vercel Dashboard

1. Go to: https://vercel.com/josus-projects-95701179/yenzehtml/settings/domains

2. Click **"Add Domain"**

3. Enter: `builder.yenze.io`

4. Click **"Add"**

5. Vercel will show you DNS configuration needed

### 2️⃣ Configure DNS (If needed)

If you manage DNS outside Vercel, add this CNAME record:

```
Type: CNAME
Name: builder
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

**If using Vercel DNS** (recommended):
- No action needed, Vercel handles it automatically

### 3️⃣ Test the Setup

Once DNS propagates (can take 5-60 minutes):

**Test Landing Page:**
```
https://yenze.io
```
Should show the new marketing landing page

**Test Builder:**
```
https://builder.yenze.io/public/
```
Should show the HTML editor

**Test Dashboard:**
```
https://builder.yenze.io/public/dashboard.html
```
Should show the user dashboard

### 4️⃣ Update Links (Optional but Recommended)

Update these files to use the new builder subdomain:

**In config.js:**
```javascript
const SITE_URL = 'https://builder.yenze.io';
```

**In any email templates:**
- Change `yenze.io/public/` → `builder.yenze.io/public/`

## What Happens Now?

### ✅ yenze.io
- Shows beautiful marketing landing page
- Converts visitors to users
- Professional first impression

### ✅ builder.yenze.io
- Full HTML builder/editor
- User dashboard
- All product features

### ✅ [username].yenze.io
- User published sites
- Still works exactly the same

### ✅ Custom Domains
- Still work exactly the same
- No changes needed

## Quick Verification Commands

```bash
# Check DNS propagation
dig builder.yenze.io

# Test landing page
curl -I https://yenze.io

# Test builder
curl -I https://builder.yenze.io/public/

# Check if rewrites working
curl -I https://builder.yenze.io/public/dashboard.html
```

## Current Status

- ✅ Landing page created (`/landing/index.html`)
- ✅ `vercel.json` configured with rewrites
- ✅ Code deployed to production
- ⏳ Waiting for `builder.yenze.io` to be added in Vercel
- ⏳ DNS propagation

## Next Steps

1. **Add domain in Vercel** (5 minutes)
2. **Wait for DNS** (5-60 minutes)
3. **Test everything** (5 minutes)
4. **Update any hardcoded URLs** (optional)
5. **Announce new landing page!** 🎉

## Rollback Plan

If something goes wrong, rollback is simple:

1. Remove `builder.yenze.io` from Vercel domains
2. Revert `vercel.json` to previous version:
```bash
git revert HEAD
vercel --prod
```

Everything returns to previous state where `yenze.io` shows builder.

## FAQ

**Q: Will existing user sites break?**
A: No, `*.yenze.io/s/slug` URLs still work exactly the same.

**Q: Will custom domains break?**
A: No, custom domains are unaffected.

**Q: Can users still login?**
A: Yes, at `builder.yenze.io/public/login.html`

**Q: What about SEO?**
A: Better! Marketing content now at root domain, product at subdomain.

**Q: Can I change the landing page design?**
A: Yes, edit `/landing/index.html` anytime.

**Q: Do I need to update Stripe?**
A: No, Stripe redirects work with both URLs.

## Support

If you encounter any issues:

1. Check Vercel deployment logs: `vercel logs --prod`
2. Check DNS propagation: https://dnschecker.org/#CNAME/builder.yenze.io
3. Review [DOMAIN_STRUCTURE.md](DOMAIN_STRUCTURE.md) for detailed docs
4. Check browser console for errors
