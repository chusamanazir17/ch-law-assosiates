-- ==============================================================================
-- 001_extensions.sql
-- Project: CH Office Management System
-- Business: CH Composing E-Stamp & Tax Advisor, Chamber 121, Kachahri Sahiwal
-- Step 1: Core PostgreSQL Extensions supported by Supabase
-- ==============================================================================

-- UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Cryptographic utilities and gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Trigram indexing for fast client fuzzy search (CNIC, name, mobile, business)
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;

-- Case-insensitive character string type for emails and unique codes
CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA extensions;
