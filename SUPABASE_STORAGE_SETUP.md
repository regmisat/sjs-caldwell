# Supabase Storage Setup for Speaker Photos

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New Bucket"**
4. Configure the bucket:
   - **Name**: `speaker-photos`
   - **Public**: ✅ **Enable** (so photos can be viewed publicly)
   - **File size limit**: 5 MB (optional)
   - **Allowed MIME types**: `image/*` (optional)
5. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

The bucket needs to be publicly readable but only admins can upload/delete.

1. Click on your `speaker-photos` bucket
2. Go to the **Policies** tab
3. Click **"New Policy"**

### Policy 1: Public Read Access

```sql
CREATE POLICY "Public can view speaker photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'speaker-photos');
```

### Policy 2: Authenticated Users Can Upload

```sql
CREATE POLICY "Authenticated users can upload speaker photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'speaker-photos'
  AND auth.role() = 'authenticated'
);
```

### Policy 3: Authenticated Users Can Update

```sql
CREATE POLICY "Authenticated users can update speaker photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'speaker-photos' AND auth.role() = 'authenticated');
```

### Policy 4: Authenticated Users Can Delete

```sql
CREATE POLICY "Authenticated users can delete speaker photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'speaker-photos' AND auth.role() = 'authenticated');
```

## Step 3: Update Existing Speaker Photos (Optional)

If you have existing photos in `/public/speakers/`, you can:

1. **Option A**: Upload them through the admin panel

   - Go to `/admin/speakers`
   - Edit each speaker
   - Upload their photo using the file input
   - The photo will automatically be stored in Supabase

2. **Option B**: Bulk upload via Supabase dashboard
   - Go to Storage → `speaker-photos` bucket
   - Click "Upload files"
   - Upload all photos from your local `/public/speakers/` folder
   - Then update the database with the new URLs

## How It Works Now

### Upload Process:

1. Admin selects a photo in `/admin/speakers`
2. Photo is uploaded to Supabase Storage bucket `speaker-photos`
3. Unique filename is generated: `timestamp-randomstring.ext`
4. File is stored in path: `speakers/timestamp-randomstring.ext`
5. Public URL is returned and saved to database
6. Photo is immediately accessible

### Storage Structure:

```
speaker-photos (bucket)
└── speakers/
    ├── 1703123456-abc123.jpg
    ├── 1703123789-def456.png
    └── ...
```

### URL Format:

```
https://[project-id].supabase.co/storage/v1/object/public/speaker-photos/speakers/1703123456-abc123.jpg
```

## Benefits of Supabase Storage

✅ **CDN Distribution**: Fast global delivery
✅ **Scalability**: No server storage limits
✅ **Security**: Built-in access controls
✅ **Backup**: Automatic backups
✅ **Image Optimization**: Can add Supabase Image Transformation
✅ **No Deployment Issues**: Works on Vercel, serverless platforms

## Rich Text Editor

The bio field now uses **React Quill** rich text editor with features:

- Headers (H1, H2, H3)
- Bold, Italic, Underline
- Ordered and unordered lists
- Links
- Clean formatting

Bios are stored as HTML in the database and rendered properly on the speakers page.

## Migration Notes

If you already have speaker photos:

1. Old photos at `/public/speakers/` will still work
2. New uploads go to Supabase Storage
3. Gradually migrate by re-uploading through admin panel
4. Or run a migration script to move all photos to Supabase

## Troubleshooting

**Error: "Failed to upload to storage"**

- Check that the bucket `speaker-photos` exists
- Verify the bucket is set to **Public**
- Ensure storage policies are set up correctly

**Photos not displaying**

- Check the bucket is marked as **Public**
- Verify the SELECT policy allows public access
- Check the URL format in the database

**Upload fails**

- Check file size (max 5MB)
- Verify file is an image type
- Check Supabase storage quota

## File Size Limits

Current limit: **5 MB per file**

To change:

1. Bucket settings in Supabase dashboard
2. Update validation in `/api/admin/upload/route.ts`
