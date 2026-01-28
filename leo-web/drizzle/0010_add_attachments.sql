-- Add attachments column for file uploads
-- Users can attach files (code, docs, images) to provide context for generation
-- Files are stored in Supabase Storage, metadata stored here as JSONB

ALTER TABLE generation_requests ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

COMMENT ON COLUMN generation_requests.attachments IS 'Array of attached files: [{name, storagePath, size, mimeType}]';
