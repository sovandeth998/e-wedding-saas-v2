-- E-Wedding database rebuild (all migrations in order)
-- Generated from supabase/migrations

-- ===== 001_initial_schema.sql =====
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_kh TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  max_guests INTEGER NOT NULL DEFAULT 50,
  max_photos INTEGER NOT NULL DEFAULT 2,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES packages(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  category TEXT DEFAULT 'modern' CHECK (category IN ('modern', 'classic', 'luxury')),
  is_premium BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_id UUID REFERENCES templates(id),
  groom_name TEXT NOT NULL,
  groom_name_kh TEXT,
  groom_photo TEXT,
  bride_name TEXT NOT NULL,
  bride_name_kh TEXT,
  bride_photo TEXT,
  wedding_date TIMESTAMPTZ NOT NULL,
  ceremony_time TEXT,
  reception_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_map_url TEXT,
  story TEXT,
  quote TEXT,
  background_music TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Photos table
CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  custom_link TEXT UNIQUE NOT NULL,
  side TEXT CHECK (side IN ('groom', 'bride', 'both')),
  table_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVP table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'not_attending', 'maybe')),
  number_of_guests INTEGER DEFAULT 1 CHECK (number_of_guests > 0 AND number_of_guests <= 10),
  message TEXT,
  attending_ceremony BOOLEAN DEFAULT TRUE,
  attending_reception BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id, invitation_id)
);

-- Wishes table
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Codes table
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gift', 'cash')),
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  qr_image_url TEXT,
  khqr_payload TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES packages(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('khqr', 'receipt_upload')),
  payment_proof_url TEXT,
  khqr_reference TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_invitations_slug ON invitations(slug);
