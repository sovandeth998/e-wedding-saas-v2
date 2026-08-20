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
