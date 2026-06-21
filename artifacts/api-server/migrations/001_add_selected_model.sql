-- Migration 001: Add selected_model to projects table
-- Run this once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dgtnkkarlwufxawfaybb/sql/new

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS selected_model text;

-- Optional: add an index for analytics
-- CREATE INDEX IF NOT EXISTS projects_selected_model_idx ON projects (selected_model);

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;
