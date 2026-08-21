ALTER TABLE invitations ADD COLUMN video_url TEXT;
ALTER TABLE invitations ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;
ALTER TABLE invitations ADD COLUMN dress_code TEXT;
ALTER TABLE invitations ADD COLUMN dress_code_color TEXT DEFAULT '#b8860b';
