"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Check, Image, CreditCard, Globe, Mail, Palette, MessageCircle, DollarSign, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Package {
  id: string;
  name: string;
  name_kh: string;
  price: number;
  currency: string;
  features: string[];
  duration_days: number;
  is_popular: boolean;
}

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [bankName, setBankName] = useState("ABA Bank");
  const [accountName, setAccountName] = useState("MENSOANDETH");
  const [accountNumber, setAccountNumber] = useState("070866998");
  const [qrImage, setQrImage] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrStdImage, setQrStdImage] = useState("");
  const [qrStdPreview, setQrStdPreview] = useState("");
  const [qrStdFile, setQrStdFile] = useState<File | null>(null);
  const [qrVipImage, setQrVipImage] = useState("");
  const [qrVipPreview, setQrVipPreview] = useState("");
  const [qrVipFile, setQrVipFile] = useState<File | null>(null);

  const [siteName, setSiteName] = useState("E-Wedding");
  const [siteDescription, setSiteDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [telegramLink, setTelegramLink] = useState("");

  const [logoImage, setLogoImage] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [telegramGroupUrl, setTelegramGroupUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#b8860b");
  const [secondaryColor, setSecondaryColor] = useState("#1a1a2e");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  const [packages, setPackages] = useState<Package[]>([]);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLInputElement>(null);
  const qrStdRef = useRef<HTMLInputElement>(null);
  const qrVipRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value");

      if (data) {
        data.forEach((row) => {
          const val = row.value ?? "";
          switch (row.key) {
            case "owner_bank_name": setBankName(val); break;
            case "owner_account_name": setAccountName(val); break;
            case "owner_account_number": setAccountNumber(val); break;
            case "owner_khqr_image": setQrImage(val); setQrPreview(val); break;
            case "owner_khqr_image_standard": setQrStdImage(val); setQrStdPreview(val); break;
            case "owner_khqr_image_vip": setQrVipImage(val); setQrVipPreview(val); break;
            case "site_name": setSiteName(val || "E-Wedding"); break;
            case "site_description": setSiteDescription(val); break;
            case "contact_email": setContactEmail(val); break;
            case "contact_phone": setContactPhone(val); break;
            case "telegram_link": setTelegramLink(val); break;
            case "site_logo_url": setLogoImage(val); setLogoPreview(val); break;
            case "facebook_url": setFacebookUrl(val); break;
            case "instagram_url": setInstagramUrl(val); break;
            case "telegram_group_url": setTelegramGroupUrl(val); break;
            case "telegram_url": setTelegramUrl(val); break;
            case "phone": setPhoneNumber(val); break;
            case "primary_color": setPrimaryColor(val || "#b8860b"); break;
            case "secondary_color": setSecondaryColor(val || "#1a1a2e"); break;
            case "background_color": setBackgroundColor(val || "#ffffff"); break;
            case "telegram_bot_token": setTelegramBotToken(val); break;
            case "telegram_chat_id": setTelegramChatId(val); break;
          }
        });
      }

      const { data: pkgs } = await supabase
        .from("packages")
        .select("*")
        .order("price", { ascending: true });

      if (pkgs) setPackages(pkgs);

      setLoading(false);
    })();
  }, [user]);

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setQrPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleQrStdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrStdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setQrStdPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleQrVipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrVipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setQrVipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const { data } = await supabase.storage.from("uploads").upload(path, file);
    if (data) {
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(data.path);
      return urlData.publicUrl;
    }
    return null;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let qrUrl = qrImage;
    if (qrFile) {
      const uploaded = await uploadImage(qrFile, `platform/qr-${Date.now()}.png`);
      if (uploaded) { qrUrl = uploaded; setQrImage(qrUrl); }
    }

    let qrStdUrl = qrStdImage;
    if (qrStdFile) {
      const uploaded = await uploadImage(qrStdFile, `platform/qr-std-${Date.now()}.png`);
      if (uploaded) { qrStdUrl = uploaded; setQrStdImage(qrStdUrl); }
    }

    let qrVipUrl = qrVipImage;
    if (qrVipFile) {
      const uploaded = await uploadImage(qrVipFile, `platform/qr-vip-${Date.now()}.png`);
      if (uploaded) { qrVipUrl = uploaded; setQrVipImage(qrVipUrl); }
    }

    let logoUrl = logoImage;
    if (logoFile) {
      const uploaded = await uploadImage(logoFile, `platform/logo-${Date.now()}.png`);
      if (uploaded) { logoUrl = uploaded; setLogoImage(logoUrl); }
    }

    const settings = [
      { key: "owner_bank_name", value: bankName },
      { key: "owner_account_name", value: accountName },
      { key: "owner_account_number", value: accountNumber },
      { key: "owner_khqr_image", value: qrUrl },
      { key: "owner_khqr_image_standard", value: qrStdUrl },
      { key: "owner_khqr_image_vip", value: qrVipUrl },
      { key: "site_name", value: siteName },
      { key: "site_description", value: siteDescription },
      { key: "contact_email", value: contactEmail },
      { key: "contact_phone", value: contactPhone },
      { key: "telegram_link", value: telegramLink },
      { key: "site_logo_url", value: logoUrl },
      { key: "facebook_url", value: facebookUrl },
      { key: "instagram_url", value: instagramUrl },
      { key: "telegram_group_url", value: telegramGroupUrl },
      { key: "telegram_url", value: telegramUrl },
      { key: "phone", value: phoneNumber },
      { key: "primary_color", value: primaryColor },
      { key: "secondary_color", value: secondaryColor },
      { key: "background_color", value: backgroundColor },
      { key: "telegram_bot_token", value: telegramBotToken },
      { key: "telegram_chat_id", value: telegramChatId },
    ];

    for (const s of settings) {
      await supabase
        .from("platform_settings")
        .upsert({ key: s.key, value: s.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }

    setSaving(false);
    setSaved(true);
    toast.success("បានរក្សាទុកការកំណត់!");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePackage = async () => {
    if (!editingPkg) return;
    await supabase
      .from("packages")
      .update({
        name_kh: editingPkg.name_kh,
        price: editingPkg.price,
        features: editingPkg.features,
        duration_days: editingPkg.duration_days,
        is_popular: editingPkg.is_popular,
      })
      .eq("id", editingPkg.id);

    setPackages((prev) => prev.map((p) => (p.id === editingPkg.id ? editingPkg : p)));
    setEditingPkg(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-secondary">ការកំណត់ Platform</h1>
        <p className="text-muted-foreground">គ្រប់គ្រងព័ត៌មានទាំងអស់នៅលើ Website</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <CreditCard className="h-5 w-5 text-primary" />
            ព័ត៌មានធនាគារ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-secondary">ធនាគារ</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="border-gold-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-secondary">ឈ្មោះគណនី</Label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="border-gold-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">លេខគណនី</Label>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="border-gold-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Image className="h-5 w-5 text-primary" />
            KHQR Code រូបភាព
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">បញ្ចូលរូបភាព KHQR Code របស់អ្នកដើម្បីឱ្យភ្ញៀវស្គេនបង់ប្រាក់</p>
          <input type="file" accept="image/*" onChange={handleQrChange} ref={qrRef} className="hidden" />
          {qrPreview ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border border-gold-200 shadow-md">
                  <img src={qrPreview} alt="KHQR" className="w-[260px] h-[260px] object-contain" />
                </div>
              </div>
              <Button variant="outline" className="w-full border-gold-200 text-secondary hover:bg-gold-50" onClick={() => qrRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> ផ្លាស់ប្តូររូបភាព
              </Button>
            </div>
          ) : (
            <button onClick={() => qrRef.current?.click()} className="w-full border-2 border-dashed border-gold-200 rounded-lg p-12 text-center hover:bg-gold-50/50 cursor-pointer transition-colors">
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">ចុចដើម្បីបញ្ចូលរូបភាព KHQR</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG រហូតដល់ 5MB</p>
            </button>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Image className="h-5 w-5 text-primary" />
            KHQR តាមកញ្ចប់ ($18 / $40)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ដាក់ QR ដោយឡែកសម្រាប់កញ្ចប់នីមួយៗ — បើទុកចំហេត វានឹងប្រើរូបខាងលើជំនួស
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "QR Standard ($18)", ref: qrStdRef, preview: qrStdPreview, onChange: handleQrStdChange, clear: () => { setQrStdPreview(""); setQrStdFile(null); setQrStdImage(""); } },
              { label: "QR VIP ($40)", ref: qrVipRef, preview: qrVipPreview, onChange: handleQrVipChange, clear: () => { setQrVipPreview(""); setQrVipFile(null); setQrVipImage(""); } },
            ].map((slot) => (
              <div key={slot.label} className="border border-gold-200 rounded-xl p-4 space-y-3 bg-gold-50/40">
                <p className="text-sm font-semibold text-secondary text-center">{slot.label}</p>
                <input type="file" accept="image/*" onChange={slot.onChange} ref={slot.ref} className="hidden" />
                {slot.preview ? (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="p-3 bg-white rounded-lg border border-gold-200 shadow-sm">
                        <img src={slot.preview} alt={slot.label} className="w-[180px] h-[180px] object-contain" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-gold-200 text-secondary hover:bg-gold-50" onClick={() => slot.ref.current?.click()}>
                        <Upload className="h-3.5 w-3.5 mr-1" /> ផ្លាស់ប្តូរ
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50" onClick={slot.clear}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => slot.ref.current?.click()} className="w-full border-2 border-dashed border-gold-200 rounded-lg p-8 text-center hover:bg-gold-50/50 cursor-pointer transition-colors bg-white">
                    <Upload className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">ចុចដើម្បីបញ្ចូល QR</p>
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Image className="h-5 w-5 text-primary" />
            Logo Site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="image/*" onChange={handleLogoChange} ref={logoRef} className="hidden" />
          {logoPreview ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border border-gold-200 shadow-md">
                  <img src={logoPreview} alt="Logo" className="h-[100px] object-contain" />
                </div>
              </div>
              <Button variant="outline" className="w-full border-gold-200 text-secondary hover:bg-gold-50" onClick={() => logoRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> ផ្លាស់ប្តូរ Logo
              </Button>
            </div>
          ) : (
            <button onClick={() => logoRef.current?.click()} className="w-full border-2 border-dashed border-gold-200 rounded-lg p-8 text-center hover:bg-gold-50/50 cursor-pointer transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">ចុចដើម្បីបញ្ចូល Logo</p>
            </button>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Globe className="h-5 w-5 text-primary" />
            ការកំណត់ Site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-secondary">ឈ្មោះ Site</Label>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="border-gold-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">ការពិពណ៌នា Site</Label>
            <Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} className="border-gold-200" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-secondary">អ៊ីមែលទំនាក់ទំនង</Label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="border-gold-200" placeholder="example@email.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-secondary">លេខទូរស័ព្ទទំនាក់ទំនង</Label>
              <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="border-gold-200" placeholder="012 345 678" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">តំណភ្ជាប់ Telegram</Label>
            <Input value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} className="border-gold-200" placeholder="https://t.me/..." />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Globe className="h-5 w-5 text-primary" />
            Social Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-secondary">Facebook URL</Label>
            <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} className="border-gold-200" placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">Instagram URL</Label>
            <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="border-gold-200" placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">Telegram Group URL</Label>
            <Input value={telegramGroupUrl} onChange={(e) => setTelegramGroupUrl(e.target.value)} className="border-gold-200" placeholder="https://t.me/..." />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">Telegram URL</Label>
            <Input value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} className="border-gold-200" placeholder="https://t.me/..." />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">លេខទូរស័ព្ទ</Label>
            <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="border-gold-200" placeholder="012 345 678" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Palette className="h-5 w-5 text-primary" />
            ពណ៌ Site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-secondary">ពណ៌ Primary</Label>
              <div className="flex gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-10 rounded border border-gold-200 cursor-pointer" />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="border-gold-200 font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-secondary">ពណ៌ Secondary</Label>
              <div className="flex gap-2">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 w-10 rounded border border-gold-200 cursor-pointer" />
                <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="border-gold-200 font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-secondary">ពណ៌ផ្ទៃខាងក្រោយ</Label>
              <div className="flex gap-2">
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-10 w-10 rounded border border-gold-200 cursor-pointer" />
                <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="border-gold-200 font-mono" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">មើលសាកល្បងពណ៌</Label>
            <div className="rounded-lg border border-gold-200 overflow-hidden shadow-sm" style={{ backgroundColor: backgroundColor }}>
              <div className="p-4 flex items-center justify-between gap-3">
                <span className="font-bold text-lg" style={{ color: primaryColor }}>E-Wedding</span>
                <span className="px-4 py-1.5 rounded-full text-white text-sm font-medium" style={{ backgroundColor: secondaryColor }}>ប៊ូតុង</span>
              </div>
              <div className="flex h-8">
                <div className="flex-1" style={{ backgroundColor: primaryColor }} />
                <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
                <div className="flex-1 border-t border-gold-200" style={{ backgroundColor: backgroundColor }} />
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-gold-50 border border-gold-200 p-3">
            <p className="text-sm text-secondary">ពណ៌នឹងត្រូវបានអនុវត្តនៅពេល Restart Site</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <MessageCircle className="h-5 w-5 text-primary" />
            Telegram Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-secondary">Bot Token</Label>
            <Input value={telegramBotToken} onChange={(e) => setTelegramBotToken(e.target.value)} className="border-gold-200 font-mono" placeholder="123456:ABC-DEF..." />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">Chat ID</Label>
            <Input value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} className="border-gold-200 font-mono" placeholder="-1001234567890" />
          </div>
          <div className="rounded-lg bg-gold-50 border border-gold-200 p-3">
            <p className="text-sm text-secondary">Bot Token និង Chat ID ត្រូវបានរក្សាទុកនៅក្នុង Environment Variables សម្រាប់សុវត្ថិភាព</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-secondary">
            <DollarSign className="h-5 w-5 text-primary" />
            Pricing Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="border border-gold-200 rounded-lg p-4 space-y-3">
              {editingPkg?.id === pkg.id ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-secondary">ឈ្មោះ (KH)</Label>
                      <Input value={editingPkg.name_kh} onChange={(e) => setEditingPkg({ ...editingPkg, name_kh: e.target.value })} className="border-gold-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-secondary">តម្លៃ ($)</Label>
                      <Input type="number" value={editingPkg.price} onChange={(e) => setEditingPkg({ ...editingPkg, price: Number(e.target.value) })} className="border-gold-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-secondary">រយៈពេល (ថ្ងៃ)</Label>
                      <Input type="number" value={editingPkg.duration_days} onChange={(e) => setEditingPkg({ ...editingPkg, duration_days: Number(e.target.value) })} className="border-gold-200" />
                    </div>
                    <div className="space-y-1 flex items-end">
                      <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                        <input type="checkbox" checked={editingPkg.is_popular} onChange={(e) => setEditingPkg({ ...editingPkg, is_popular: e.target.checked })} className="rounded" />
                        Popular
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-secondary">Features (មួយជួរក្នុងមួយ)</Label>
                    <Textarea
                      value={editingPkg.features.join("\n")}
                      onChange={(e) => setEditingPkg({ ...editingPkg, features: e.target.value.split("\n").filter(Boolean) })}
                      className="border-gold-200"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gold-gradient text-white" onClick={handleSavePackage}>
                      <Check className="h-4 w-4 mr-1" /> រក្សាទុក
                    </Button>
                    <Button size="sm" variant="outline" className="border-gold-200" onClick={() => setEditingPkg(null)}>
                      បោះបង់
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-secondary">{pkg.name_kh || pkg.name}</span>
                      {pkg.is_popular && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Popular</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">${pkg.price} / {pkg.duration_days}ថ្ងៃ</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-gold-200 text-secondary hover:bg-gold-50" onClick={() => setEditingPkg(pkg)}>
                    កែប្រែ
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full bg-gold-gradient text-white hover:opacity-90 h-12 text-lg" onClick={handleSave} disabled={saving}>
        {saving ? (
          "កំពុងរក្សាទុក..."
        ) : saved ? (
          <><Check className="h-5 w-5 mr-2" /> បានរក្សាទុក!</>
        ) : (
          <><Save className="h-5 w-5 mr-2" /> រក្សាទុកការកំណត់ទាំងអស់</>
        )}
      </Button>
    </div>
  );
}
