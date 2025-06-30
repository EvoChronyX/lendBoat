-- Migration to update owner_requests table with new columns
-- Remove consent_agreement column and add new fields

-- First, drop the consent_agreement column if it exists
ALTER TABLE owner_requests DROP COLUMN IF EXISTS consent_agreement;

-- Add new columns
ALTER TABLE owner_requests ADD COLUMN IF NOT EXISTS government_id_num TEXT;
ALTER TABLE owner_requests ADD COLUMN IF NOT EXISTS owner_id TEXT;
ALTER TABLE owner_requests ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing records to have default values for new required fields
UPDATE owner_requests 
SET 
  government_id_num = COALESCE(government_id_num, ''),
  owner_id = COALESCE(owner_id, ''),
  password = COALESCE(password, '')
WHERE government_id_num IS NULL OR owner_id IS NULL OR password IS NULL; 