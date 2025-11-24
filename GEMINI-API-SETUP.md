# Google Gemini API Setup for YENZE

## ✅ What's Been Implemented

Your YENZE platform now has AI website generation powered by Google Gemini! Here's what was built:

### 1. **Landing Page Redesign**
- Modern 3-option onboarding flow
- **Use Your HTML** → Import existing code
- **Choose a Template** → Browse free & premium templates  
- **Generate with AI** → Create with Gemini (redirects to `?ai=true`)

### 2. **Templates Marketplace**
- 6 starter templates (3 free, 3 premium)
- Categories: Portfolio, Landing Page, Business
- Beautiful card-based UI with filters
- Click to load template HTML into builder

### 3. **AI Generation Integration**
- Added "Generate with AI" section in builder's Import panel
- Textarea for describing the website
- Calls `/api/generate-ai.js` endpoint
- **Hybrid API key system** (uses yours first, falls back to user's)

---

## 🔑 How to Set Up Your Gemini API Key

### Step 1: Get Your Free API Key

1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API key"**
4. Copy the generated key (starts with `AIza...`)

**Note**: Google Gemini has a generous free tier:
- 60 requests per minute
- 1,500 requests per day
- Completely FREE to use

### Step 2: Add to Vercel Environment Variables

1. Go to your Vercel dashboard: **https://vercel.com/josus-projects-95701179/yenzehtml/settings/environment-variables**
2. Click **"Add New"**
3. Fill in:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIza...` (paste your API key)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **"Save"**

### Step 3: Redeploy (Important!)

After adding the environment variable, you need to redeploy:

```bash
vercel --prod
```

Or use the Vercel dashboard:
- Go to Deployments tab
- Click the three dots (...) on the latest deployment
- Click **"Redeploy"**

---

## 🚀 How It Works

### Default Flow (Your API Key):
1. User enters description: "Create a modern portfolio for a photographer"
2. System calls `/api/generate-ai.js` with your `GEMINI_API_KEY`
3. Gemini generates complete HTML with CSS/JS
4. HTML loads into builder for customization
5. User can publish immediately

### Fallback Flow (Rate Limited):
1. If your API key hits rate limit (60/min)
2. User sees prompt: "Rate limit exceeded. Use your own API key?"
3. User can enter their own Gemini key (free to get)
4. System retries with user's key
5. Success! HTML generated

### Prompt Engineering:
The API sends optimized prompts to Gemini that ensure:
- Complete HTML with DOCTYPE, head, body
- Inline CSS and JavaScript
- Responsive mobile-friendly design
- Modern styling (flexbox, grid)
- Professional typography and colors
- Semantic HTML5 structure
- No markdown code fences in output

---

## 📊 Testing the Integration

### Test AI Generation:
1. Go to: **https://builder.yenze.io**
2. Click **"Import"** tab in left sidebar
3. Scroll to **"✨ Generate with AI"** section
4. Enter a description:
   ```
   Create a modern landing page for a SaaS product with a hero section,
   features grid, pricing table, and call-to-action button.
   Use a purple gradient background and clean design.
   ```
5. Click **"Generate with AI"**
6. Watch the toast: "🤖 AI is creating your website..."
7. HTML loads in ~5-10 seconds
8. Customize and publish!

### Test Templates:
1. Go to: **https://yenze.io**
2. Click **"Choose a Template"** card
3. Browse templates at: **https://builder.yenze.io/templates.html**
4. Click any free template
5. Template loads in builder

### Test Landing Page:
1. Visit: **https://yenze.io**
2. See the 3-option onboarding flow
3. Each option has distinct styling and hover effects

---

## 🔒 Security & Rate Limits

### Your API Key Protection:
- ✅ Stored securely in Vercel environment variables
- ✅ Never exposed to client-side
- ✅ Used server-side only in `/api/generate-ai.js`

### Rate Limit Management:
- **Free Tier**: 60 requests/minute, 1,500/day
- If exceeded: Users prompted to use their own key
- No hard failures - always has fallback

### API Key Validation:
- ✅ Validates HTML output (must contain `<!DOCTYPE` or `<html>`)
- ✅ Removes markdown code fences if present
- ✅ Handles Gemini API errors gracefully

---

## 💰 Cost & Usage

### Google Gemini Pricing:
- **Free Tier**: 
  - 60 RPM (requests per minute)
  - 1,500 RPD (requests per day)
  - Model: `gemini-pro`
  
- **Paid Plans** (if you exceed free tier):
  - Pay-as-you-go after free tier
  - ~$0.00025 per request
  - Very affordable even with heavy usage

### Estimated Usage:
- **Low traffic** (10 AI generations/day): FREE forever
- **Medium traffic** (100 AI generations/day): FREE (within 1,500/day limit)
- **High traffic** (5,000 AI generations/day): ~$1.25/day

---

## 🐛 Troubleshooting

### "API key not configured" Error:
1. Check Vercel environment variable is named exactly: `GEMINI_API_KEY`
2. Ensure you redeployed after adding the variable
3. Check the API key starts with `AIza...`

### "Rate limit exceeded" Immediately:
- Your API key might be invalid
- Go to Google AI Studio and regenerate the key
- Update in Vercel and redeploy

### "Generated content is not valid HTML":
- Gemini might have returned markdown or explanation text
- The API automatically strips markdown fences
- If persists, the prompt might need adjustment

### Slow Generation (>30 seconds):
- Normal for complex prompts
- Gemini Pro can take 5-20 seconds
- Consider upgrading to Gemini Pro 1.5 (faster) if needed

---

## 📝 Next Steps (Optional Enhancements)

### Phase 2 Features:
- [ ] Save generated prompts for re-use
- [ ] AI prompt templates library
- [ ] "Regenerate" button to try different variations
- [ ] AI-powered website editing (modify existing HTML)
- [ ] Image generation integration (DALL-E or Midjourney)
- [ ] SEO optimization suggestions via AI

### UI Improvements:
- [ ] Preview generated HTML before loading
- [ ] Show token usage / cost estimation
- [ ] AI generation history
- [ ] Share AI prompts with community

---

## 🎉 Summary

You now have a complete AI-powered website builder with:

✅ **3-Way Onboarding**: Import HTML, Choose Template, or Generate with AI  
✅ **Templates Marketplace**: 6 starter templates (3 free, 3 premium)  
✅ **Google Gemini Integration**: Hybrid API key system  
✅ **Professional UI**: Modern gradients, hover effects, responsive design  
✅ **Fallback System**: Users can use their own API keys if needed  

**Next action**: Add your `GEMINI_API_KEY` to Vercel and test the AI generation!

Get your free API key: https://makersuite.google.com/app/apikey
