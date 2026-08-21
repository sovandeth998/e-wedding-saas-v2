"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Trash2, Save, Check, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    (async () => {
      const { data } = await supabase
        .from("users")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
    })();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: fullName, phone })
        .eq("id", user.id);

      if (error) throw error;
      setProfileMessage({ type: "success", text: "បច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួនជោគជ័យ!" });
    } catch {
      setProfileMessage({ type: "error", text: "មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព។ សូមព្យាយាមម្តងទៀត។" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៦ តួអក្សរ។" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់មិនត្រូវគ្នាទេ។" });
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "ផ្លាស់ប្តូរពាក្យសម្ងាត់ជោគជ័យ!" });
    } catch {
      setPasswordMessage({ type: "error", text: "មានបញ្ហាក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់។ សូមព្យាយាមម្តងទៀត។" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      await supabase.from("users").delete().eq("id", user.id);
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-4 border-gold-200 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-secondary">គណនីរបស់ខ្ញុំ</h1>
        <p className="text-muted-foreground">គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងសុវត្ថិភាពគណនី</p>
      </div>

      <Card className="border-gold-200 shadow-md">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-secondary">ព័ត៌មានផ្ទាល់ខ្លួន</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                profileMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {profileMessage.type === "success" ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              {profileMessage.text}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-secondary font-medium">ឈ្មោះពេញ</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="បញ្ចូលឈ្មោះពេញរបស់អ្នក"
              className="border-gold-200 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-secondary font-medium">លេខទូរស័ព្ទ</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="បញ្ចូលលេខទូរស័ព្ទរបស់អ្នក"
              className="border-gold-200 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-secondary font-medium">អ៊ីមែល</Label>
            <Input
              id="email"
              value={email}
              readOnly
              disabled
              className="bg-gold-50 border-gold-200 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">អ៊ីមែលមិនអាចកែប្រែបានទេ</p>
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={savingProfile}
            className="gap-2 bg-gold-gradient text-white hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? "កំពុងរក្សាទុក..." : "រក្សាទុកការផ្លាស់ប្តូរ"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-gold-200 shadow-md">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-secondary">ផ្លាស់ប្តូរពាក្យសម្ងាត់</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                passwordMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              {passwordMessage.text}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-secondary font-medium">ពាក្យសម្ងាត់បច្ចុប្បន្ន</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
              className="border-gold-200 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-secondary font-medium">ពាក្យសម្ងាត់ថ្មី</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
              className="border-gold-200 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-secondary font-medium">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
              className="border-gold-200 focus-visible:ring-primary"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="gap-2 bg-gold-gradient text-white hover:opacity-90"
          >
            <Lock className="h-4 w-4" />
            {savingPassword ? "កំពុងផ្លាស់ប្តូរ..." : "ផ្លាស់ប្តូរពាក្យសម្ងាត់"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 shadow-md">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <CardTitle className="text-red-600">លុបគណនី</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ការលុបគណនីនឹងលុបលិខិតអញ្ជើញ និងទិន្នន័យទាំងអស់របស់អ្នកជាអចិន្ត្រៃយ៍។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
          </p>
          {deleteOpen ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">
                  តើអ្នកពិតជាចង់លុបគណនីរបស់អ្នកមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ!
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                >
                  បោះបង់
                </Button>
                <Button
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "កំពុងលុប..." : "បាទ/ចាស លុបគណនី"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              លុបគណនី
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
