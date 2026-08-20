"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Save, Check, Image, CreditCard } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["owner_bank_name", "owner_account_name", "owner_account_number", "owner_khqr_image"]);

      if (data) {
        data.forEach((row) => {
          if (row.key === "owner_bank_name" && row.value) setBankName(row.value);
          if (row.key === "owner_account_name" && row.value) setAccountName(row.value);
          if (row.key === "owner_account_number" && row.value) setAccountNumber(row.value);
          if (row.key === "owner_khqr_image" && row.value) {
            setQrImage(row.value);
            setQrPreview(row.value);
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
    ];

    for (const setting of settings) {
      await supabase
        .from("platform_settings")
        .upsert({ key: setting.key, value: setting.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
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
