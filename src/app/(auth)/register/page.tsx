"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { normalizeKhmerPhone, phoneToEmail } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTemplateId(params.get("template"));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalized = normalizeKhmerPhone(phone);
    if (!normalized) {
      setError("លេខទូរស័ព្ទមិនត្រឹមត្រូវ។ ឧទាហរណ៍៖ 011 234 567");
      return;
    }
    if (password !== confirmPassword) {
      setError("ពាក្យសម្ងាត់មិនដូចគ្នាទេ");
      return;
    }
    if (password.length < 6) {
      setError("ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ");
      return;
    }

    setLoading(true);

    const syntheticEmail = phoneToEmail(normalized);
    const { error: signUpError } = await supabase.auth.signUp({
      email: syntheticEmail,
      password,
      options: { data: { full_name: fullName, phone: normalized } },
    });

    if (signUpError) {
      const msg = signUpError.message.includes("already registered")
        ? "លេខទូរស័ព្ទនេះមានគណនីរួចហើយ"
        : "បង្កើតគណនីមិនបានជោគជ័យ សូមព្យាយាមម្តងទៀត";
      setError(msg);
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });
    if (signInError) {
      router.push(templateId ? `/login?template=${templateId}` : "/login");
      return;
    }

    if (templateId) {
      localStorage.setItem("pendingTemplateId", templateId);
    }
    router.push("/invitations");
    router.refresh();
  };

  const handleGoogleRegister = async () => {
    if (templateId) {
      localStorage.setItem("pendingTemplateId", templateId);
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="w-full space-y-5">
        <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4 border border-gold-100">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center border border-red-100">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> ឈ្មោះពេញ
            </label>
            <Input placeholder="ឈ្មោះពេញរបស់អ្នក" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="rounded-xl h-11 border-gold-200" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" /> លេខទូរស័ព្ទ
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">+855</span>
              <Input type="tel" inputMode="numeric" placeholder="011 234 567" value={phone} onChange={(e) => setPhone(e.target.value)} required className="rounded-xl h-11 border-gold-200 pl-14" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" /> ពាក្យសម្ងាត់
            </label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="យ៉ាងតិច 6 តួអក្សរ" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-xl h-11 border-gold-200 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" /> បញ្ជាក់ពាក្យសម្ងាត់
            </label>
            <div className="relative">
              <Input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="rounded-xl h-11 border-gold-200 pr-10" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gold-gradient text-white hover:opacity-90 h-11 rounded-xl" disabled={loading}>
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
            {loading ? "កំពុងបង្កើត..." : "បង្កើតគណនី"}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">ពេលបង្កើតគណនី អ្នកយល់ព្រមលក្ខខណ្ឌប្រើប្រាស់របស់យើង</p>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gold-100" /></div>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-gold-50/60 to-white px-3 text-xs text-muted-foreground">ឬ</span>
        </div>

        <Button variant="outline" className="w-full border-gold-200 text-secondary hover:bg-gold-50 rounded-xl h-11" onClick={handleGoogleRegister}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          ចុះឈ្មោះជាមួយ Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          មានគណនីរួចហើយ?{" "}
          <Link href={templateId ? `/login?template=${templateId}` : "/login"} className="text-primary hover:underline font-semibold">
            ចូល
          </Link>
        </p>
    </div>
  );
}
