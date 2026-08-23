-- 013: Short share codes for guest invite links (/g/{code})
ALTER TABLE guests ADD COLUMN IF NOT EXISTS share_code TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_guests_share_code ON guests (share_code);
