-- Update sample wedding to use template 1 (ផ្កាឈូករ៉ូមែនទិច)
UPDATE invitations
SET template_id = '1'
WHERE slug = 'sample-wedding-2026';

-- Ensure all existing invitations have a default template
UPDATE invitations
SET template_id = '1'
WHERE template_id IS NULL;
