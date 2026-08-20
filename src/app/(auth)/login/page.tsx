"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, LogIn, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-gold-50/30 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-secondary mt-4">E-Wedding</h1>
          <p className="text-sm text-muted-foreground mt-1">បង្កើតលិខិតអញ្ជើញដ៏ស្អាត</p>
        </div>

        <Card className="border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-gold-50 flex items-center justify-center">
                <LogIn className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-secondary">ចូលគណនី</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-secondary text-sm font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> អ៊ីមែល
                </Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gold-200 rounded-xl h-11 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-secondary text-sm font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> ពាក្យសម្ងាត់
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gold-200 rounded-xl h-11 focus-visible:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  ភ្លេចពាក្យសម្ងាត់?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-gold-gradient text-white hover:opacity-90 h-11 rounded-xl font-medium" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {loading ? "កំពុងចូល..." : "ចូល"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            មិនទាន់មានគណនី?{" "}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              ចុះឈ្មោះ
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gold-200/50" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-muted-foreground">ឬ</span></div>
          </div>

          <Link href="/admin/login">
            <Button variant="outline" className="w-full border-gold-200 text-secondary hover:bg-gold-50 rounded-xl h-10 text-sm">
              🔐 ចូល Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
