"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, Lock, ArrowRight, Heart } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ");
      setLoading(false);
      return;
    }
    if (data.user) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single();
      if (profile?.role !== "admin") {
        setError("គណនីនេះមិនមែនជា Admin");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary via-secondary/95 to-secondary px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-white/50 mt-1">គ្រប់គ្រង Platform</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-gold-100">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center border border-red-100">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" /> អ៊ីមែល
            </label>
            <Input type="email" placeholder="admin@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-11 border-gold-200" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" /> ពាក្យសម្ងាត់
            </label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-11 border-gold-200" />
          </div>

          <Button type="submit" className="w-full bg-gold-gradient text-white hover:opacity-90 h-11 rounded-xl" disabled={loading}>
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
            {loading ? "កំពុងចូល..." : "ចូល Admin"}
          </Button>
        </form>

        <Link href="/login" className="block">
          <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-10 text-sm">
            ← ត្រឡប់ទៅ ចូលគណនីអតិថជន
          </Button>
        </Link>

        <p className="text-center text-xs text-white/30">
          <Link href="/" className="hover:text-white/50 inline-flex items-center gap-1"><Heart className="h-3 w-3" /> E-Wedding</Link>
        </p>
      </div>
    </div>
  );
}
