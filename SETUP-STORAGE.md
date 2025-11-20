# 📦 Supabase Storage Setup for YENZE

## Why Use Supabase Storage?

Using Supabase Storage for the FREE plan protects you from unexpected costs:
- ✅ **Predictable pricing**: $0.021/GB after 1GB free
- ✅ **50GB egress free/month**, then $0.09/GB
- ✅ **No surprise bills** from thousands of users deploying
- ✅ **Simple and fast** - no complex CDN setup needed

## Setup Instructions

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `xssdcphepracobbsvqmg`
3. Navigate to **Storage** in the left sidebar
4. Click **"New Bucket"**
5. Set bucket name: `published-sites`
6. Check **"Public bucket"** (important!)
7. Click **"Create bucket"**

### Step 2: Configure Policies

1. In your Supabase Dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-storage-setup.sql`
3. Paste and click **"Run"**

This will set up:
- Public read access (anyone can view published sites)
- Authenticated write access (users can only upload to their own folder)
- Proper folder isolation (users/{user_id}/{project_id}/index.html)

### Step 3: Test It!

1. Deploy the updated code: `vercel --prod`
2. Log in to your YENZE editor
3. Create a simple HTML page
4. Click **Publish** and select **FREE** plan
5. You should see a URL like:
   ```
   https://xssdcphepracobbsvqmg.supabase.co/storage/v1/object/public/published-sites/{user_id}/{project_id}/index.html
   ```

## Cost Estimation

### FREE Plan Users
- **Storage**: 1GB free, then $0.021/GB/month
- **Bandwidth**: 50GB free/month, then $0.09/GB

### Example Scenarios:

**100 users with 50KB sites each:**
- Storage: 5MB = FREE
- Bandwidth (1000 views/month each): ~5GB = FREE
- **Cost: $0/month**

**1000 users with 100KB sites each:**
- Storage: 100MB = FREE
- Bandwidth (1000 views/month each): ~100GB = $4.50/month
- **Cost: $4.50/month**

**10,000 users with 200KB sites each:**
- Storage: 2GB = $0.021
- Bandwidth (500 views/month each): ~1TB = $90/month
- **Cost: ~$90/month**

## Paid Plans (ONE_TIME / PRO)

For paid plans, you can later implement:
- **Netlify** - Users connect their own Netlify account
- **Vercel** - Users connect their own Vercel account
- **Cloudflare Pages** - Users connect their own CF account

This way, the bandwidth/hosting cost is on THEM, not you!

## Troubleshooting

### "Failed to upload to storage"
- Make sure the bucket `published-sites` exists
- Make sure it's set to **Public**
- Make sure you ran the SQL policies

### "Access denied"
- Check that RLS policies are correctly set up
- Make sure user is authenticated before publishing

### Files not showing
- Verify the bucket is PUBLIC
- Check the public URL format is correct
- Try accessing the URL directly in browser

## Next Steps

1. ✅ Configure the storage bucket
2. ✅ Run the SQL policies
3. ✅ Deploy and test
4. 🔜 Implement custom domains for paid plans
5. 🔜 Set up Stripe for payments
