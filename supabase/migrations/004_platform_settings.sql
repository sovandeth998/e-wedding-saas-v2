CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage platform settings" ON platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

INSERT INTO platform_settings (key, value, description) VALUES
  ('owner_bank_name', 'ABA Bank', 'ឈ្មោះធនាគារម្ចាស់'),
  ('owner_account_name', 'MENSOANDETH', 'ឈ្មោះគណនីម្ចាស់'),
  ('owner_account_number', '070866998', 'លេខគណនីម្ចាស់'),
  ('owner_khqr_image', '', 'រូបភាព KHQR Code ម្ចាស់')
ON CONFLICT (key) DO NOTHING;
