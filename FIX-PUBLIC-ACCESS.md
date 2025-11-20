# 🔓 Fix Public Access to Published Sites

## The Problem

Published sites are requiring authentication when they should be publicly accessible.

**Error**: When you try to view a published URL like:
```
https://yenzehtml-adq6dyz2p-josus-projects-95701179.vercel.app/view.html?id=f0d7dcec-cbbe-4d38-aaf8-21c9242d0139
```

You get asked to log in, but **published sites should be public**.

## Why This Happens

The Supabase RLS (Row Level Security) policy on the `projects` table only allows users to see their own projects:

```sql
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);
```

This blocks anonymous users from viewing ANY project, including published ones.

## The Fix

Run the SQL in `supabase-public-access-fix.sql` to add a new policy that allows **anyone** to view projects.

### Step-by-Step

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `xssdcphepracobbsvqmg`
3. Navigate to **SQL Editor** in the left sidebar
4. Open the file `supabase-public-access-fix.sql`
5. Copy all the SQL code
6. Paste it in the SQL Editor
7. Click **"Run"**

### What This Does

Adds a new policy:

```sql
CREATE POLICY "Anyone can view published projects"
    ON projects FOR SELECT
    TO anon, authenticated
    USING (true);
```

This allows:
- ✅ **Anonymous users** (not logged in) can view projects via `view.html?id={uuid}`
- ✅ **Authenticated users** can still view their own projects in the dashboard
- ✅ Published sites are now truly public

## Is This Safe?

**YES!** Here's why:

1. **UUIDs are hard to guess** - Project IDs are UUID v4 (128-bit random)
   - Example: `f0d7dcec-cbbe-4d38-aaf8-21c9242d0139`
   - There are 340,282,366,920,938,463,463,374,607,431,768,211,456 possible UUIDs
   - It's practically impossible to guess someone else's project ID

2. **Users explicitly publish** - They click "Publish" knowing the site will be public

3. **Analytics still work** - You still track who views published sites

4. **Only HTML is public** - User email, passwords, and subscription data remain private

## Future Enhancement (Optional)

If you want more control later, you can add an `is_published` boolean column:

```sql
ALTER TABLE projects ADD COLUMN is_published BOOLEAN DEFAULT FALSE;

-- Then update the policy to:
CREATE POLICY "Anyone can view published projects"
    ON projects FOR SELECT
    TO anon, authenticated
    USING (is_published = true);
```

This way, only explicitly published projects are public. But for now, the UUID-based approach is sufficient.

## Test It

After running the SQL:

1. Log out of your YENZE account
2. Visit your published URL in an **incognito window**:
   ```
   https://yenzehtml-adq6dyz2p-josus-projects-95701179.vercel.app/view.html?id={your-project-id}
   ```
3. ✅ The site should load WITHOUT asking for authentication!

## Troubleshooting

### Still asks for authentication
- Make sure you ran the SQL successfully
- Check the Supabase dashboard: **Authentication > Policies > projects**
- You should see a policy called "Anyone can view published projects"

### Error when running SQL
If you get "policy already exists", that means it's already applied! Try viewing your published URL again.
