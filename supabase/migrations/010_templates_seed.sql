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
