-- Change template_id from UUID to TEXT so we can store "1", "2", ... "12"
ALTER TABLE invitations ALTER COLUMN template_id TYPE TEXT USING template_id::TEXT;

-- Set default to '1'
ALTER TABLE invitations ALTER COLUMN template_id SET DEFAULT '1';

-- Update sample wedding
UPDATE invitations SET template_id = '1' WHERE slug = 'sample-wedding-2026';

-- Set all NULL to '1'
UPDATE invitations SET template_id = '1' WHERE template_id IS NULL;
