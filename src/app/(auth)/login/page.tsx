"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Mail, Lock, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gold-50/30 to-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg">
            <Heart className="h-7 w-7 text-white fill-white" />
          </div>
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary">E-Wedding</h1>
          <p className="text-sm text-muted-foreground mt-1">បង្កើតលិខិតអញ្ជើញដ៏ស្អាត</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-gold-100">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center border border-red-100">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" /> អ៊ីមែល
            </label>
            <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-11 border-gold-200" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" /> ពាក្យសម្ងាត់
            </label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-11 border-gold-200" />
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">ភ្លេចពាក្យសម្ងាត់?</Link>
          </div>

          <Button type="submit" className="w-full bg-gold-gradient text-white hover:opacity-90 h-11 rounded-xl" disabled={loading}>
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
            {loading ? "កំពុងចូល..." : "ចូល"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          មិនទាន់មានគណនី? <Link href="/register" className="text-primary hover:underline font-semibold">ចុះឈ្មោះ</Link>
        </p>

        <Link href="/admin/login" className="block">
          <Button variant="outline" className="w-full border-gold-200 text-secondary hover:bg-gold-50 rounded-xl h-10 text-sm">
            <Shield className="h-4 w-4 mr-2" /> ចូល Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
