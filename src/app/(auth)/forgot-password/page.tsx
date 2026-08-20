"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-secondary">ភ្លេចពាក្យសម្ងាត់</CardTitle>
        <CardDescription>បញ្ចូលអ៊ីមែលដើម្បីទទួល Link កំណត់ពាក្យសម្ងាត់ថ្មី</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md">
              សូមពិនិត្យអ៊ីមែលរបស់អ្នកសម្រាប់ Link កំណត់ពាក្យសម្ងាត់ថ្មី។
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full gap-2 border-gold-200 text-secondary hover:bg-gold-50">
                <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅចូល
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>
            )}
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
            <Button type="submit" className="w-full bg-gold-gradient text-white hover:opacity-90" disabled={loading}>
              {loading ? "កំពុងផ្ញើ..." : "ផ្ញើ Link កំណត់ពាក្យសម្ងាត់"}
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full gap-2 text-primary">
                <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅចូល
              </Button>
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
