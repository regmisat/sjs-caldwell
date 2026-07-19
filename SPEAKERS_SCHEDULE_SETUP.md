# Speakers and Schedule Setup Guide

This document explains how to set up the speakers and schedule system for the Caldwell Social Justice Symposium.

## Database Setup

### Step 1: Run the SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the script

This will:

- Create tables for `speakers`, `sessions`, `session_speakers`, and `session_registrations`
- Set up appropriate indexes and Row Level Security policies
- Insert dummy data for testing (20 speakers and 8 sessions)

### Database Schema Overview

**speakers**

- `id` - UUID primary key
- `name` - Speaker name
- `title` - Professional title
- `bio` - Biography
- `photo_url` - Path to photo (e.g., `/speakers/heidi-schlumpf.jpg`)
- `is_keynote` - Boolean flag for keynote speakers
- `book_links` - JSONB for storing book information
- `created_at`, `updated_at` - Timestamps

**sessions**

- `id` - UUID primary key
- `title` - Session title
- `description` - Session description
- `start_time`, `end_time` - Timestamps (EST timezone)
- `location` - Room location
- `max_attendees` - Maximum capacity
- `is_general` - Boolean for general sessions (registration, opening remarks)
- `created_at`, `updated_at` - Timestamps

**session_speakers**

- Mapping table linking speakers to sessions
- `session_id` - Foreign key to sessions
- `speaker_id` - Foreign key to speakers

**session_registrations**

- User registrations for sessions
- `session_id` - Foreign key to sessions
- `user_id` - Clerk user ID
- `registered_at` - Timestamp

## Features

### Public Features

1. **Speakers Page** (`/speakers`)

   - Displays keynote speaker with full bio
   - Shows breakout session speakers in a grid
   - Fetches data from Supabase dynamically

2. **Schedule Page** (`/schedule`)
   - Shows all sessions grouped by time slot
   - Displays speaker names for each session
   - Shows registration count vs. capacity (e.g., "27 / 40 Attendees")
   - Allows signed-in users to register/unregister for sessions
   - Prevents registration when session is full
   - General sessions (breakfast, opening remarks) don't have register buttons

### Admin Features

1. **Manage Speakers** (`/admin/speakers`)

   - View all speakers
   - Add new speakers
   - Edit existing speakers
   - Delete speakers
   - Mark speakers as keynote

2. **Manage Sessions** (`/admin/sessions`)
   - View all sessions
   - See registration counts
   - See which speakers are assigned to each session
   - TODO: Add/Edit/Delete functionality (currently view-only)

## API Routes

### `/api/speakers`

- GET: Fetch all speakers ordered by keynote status and name

### `/api/sessions`

- GET: Fetch all sessions with speaker details and registration counts

### `/api/sessions/register`

- GET: Fetch current user's registered sessions
- POST: Register for a session
- DELETE: Unregister from a session

## Adding Real Data

### Adding a Speaker

1. Go to `/admin/speakers`
2. Fill in the form:
   - **Name**: Speaker's full name
   - **Title**: Professional title or affiliation
   - **Bio**: Full biography
   - **Photo URL**: Path to photo (e.g., `/speakers/jane-doe.jpg`)
   - **Keynote**: Check if this is a keynote speaker
3. Click "Create Speaker"

Alternatively, insert directly via SQL:

```sql
INSERT INTO speakers (name, title, bio, photo_url, is_keynote)
VALUES ('Jane Doe', 'Professor of Sociology', 'Bio text here...', '/speakers/jane-doe.jpg', false);
```

### Adding a Session

Currently via SQL only:

```sql
-- Insert session
INSERT INTO sessions (title, description, start_time, end_time, location, max_attendees, is_general)
VALUES (
  'Session Title',
  'Session description...',
  '2026-02-27 10:00:00-05',
  '2026-02-27 10:50:00-05',
  'Werner 316',
  25,
  false
);

-- Link speakers to session
INSERT INTO session_speakers (session_id, speaker_id)
SELECT
  (SELECT id FROM sessions WHERE title = 'Session Title'),
  id
FROM speakers
WHERE name IN ('Speaker 1', 'Speaker 2');
```

## Image Assets

Place speaker photos in `/public/speakers/`:

- `/public/speakers/heidi-schlumpf.jpg` (keynote speaker)
- `/public/speakers/placeholder.jpg` (fallback image)
- Add more as needed

## TODO: Future Enhancements

1. **Admin Dashboard Improvements**

   - Add create/edit/delete for sessions in the UI
   - Add bulk import functionality
   - Add speaker-to-session assignment UI
   - Add image upload functionality

2. **User Dashboard**

   - Show user's registered sessions
   - Export personal schedule
   - Add to calendar integration

3. **Validation**

   - Prevent double-booking (users registering for overlapping sessions)
   - Check user metadata requirements before allowing registration

4. **Admin Role Check**
   - Currently any authenticated user can access `/admin/*`
   - Need to add proper admin role checking via Clerk metadata

## Testing

1. Sign in with a test account
2. Visit `/schedule` to see all sessions
3. Click "Register" on a breakout session
4. Visit `/admin/sessions` to see updated registration count
5. Click "Unregister" to remove your registration

## Notes

- All times are in Eastern Time (EST/EDT)
- Session capacity is enforced - users cannot register for full sessions
- Users can only register for one session per time slot (no UI enforcement yet)
- General sessions (is_general=true) don't allow registration
