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
