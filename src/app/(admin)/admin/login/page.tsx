"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Heart, Lock } from "lucide-react";

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
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-gold-gradient flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-secondary flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Admin Panel
            </CardTitle>
            <CardDescription className="mt-1">
              សូមបំពេញព័ត៌មានដើម្បីចូល Admin
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center font-medium">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-secondary font-medium">អ៊ីមែល Admin</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gold-200 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-secondary font-medium">ពាក្យសម្ងាត់</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gold-200 focus-visible:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full bg-gold-gradient text-white hover:opacity-90 h-11 text-base" disabled={loading}>
              {loading ? "កំពុងចូល..." : "ចូល Admin"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← ចូលគណនីអតិថជន
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
