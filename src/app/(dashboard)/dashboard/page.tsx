"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, Crown, Plus, CreditCard } from "lucide-react";
import { StatsSkeleton } from "@/components/skeleton-loader";

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [invitationCount, setInvitationCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [packageName, setPackageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data: invitations } = await supabase.from("invitations").select("id").eq("user_id", user.id);
      const invitationIds = invitations?.map((i) => i.id) || [];
      setInvitationCount(invitationIds.length);

      if (invitationIds.length > 0) {
        const { count: gCount } = await supabase
          .from("guests")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", invitationIds);
        const { count: rCount } = await supabase
          .from("rsvps")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", invitationIds);
        setGuestCount(gCount || 0);
        setRsvpCount(rCount || 0);
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, package:packages(name_kh)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      setPackageName(sub?.package?.name_kh || null);
      setLoading(false);
    })();
  }, [user]);

  const statCards = [
    { label: "លិខិតអញ្ជើញ", value: String(invitationCount), icon: FileText },
    { label: "ភ្ញៀវ", value: String(guestCount), icon: Users },
    { label: "RSVP", value: String(rsvpCount), icon: CheckCircle },
    { label: "ស្ថានភាព", value: packageName || "ឥតគិតថ្លៃ", icon: Crown },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">ស្វាគមន៍, {user?.email}!</h1>
        <p className="text-muted-foreground">នេះជាទិដ្ឋភាពទូទៅនៃការងាររបស់អ្នក</p>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gold-gradient flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-secondary">សកម្មភាពរហ័ស</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/invitations">
            <Button className="bg-gold-gradient text-white hover:opacity-90 rounded-xl h-11">
              <Plus className="h-4 w-4 mr-2" /> បង្កើតលិខិតអញ្ជើញថ្មី
            </Button>
          </Link>
          <Link href="/guests">
            <Button variant="outline" className="border-gold-200 text-primary hover:bg-gold-50 rounded-xl h-11">
              <Users className="h-4 w-4 mr-2" /> គ្រប់គ្រងភ្ញៀវ
            </Button>
          </Link>
          <Link href="/billing">
            <Button variant="outline" className="border-gold-200 text-primary hover:bg-gold-50 rounded-xl h-11">
              <CreditCard className="h-4 w-4 mr-2" /> ការទូទាត់
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
