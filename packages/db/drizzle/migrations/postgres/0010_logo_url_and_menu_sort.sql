-- Add logo_url column to settings table (idempotent)
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "logo_url" text;