CREATE INDEX idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX idx_rsvps_invitation_id ON rsvps(invitation_id);
CREATE INDEX idx_wishes_invitation_id ON wishes(invitation_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Insert default packages
INSERT INTO packages (name, name_kh, price, duration_days, max_guests, max_photos, features) VALUES
  ('free', 'កញ្ចប់សាកល្បង', 0, 30, 50, 2, '{"templates": "Basic (1-2)", "linkDuration": "30 days", "guests": "50", "photos": "2", "qrCode": true, "map": true, "backgroundMusic": "Standard only", "rsvp": false, "countdown": false, "watermark": true, "support": "FAQ only"}'),
  ('standard', 'កញ្ចប់ស្តង់ដារ', 18, 180, -1, 10, '{"templates": "Modern (5+)", "linkDuration": "6 months", "guests": "Unlimited", "photos": "6-10", "qrCode": true, "map": true, "backgroundMusic": "Custom upload", "rsvp": true, "countdown": true, "watermark": false, "support": "Telegram Support"}'),
  ('vip', 'កញ្ចប់ប្រណិត', 40, 365, -1, 20, '{"templates": "All Luxury", "linkDuration": "Lifetime (1 year)", "guests": "Unlimited", "photos": "20+ HD", "qrCode": true, "map": true, "backgroundMusic": "Custom upload", "rsvp": true, "countdown": true, "watermark": false, "support": "Done-for-you"}');

-- Insert default templates
INSERT INTO templates (name, description, category, is_premium) VALUES
  ('Romantic Rose', 'A romantic template with rose gold accents', 'modern', false),
  ('Golden Elegance', 'Luxurious golden theme for premium weddings', 'luxury', true),
  ('Khmer Heritage', 'Traditional Khmer wedding design', 'classic', false),
  ('Modern Minimalist', 'Clean and modern design', 'modern', false),
  ('Royal Palace', 'Palace-inspired luxury design', 'luxury', true);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Invitations policies
CREATE POLICY "Users can view own invitations" ON invitations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create invitations" ON invitations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invitations" ON invitations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invitations" ON invitations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view published invitations" ON invitations FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage all invitations" ON invitations FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Guests policies
CREATE POLICY "Users can manage own invitation guests" ON guests FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view guests for published invitations" ON guests FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);

-- RSVP policies
CREATE POLICY "Anyone can submit RSVP" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view RSVPs for own invitations" ON rsvps FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update RSVPs for own invitations" ON rsvps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

-- Wishes policies
CREATE POLICY "Anyone can submit wishes" ON wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view approved wishes" ON wishes FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage wishes for own invitations" ON wishes FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

-- Gallery policies
CREATE POLICY "Users can manage own invitation gallery" ON gallery_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view gallery for published invitations" ON gallery_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);

-- QR codes policies
CREATE POLICY "Users can manage own invitation QR codes" ON qr_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view QR codes for published invitations" ON qr_codes FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all subscriptions" ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Templates policies (public read)
CREATE POLICY "Anyone can view templates" ON templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON templates FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Packages policies (public read)
CREATE POLICY "Anyone can view packages" ON packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage packages" ON packages FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  
  -- Auto-subscribe to free package
  INSERT INTO public.subscriptions (user_id, package_id, status, expires_at)
  SELECT 
    NEW.id,
    p.id,
    'active',
    NOW() + (p.duration_days || ' days')::INTERVAL
  FROM packages p
  WHERE p.name = 'free';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rsvps_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== 002_set_sample_template.sql =====
-- Update sample wedding to use template 1 (ផ្កាឈូករ៉ូមែនទិច)
UPDATE invitations
SET template_id = '1'
WHERE slug = 'sample-wedding-2026';

-- Ensure all existing invitations have a default template
UPDATE invitations
SET template_id = '1'
WHERE template_id IS NULL;

-- ===== 002_storage_setup.sql =====
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Anyone can view uploaded files" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===== 003_fix_auth_trigger.sql =====
-- Fix the trigger to handle errors gracefully
-- First ensure packages table has data
INSERT INTO packages (name, name_kh, price, duration_days, max_guests, max_photos, features) VALUES
  ('free', 'កញ្ចប់សាកល្បង', 0, 30, 50, 2, '{"templates": "Basic (1-2)", "linkDuration": "30 days", "guests": "50", "photos": "2", "qrCode": true, "map": true, "backgroundMusic": "Standard only", "rsvp": false, "countdown": false, "watermark": true, "support": "FAQ only"}')
ON CONFLICT (name) DO NOTHING;

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create safer function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_package_id UUID;
BEGIN
  -- Insert user profile
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Get free package id
  SELECT id INTO free_package_id FROM packages WHERE name = 'free' LIMIT 1;

  -- Auto-subscribe to free package
  IF free_package_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, package_id, status, started_at, expires_at)
    VALUES (NEW.id, free_package_id, 'active', NOW(), NOW() + INTERVAL '30 days')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===== 004_fix_template_id_to_text.sql =====
-- Change template_id from UUID to TEXT so we can store "1", "2", ... "12"
ALTER TABLE invitations ALTER COLUMN template_id TYPE TEXT USING template_id::TEXT;

-- Set default to '1'
ALTER TABLE invitations ALTER COLUMN template_id SET DEFAULT '1';

-- Update sample wedding
UPDATE invitations SET template_id = '1' WHERE slug = 'sample-wedding-2026';

-- Set all NULL to '1'
UPDATE invitations SET template_id = '1' WHERE template_id IS NULL;

-- ===== 004_platform_settings.sql =====
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

-- ===== 005_extra_settings.sql =====
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

-- ===== 005_invite_features.sql =====
ALTER TABLE invitations ADD COLUMN video_url TEXT;
ALTER TABLE invitations ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;
ALTER TABLE invitations ADD COLUMN dress_code TEXT;
ALTER TABLE invitations ADD COLUMN dress_code_color TEXT DEFAULT '#b8860b';

-- ===== 006_fix_tables.sql =====
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

