INSERT INTO platform_settings (key, value, description) VALUES
  ('site_logo', '', 'Logo របស់ Site'),
  ('facebook_url', '', 'Facebook URL'),
  ('instagram_url', '', 'Instagram URL'),
  ('telegram_group_url', '', 'Telegram Group URL'),
  ('primary_color', '#b8860b', 'ពណ៌ Primary'),
  ('secondary_color', '#1a1a2e', 'ពណ៌ Secondary'),
  ('telegram_bot_token', '', 'Telegram Bot Token'),
  ('telegram_chat_id', '', 'Telegram Chat ID')
ON CONFLICT (key) DO NOTHING;
