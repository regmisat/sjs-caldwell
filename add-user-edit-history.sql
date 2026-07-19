-- Track edits users make through the "Edit Information" section
CREATE TABLE IF NOT EXISTS user_edit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID of the user whose info was edited
  edited_by TEXT NOT NULL, -- Clerk user ID of who made the edit
  source TEXT NOT NULL DEFAULT 'edit_information', -- where the edit came from
  changes JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ field, old_value, new_value }]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_edit_history_user_id ON user_edit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_edit_history_created_at ON user_edit_history(created_at);

-- RLS enabled with no policies: only the service role key can read/write
ALTER TABLE user_edit_history ENABLE ROW LEVEL SECURITY;
