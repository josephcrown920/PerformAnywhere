-- Migration 003: Confirm audio asset support and add lip_sync tracking column.
-- project_assets.kind is TEXT with no constraint so "audio" already works.
-- This migration only adds an optional tracking column to project_renders.
--
-- Run this once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dgtnkkarlwufxawfaybb/sql/new

-- Track whether a render was a lip-sync job (informational)
ALTER TABLE project_renders
  ADD COLUMN IF NOT EXISTS is_lip_sync boolean NOT NULL DEFAULT false;

-- Track whether a render used OmniHuman (informational)
ALTER TABLE project_renders
  ADD COLUMN IF NOT EXISTS is_omnihuman boolean NOT NULL DEFAULT false;

-- Verify
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('project_renders')
ORDER BY ordinal_position;