-- ===== 007_fix_users_rls.sql =====
-- Drop the problematic self-referencing policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Simple: user can read own profile
-- Admin can be checked via API or server-side only
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Allow authenticated users to read own row (including role)
CREATE POLICY "Users read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Ensure all registered users have a row
-- Run this if needed:
-- INSERT INTO users (id, email) SELECT id, email FROM auth.users ON CONFLICT (id) DO NOTHING;

-- ===== 008_page_views_analytics.sql =====
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_hash TEXT
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view page views for own invitations" ON page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all page views" ON page_views FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_page_views_invitation_id ON page_views(invitation_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);

-- ===== 009_wishes_select_policy.sql =====
CREATE POLICY "Owners can view all wishes for own invitations" ON wishes FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

-- ===== 010_templates_seed.sql =====
ALTER TABLE templates ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

DELETE FROM templates WHERE code IS NOT NULL;

INSERT INTO templates (code, name, description, category, is_premium, config) VALUES
('1', 'ផ្កាឈូករ៉ូមែនទិច', 'គំរូរ៉ូមែនទិចជាមួយពណ៌មាសផ្កាឈូក', 'modern', false,
 '{"bg":"linear-gradient(180deg, #fdf8f0, #f5edd8, #efe4c8)","bgMain":"linear-gradient(180deg, #fdf8f0, #f5f0e8)","cardFrom":"#fffefa","cardTo":"#f8f2e4","textPri":"#6b4c1e","textSec":"rgba(107,76,30,0.7)","textMut":"rgba(107,76,30,0.45)","accent":"#b8860b","accentFill":"rgba(184,134,11,0.15)","accentBg":"rgba(184,134,11,0.05)","btnFrom":"#d4a843","btnTo":"#b8860b","isLight":true}'),
('2', 'មាសប្រណិត', 'គំរូប្រណិតពណ៌មាសខ្មៅ', 'luxury', true,
 '{"bg":"linear-gradient(135deg, #1a1a0e, #2d2a1e, #3d3520)","bgMain":"linear-gradient(180deg, #1a1a0e, #1e1e14)","cardFrom":"#2d2a1e","cardTo":"#1e1e14","textPri":"#fef3c7","textSec":"rgba(254,243,199,0.65)","textMut":"rgba(254,243,199,0.4)","accent":"#f59e0b","accentFill":"rgba(245,158,11,0.2)","accentBg":"rgba(245,158,11,0.05)","btnFrom":"#d97706","btnTo":"#92400e","isLight":false}'),
('3', 'ប្រពៃណីខ្មែរ', 'គំរូប្រពៃណីខ្មែរពណ៌ក្រហម', 'classic', false,
 '{"bg":"linear-gradient(135deg, #2e1a1a, #3e1616, #601010)","bgMain":"linear-gradient(180deg, #2e1a1a, #2e1414)","cardFrom":"#3e1616","cardTo":"#2e1414","textPri":"#fecaca","textSec":"rgba(254,202,202,0.65)","textMut":"rgba(254,202,202,0.4)","accent":"#ef4444","accentFill":"rgba(239,68,68,0.2)","accentBg":"rgba(239,68,68,0.05)","btnFrom":"#dc2626","btnTo":"#991b1b","isLight":false}'),
('4', 'សម័យទំនើប', 'គំរូសម័យទំនើបពណ៌ខៀវ', 'modern', false,
 '{"bg":"linear-gradient(135deg, #0e1a2e, #16213e, #1e3a5e)","bgMain":"linear-gradient(180deg, #0e1a2e, #0e1e34)","cardFrom":"#16213e","cardTo":"#0e1e34","textPri":"#bfdbfe","textSec":"rgba(191,219,254,0.65)","textMut":"rgba(191,219,254,0.4)","accent":"#3b82f6","accentFill":"rgba(59,130,246,0.2)","accentBg":"rgba(59,130,246,0.05)","btnFrom":"#2563eb","btnTo":"#1d4ed8","isLight":false}'),
