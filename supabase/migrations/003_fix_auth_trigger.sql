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
