-- Fix packages: add missing columns
ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS badge_color TEXT;

-- Create platform_settings if not exists
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read platform settings" ON platform_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage platform settings" ON platform_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO platform_settings (key, value, description) VALUES
  ('owner_bank_name', 'ABA Bank', 'ធនាគារ'),
  ('owner_account_name', 'MENSOANDETH', 'ឈ្មោះគណនី'),
  ('owner_account_number', '070866998', 'លេខគណនី'),
  ('owner_khqr_image', '', 'KHQR'),
  ('site_logo', '', 'Logo'),
  ('facebook_url', '', 'Facebook'),
  ('instagram_url', '', 'Instagram'),
  ('telegram_group_url', '', 'Telegram Group'),
  ('primary_color', '#b8860b', 'Primary Color'),
  ('secondary_color', '#1a1a2e', 'Secondary Color'),
  ('telegram_bot_token', '', 'Bot Token'),
  ('telegram_chat_id', '', 'Chat ID')
ON CONFLICT (key) DO NOTHING;

-- Fix packages RLS for admin upsert
DO $$ BEGIN
  CREATE POLICY "Admins can manage packages" ON packages FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Make admin
UPDATE users SET role = 'admin' WHERE email = 'mensovandath998@gmail.com';