('5', 'រាជវាំង', 'គំរូរាជវាំងពណ៌ម្យ៉ាងវិញ', 'luxury', true,
 '{"bg":"linear-gradient(135deg, #1a0e2e, #2e1640, #401060)","bgMain":"linear-gradient(180deg, #1a0e2e, #1e0e34)","cardFrom":"#2e1640","cardTo":"#1e0e34","textPri":"#ddd6fe","textSec":"rgba(221,214,254,0.65)","textMut":"rgba(221,214,254,0.4)","accent":"#a855f7","accentFill":"rgba(168,85,247,0.2)","accentBg":"rgba(168,85,247,0.05)","btnFrom":"#9333ea","btnTo":"#7e22ce","isLight":false}'),
('6', 'សួនច្បារ', 'គំរូសួនច្បារពណ៌បៃតង', 'modern', false,
 '{"bg":"linear-gradient(135deg, #0e2e1a, #163e21, #106030)","bgMain":"linear-gradient(180deg, #0e2e1a, #0e3420)","cardFrom":"#163e21","cardTo":"#0e3420","textPri":"#bbf7d0","textSec":"rgba(187,247,208,0.65)","textMut":"rgba(187,247,208,0.4)","accent":"#22c55e","accentFill":"rgba(34,197,94,0.2)","accentBg":"rgba(34,197,94,0.05)","btnFrom":"#16a34a","btnTo":"#15803d","isLight":false}'),
('7', 'ផ្កាឈូកពណ៌ស', 'គំរូពណ៌សទាន់សម័យ', 'classic', false,
 '{"bg":"linear-gradient(135deg, #1a1a1e, #2e2e32, #404045)","bgMain":"linear-gradient(180deg, #1a1a1e, #1e1e22)","cardFrom":"#2a2a30","cardTo":"#1a1a20","textPri":"#e2e8f0","textSec":"rgba(226,232,240,0.6)","textMut":"rgba(226,232,240,0.4)","accent":"#94a3b8","accentFill":"rgba(148,163,184,0.2)","accentBg":"rgba(148,163,184,0.05)","btnFrom":"#64748b","btnTo":"#475569","isLight":false}'),
('8', 'ភ្លើងបំភ្លឺ', 'គំរូភ្លើងបំភ្លឺពណ៌មាស', 'luxury', true,
 '{"bg":"linear-gradient(135deg, #2e1a0e, #402e16, #604010)","bgMain":"linear-gradient(180deg, #2e1a0e, #34200d)","cardFrom":"#4a2a1e","cardTo":"#3e1a0d","textPri":"#fde68a","textSec":"rgba(253,230,138,0.65)","textMut":"rgba(253,230,138,0.4)","accent":"#fbbf24","accentFill":"rgba(251,191,36,0.2)","accentBg":"rgba(251,191,36,0.05)","btnFrom":"#f59e0b","btnTo":"#d97706","isLight":false}'),
('9', 'ទឹកជ្រោះ', 'គំរូទឹកជ្រោះពណ៌ទឹកក្រូច', 'modern', false,
 '{"bg":"linear-gradient(135deg, #0e2e2e, #163e3e, #106060)","bgMain":"linear-gradient(180deg, #0e2e2e, #0e3434)","cardFrom":"#1e4a4a","cardTo":"#0d3e3e","textPri":"#a5f3fc","textSec":"rgba(165,243,252,0.65)","textMut":"rgba(165,243,252,0.4)","accent":"#06b6d4","accentFill":"rgba(6,182,212,0.2)","accentBg":"rgba(6,182,212,0.05)","btnFrom":"#0891b2","btnTo":"#0e7490","isLight":false}'),
('10', 'ពណ៌ផ្កាឈូក', 'គំរូពណ៌ផ្កាឈូកប្រណិត', 'luxury', true,
 '{"bg":"linear-gradient(135deg, #2e0e2e, #401640, #601060)","bgMain":"linear-gradient(180deg, #2e0e2e, #340e34)","cardFrom":"#4a1e4a","cardTo":"#3e0d3e","textPri":"#f5d0fe","textSec":"rgba(245,208,254,0.65)","textMut":"rgba(245,208,254,0.4)","accent":"#d946ef","accentFill":"rgba(217,70,239,0.2)","accentBg":"rgba(217,70,239,0.05)","btnFrom":"#c026d3","btnTo":"#a21caf","isLight":false}'),
