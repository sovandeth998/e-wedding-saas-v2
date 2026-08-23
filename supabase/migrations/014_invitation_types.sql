-- Support multiple ceremony types (wedding, birthday, ...)
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'wedding';
