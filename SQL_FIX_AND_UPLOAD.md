# SQL Error Fix & Admin Image Upload

## Changes Made

### 1. Fixed SQL Syntax Error

**Problem**: Single quotes in speaker bio text were causing SQL errors.

**Solution**: Escaped all apostrophes with double single quotes (`''`) in the SQL file.

**File**: `supabase-schema.sql`

- Changed `women's issues` to `women''s issues`
- This is the standard SQL escaping method

### 2. Added Image Upload Functionality

#### New API Routes Created:

**`/api/admin/upload` (POST)**

- Accepts file uploads from admins
- Validates file is an image
- Saves to `/public/speakers/` directory
- Returns public URL path
- Generates unique filenames using timestamp

**`/api/admin/speakers` (POST, PUT, DELETE)**

- POST: Create new speaker
- PUT: Update existing speaker
- DELETE: Delete speaker by ID
- All routes require authentication (admin check TODO)

#### Updated Admin UI:

**`/admin/speakers` improvements**:

- ✅ **Full CRUD Operations**: Create, Read, Update, Delete speakers
- ✅ **Image Upload**: Click to upload speaker photos
- ✅ **Image Preview**: See uploaded image immediately
- ✅ **Photo Column**: Table now shows speaker photos
- ✅ **Form States**: Loading/uploading/submitting states
- ✅ **Better UX**: Success/error messages, disabled buttons during operations

### How to Use

#### Upload Speaker Photo:

1. Go to `/admin/speakers`
2. Fill in speaker details
3. Click "Choose File" under "Photo Upload"
4. Select an image (jpg, png, etc.)
5. Image will upload automatically and show preview
6. Click "Create Speaker" or "Update Speaker"

#### Manually Set Photo URL:

- Photos are saved to `/public/speakers/`
- URL format: `/speakers/filename.jpg`
- Can also manually place images in that folder and reference them

### File Structure

```
public/
  speakers/
    heidi-schlumpf.jpg     # Keynote speaker photo
    placeholder.jpg         # Fallback for missing photos
    [timestamp].jpg         # Auto-uploaded photos
```

### Next Steps

1. **Run the fixed SQL script** in Supabase (apostrophes now escaped)
2. **Add admin role check** in API routes (currently any auth user can access)
3. **Optional**: Add image cropping/resizing functionality
4. **Optional**: Use cloud storage (S3, Cloudinary) instead of local storage

### Security Notes

⚠️ Current Implementation:

- Images stored locally in `/public/speakers/`
- Any authenticated user can upload (admin check needed)
- File type validation (images only)
- Unique filenames prevent overwriting

🔐 TODO for Production:

- Add proper admin role verification
- Add file size limits
- Add image optimization/compression
- Consider cloud storage for scalability
- Add CSRF protection
