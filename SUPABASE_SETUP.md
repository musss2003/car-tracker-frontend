# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project
1. Go to https://supabase.com/
2. Click "Start your project" 
3. Sign up with GitHub (recommended) or email
4. Click "New project"
5. Choose organization (create one if needed)
6. Project details:
   - Name: `car-tracker-storage`
   - Database Password: (generate strong password - save it!)
   - Region: Choose closest to your users
7. Click "Create new project"
8. Wait 2-3 minutes for setup

## Step 2: Get Project Configuration
1. Go to your project dashboard
2. Click "Settings" (gear icon in left sidebar)
3. Go to "API" tab
4. Copy these values:
   - **Project URL**
   - **anon public key**
   - **service_role key** (keep this secret!)

## Step 3: Enable Storage
1. In left sidebar, go to "Storage"
2. Click "Create a new bucket"
3. Bucket details:
   - Name: `customer-photos`
   - Public bucket: `true` (for easy access)
   - File size limit: `10MB`
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
4. Click "Create bucket"

## Step 4: Set Storage Policies (Security)
1. In Storage, go to "Policies" tab
2. Click "New policy" for the `customer-photos` bucket
3. Choose "Custom" policy
4. Policy name: `Allow public read and authenticated upload`
5. Policy definition:
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'customer-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'customer-photos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE USING (bucket_id = 'customer-photos');
```

## Step 5: Update Environment Variables
Add these to your `.env.local` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_KEY=your-service-key-here

# Remove or comment out Firebase variables
# VITE_FIREBASE_API_KEY=...
```

## Free Tier Limits
- ✅ **Storage**: 1GB free
- ✅ **Bandwidth**: 2GB/month free  
- ✅ **Database**: 500MB free
- ✅ **API requests**: 50,000/month free
- ✅ **No billing required** for free tier!

Perfect for small to medium projects! 🎉