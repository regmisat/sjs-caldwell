-- Add is_published column to speakers table
ALTER TABLE speakers 
ADD COLUMN is_published BOOLEAN DEFAULT false;

-- Add is_published column to sessions table
ALTER TABLE sessions 
ADD COLUMN is_published BOOLEAN DEFAULT false;

-- Optional: Set existing records to published (if you want to publish all existing content)
-- UPDATE speakers SET is_published = true;
-- UPDATE sessions SET is_published = true;