('11', 'បុរាណ', 'គំរូបុរាណខ្មែរ', 'classic', false,
 '{"bg":"linear-gradient(135deg, #2e1a0e, #3e2e16, #504010)","bgMain":"linear-gradient(180deg, #2e1a0e, #3e2a0d)","cardFrom":"#4a3a1e","cardTo":"#3e2a0d","textPri":"#fde68a","textSec":"rgba(253,230,138,0.65)","textMut":"rgba(253,230,138,0.4)","accent":"#d97706","accentFill":"rgba(217,119,6,0.2)","accentBg":"rgba(217,119,6,0.05)","btnFrom":"#b45309","btnTo":"#92400e","isLight":false}'),
('12', 'ទំនើប', 'គំរូទំនើបពណ៌ប្រផេះ', 'modern', false,
 '{"bg":"linear-gradient(135deg, #1a1a1e, #2e2e32, #3e3e42)","bgMain":"linear-gradient(180deg, #1a1a1e, #1a1a20)","cardFrom":"#2a2a30","cardTo":"#1a1a20","textPri":"#e5e7eb","textSec":"rgba(229,231,235,0.6)","textMut":"rgba(229,231,235,0.4)","accent":"#9ca3af","accentFill":"rgba(156,163,175,0.2)","accentBg":"rgba(156,163,175,0.05)","btnFrom":"#6b7280","btnTo":"#4b5563","isLight":false}');

-- ===== 011_fix_wishes_insert.sql =====
-- Fix: FOR ALL policy blocked anonymous wish inserts
-- (WITH CHECK defaults to USING which requires auth.uid() - fails for anonymous)

DROP POLICY IF EXISTS "Users can manage wishes for own invitations" ON wishes;

CREATE POLICY "Owners can update wishes" ON wishes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

CREATE POLICY "Owners can delete wishes" ON wishes FOR DELETE USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

-- ===== 012_payway_orders.sql =====
-- 012: Allow 'payway' as payment_method on orders (ABA PayWay integration)
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'orders'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%payment_method%';
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('khqr', 'receipt_upload', 'payway'));

-- ===== 013_guest_share_codes.sql =====
-- 013: Short share codes for guest invite links (/g/{code})
ALTER TABLE guests ADD COLUMN IF NOT EXISTS share_code TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_guests_share_code ON guests (share_code);

-- ===== 014_invitation_types.sql =====
-- Support multiple ceremony types (wedding, birthday, ...)
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'wedding';

-- ===== 015_template_13_pink.sql =====
-- Template 13 "ផ្លូវការ" — luxury official, cute pink Khmer palette
INSERT INTO templates (code, name, description, category, is_premium, config)
VALUES (
  '13',
  'ផ្លូវការ',
  'លិខិតអញ្ជើញផ្លូវការ ពណ៌ផ្កាឈូកបែបខ្មែរ ជាមួយ sparkle ភ្លីភ្លែត និងការតាក់តែងប្រណិត',
  'luxury',
  true,
  '{"bg":"linear-gradient(180deg, #fff5f8 0%, #ffe4ed 50%, #f9c2d4 100%)","bgMain":"linear-gradient(180deg, #fff5f8 0%, #ffe9f1 100%)","cardFrom":"#ffffff","cardTo":"#ffe4ed","textPri":"#7c3a50","textSec":"rgba(124,58,80,0.7)","textMut":"rgba(124,58,80,0.45)","accent":"#db2777","accentFill":"rgba(219,39,119,0.16)","accentBg":"rgba(219,39,119,0.06)","btnFrom":"#f472b6","btnTo":"#be185d","isLight":true}'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_premium = EXCLUDED.is_premium,
  config = EXCLUDED.config;

