"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, Crown, Plus, CreditCard, Clock, UserCheck, UserX } from "lucide-react";
import { StatsSkeleton } from "@/components/skeleton-loader";

interface RsvpRow {
  id: string;
  status: string;
  number_of_guests: number;
  message: string | null;
  created_at: string;
  guest: { name: string } | { name: string }[] | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [invitationCount, setInvitationCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [attendingCount, setAttendingCount] = useState(0);
  const [notAttendingCount, setNotAttendingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [packageName, setPackageName] = useState<string | null>(null);
  const [recentRsvps, setRecentRsvps] = useState<RsvpRow[]>([]);
  const [firstInvitationId, setFirstInvitationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data: invitations } = await supabase.from("invitations").select("id, groom_name_kh, groom_name, bride_name_kh, bride_name").eq("user_id", user.id);
      const invitationIds = invitations?.map((i) => i.id) || [];
      setInvitationCount(invitationIds.length);
      if (invitationIds.length > 0) setFirstInvitationId(invitationIds[0]);

      if (invitationIds.length > 0) {
        const { count: gCount } = await supabase
          .from("guests")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", invitationIds);
        const { count: rCount } = await supabase
          .from("rsvps")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", invitationIds);
        const { count: aCount } = await supabase
          .from("rsvps")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", invitationIds)
          .eq("status", "attending");
        const { count: nCount } = await supabase
          .from("rsvps")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", invitationIds)
          .eq("status", "not_attending");
        const { count: pCount } = await supabase
          .from("rsvps")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", invitationIds)
          .eq("status", "pending");

        setGuestCount(gCount || 0);
        setRsvpCount(rCount || 0);
        setAttendingCount(aCount || 0);
        setNotAttendingCount(nCount || 0);
        setPendingCount(pCount || 0);

        const { data: rsvpsData } = await supabase
          .from("rsvps")
          .select("id, status, number_of_guests, message, created_at, guest:guests(name)")
          .in("invitation_id", invitationIds)
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentRsvps(rsvpsData || []);
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
    { label: "ភ្ញៀវសរុប", value: String(guestCount), icon: Users },
    { label: "RSVP សរុប", value: String(rsvpCount), icon: CheckCircle },
    { label: "ស្ថានភាព", value: packageName || "ឥតគិតថ្លៃ", icon: Crown },
  ];

  const rsvpStatus: Record<string, { label: string; color: string; bg: string }> = {
    attending: { label: "ចូលរួម", color: "text-green-700", bg: "bg-green-100" },
    not_attending: { label: "មិនចូលរួម", color: "text-red-700", bg: "bg-red-100" },
    pending: { label: "រង់ចាំ", color: "text-yellow-700", bg: "bg-yellow-100" },
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-secondary flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              RSVP ស្ថិតិ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">ចូលរួម</span>
              </div>
              <span className="text-lg font-bold text-green-700">{attendingCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">មិនចូលរួម</span>
              </div>
              <span className="text-lg font-bold text-red-700">{notAttendingCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">រង់ចាំ</span>
              </div>
              <span className="text-lg font-bold text-yellow-700">{pendingCount}</span>
            </div>
            {rsvpCount > 0 && (
              <div className="pt-2 border-t border-gold-200">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gold-gradient h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min((attendingCount / rsvpCount) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {rsvpCount > 0 ? Math.round((attendingCount / rsvpCount) * 100) : 0}% នឹងចូលរួម
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-secondary flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              RSVP ថ្មីៗ
            </CardTitle>
            {firstInvitationId && (
              <Link href={`/guests/${firstInvitationId}`}>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-gold-50">
                  មើលទាំងអស់
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentRsvps.length > 0 ? (
              <div className="space-y-3">
                {recentRsvps.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between p-3 bg-gold-50/50 rounded-xl border border-gold-200/50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gold-gradient flex items-center justify-center text-white text-sm font-bold">
                        {(Array.isArray(rsvp.guest) ? rsvp.guest[0]?.name : rsvp.guest?.name || "ភ្ញៀវ").charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-secondary text-sm">{Array.isArray(rsvp.guest) ? rsvp.guest[0]?.name : rsvp.guest?.name || "ភ្ញៀវ"}</p>
                        <p className="text-xs text-muted-foreground">លិខិតអញ្ជើញ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {rsvp.number_of_guests > 1 && (
                        <span className="text-xs text-muted-foreground">+{rsvp.number_of_guests - 1} នាក់</span>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rsvpStatus[rsvp.status]?.bg} ${rsvpStatus[rsvp.status]?.color}`}>
                        {rsvpStatus[rsvp.status]?.label || rsvp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">មិនទាន់មាន RSVP</p>
                <p className="text-xs text-muted-foreground mt-1">ភ្ញៀវនឹង RSVP នៅពេលពួកគេចុច Link</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
          <Link href={firstInvitationId ? `/guests/${firstInvitationId}` : "/guests"}>
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
