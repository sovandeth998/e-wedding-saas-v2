"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Check, Image, CreditCard, Globe, Mail } from "lucide-react";

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [bankName, setBankName] = useState("ABA Bank");
  const [accountName, setAccountName] = useState("MENSOANDETH");
  const [accountNumber, setAccountNumber] = useState("070866998");
  const [qrImage, setQrImage] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);

  const [siteName, setSiteName] = useState("E-Wedding");
  const [siteDescription, setSiteDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [telegramLink, setTelegramLink] = useState("");

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

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
            case "owner_bank_name":
              setBankName(val);
              break;
            case "owner_account_name":
              setAccountName(val);
              break;
            case "owner_account_number":
              setAccountNumber(val);
              break;
            case "owner_khqr_image":
              setQrImage(val);
              setQrPreview(val);
              break;
            case "site_name":
              setSiteName(val || "E-Wedding");
              break;
            case "site_description":
              setSiteDescription(val);
              break;
            case "contact_email":
              setContactEmail(val);
              break;
            case "contact_phone":
              setContactPhone(val);
              break;
            case "telegram_link":
              setTelegramLink(val);
              break;
            case "smtp_host":
              setSmtpHost(val);
              break;
            case "smtp_port":
              setSmtpPort(val);
              break;
            case "smtp_user":
              setSmtpUser(val);
              break;
          }
        });
      }
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let qrUrl = qrImage;
    if (qrFile) {
      const fileName = `platform/qr-${Date.now()}.png`;
      const { data: uploadData } = await supabase.storage
        .from("uploads")
        .upload(fileName, qrFile);
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(uploadData.path);
        qrUrl = urlData.publicUrl;
        setQrImage(qrUrl);
      }
    }

    const settings = [
      { key: "owner_bank_name", value: bankName },
      { key: "owner_account_name", value: accountName },
      { key: "owner_account_number", value: accountNumber },
      { key: "owner_khqr_image", value: qrUrl },
      { key: "site_name", value: siteName },
      { key: "site_description", value: siteDescription },
      { key: "contact_email", value: contactEmail },
      { key: "contact_phone", value: contactPhone },
      { key: "telegram_link", value: telegramLink },
      { key: "smtp_host", value: smtpHost },
      { key: "smtp_port", value: smtpPort },
      { key: "smtp_user", value: smtpUser },
    ];

    for (const setting of settings) {
      await supabase
        .from("platform_settings")
        .upsert(
          { key: setting.key, value: setting.value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-secondary">ការកំណត់ Platform</h1>
        <p className="text-muted-foreground">គ្រប់គ្រងព័ត៌មាលម្ចាស់ និង KHQR Payment</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <CreditCard className="h-5 w-5 text-primary" />
            ព័ត៌មានធនាគារ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-secondary">ធនាគារ</Label>
            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="border-gold-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">ឈ្មោះគណនី</Label>
            <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="border-gold-200" />
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
          <p className="text-sm text-muted-foreground">
            បញ្ចូលរូបភាព KHQR Code របស់អ្នកដើម្បីឱ្យភ្ញៀវស្គេនបង់ប្រាក់
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleQrChange}
            ref={fileRef}
            className="hidden"
          />
          {qrPreview ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border border-gold-200 shadow-md">
                  <img src={qrPreview} alt="KHQR" className="w-[260px] h-[260px] object-contain" />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-gold-200 text-secondary hover:bg-gold-50"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" /> ផ្លាស់ប្តូររូបភាព
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gold-200 rounded-lg p-12 text-center hover:bg-gold-50/50 cursor-pointer transition-colors"
            >
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
            <Textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="border-gold-200"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">អ៊ីមែលទំនាក់ទំនង</Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="border-gold-200"
              placeholder="example@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">លេខទូរស័ព្ទទំនាក់ទំនង</Label>
            <Input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="border-gold-200"
              placeholder="012 345 678"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">តំណភ្ជាប់ Telegram</Label>
            <Input
              value={telegramLink}
              onChange={(e) => setTelegramLink(e.target.value)}
              className="border-gold-200"
              placeholder="https://t.me/..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Mail className="h-5 w-5 text-primary" />
            ការកំណត់ Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            កំណត់ SMTP សម្រាប់ផ្ញើអ៊ីមែលជូនដំណឹង
          </p>
          <div className="space-y-2">
            <Label className="text-secondary">SMTP Host</Label>
            <Input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="border-gold-200"
              placeholder="smtp.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">SMTP Port</Label>
            <Input
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="border-gold-200"
              placeholder="587"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary">SMTP User</Label>
            <Input
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="border-gold-200"
              placeholder="user@example.com"
            />
          </div>
          <div className="rounded-lg bg-gold-50 border border-gold-200 p-3">
            <p className="text-sm text-secondary">
              ព័ត៌មានសម្ងាត់ SMTP ត្រូវបានកំណត់តាមរយៈ Environment Variables នៅលើស៊ីវិរប្រព័ន្ធ។
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-gold-gradient text-white hover:opacity-90"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          "កំពុងរក្សាទុក..."
        ) : saved ? (
          <>
            <Check className="h-4 w-4 mr-2" /> បានរក្សាទុក!
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> រក្សាទុកការកំណត់
          </>
        )}
      </Button>
    </div>
  );
}
