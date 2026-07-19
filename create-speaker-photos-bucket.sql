-- Create public speaker-photos storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'speaker-photos',
  'speaker-photos',
  true,
  15728640, -- 15MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read access
DROP POLICY IF EXISTS "Public can view speaker photos" ON storage.objects;
CREATE POLICY "Public can view speaker photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'speaker-photos');

-- Authenticated upload/update/delete (service role bypasses these anyway)
DROP POLICY IF EXISTS "Authenticated users can upload speaker photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload speaker photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'speaker-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update speaker photos" ON storage.objects;
CREATE POLICY "Authenticated users can update speaker photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'speaker-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete speaker photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete speaker photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'speaker-photos' AND auth.role() = 'authenticated');
