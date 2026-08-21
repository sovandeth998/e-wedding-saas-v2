"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTemplateId(params.get("template"));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("ពាក្យសម្ងាត់មិនដូចគ្នាទេ");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("បង្កើតគណនីជោគជ័យ! សូមពិនិត្យអ៊ីមែលរបស់អ្នក។");
    if (templateId) {
      localStorage.setItem("pendingTemplateId", templateId);
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-secondary">បង្កើតគណនី</CardTitle>
        <CardDescription>ចាប់ផ្ដើមបង្កើតលិខិតអញ្ជើញដ៏ស្អាត</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md">{success}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-secondary font-medium">ឈ្មោះពេញ</Label>
            <Input
              id="fullName"
              placeholder="ឈ្មោះពេញរបស់អ្នក"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="border-gold-200 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-secondary font-medium">អ៊ីមែល</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-secondary font-medium">បញ្ជាក់ពាក្យសម្ងាត់</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-gold-200 focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full bg-gold-gradient text-white hover:opacity-90" disabled={loading}>
            {loading ? "កំពុងបង្កើត..." : "បង្កើតគណនី"}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            ឬ
          </span>
        </div>

        <Button variant="outline" className="w-full border-gold-200 text-secondary hover:bg-gold-50" onClick={handleGoogleRegister}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          ចុះឈ្មោះជាមួយ Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          មានគណនីរួចហើយ?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            ចូល
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
