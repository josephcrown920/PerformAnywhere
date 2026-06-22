-- Migration 002: Add missing columns required by the render pipeline.
-- The render code reads/writes these columns; without them, renders never
-- save their result and polling returns "not found" (renders appear to
-- "disappear" / never resume).
--
-- Run this once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dgtnkkarlwufxawfaybb/sql/new

-- projects: where the final render is recorded and polled
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS selected_model text,
  ADD COLUMN IF NOT EXISTS output_path text;

-- project_renders: per-attempt render history
ALTER TABLE project_renders
  ADD COLUMN IF NOT EXISTS prompt text,
  ADD COLUMN IF NOT EXISTS provider_task_id text;

-- Verify
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('projects', 'project_renders')
ORDER BY table_name, ordinal_position;
