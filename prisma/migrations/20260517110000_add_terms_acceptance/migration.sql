-- Migration: add_terms_acceptance
-- Adds termsAcceptedAt and termsVersion columns to users table

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "terms_version"     TEXT;
