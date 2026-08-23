"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, Crown, Plus, CreditCard, Clock, UserCheck, UserX, ExternalLink, Heart, Sparkles, ChevronRight } from "lucide-react";
import { StatsSkeleton } from "@/components/skeleton-loader";
import type { Invitation } from "@/types/database";

interface RsvpRow {
  id: string;
  status: string;
  number_of_guests: number;
  message: string | null;
  created_at: string;
  guest: { name: string } | { name: string }[] | null;
}

const timeAgo = (d: string) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "អំពីពេលថ្មីង";
  if (s < 3600) return `អំពី ${Math.floor(s / 60)} នាទីមុន`;
  if (s < 86400) return `អំពី ${Math.floor(s / 3600)} ម៉ោងមុន`;
  return `អំពី ${Math.floor(s / 86400)} ថ្ងៃមុន`;
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "អរុណសួស្តី";
  if (h < 17) return "ទិវាសួស្តី";
  if (h < 20) return "សាយណ្ហសួស្តី";
  return "រាត្រីសួស្តី";
};

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [invitationCount, setInvitationCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [attendingCount, setAttendingCount] = useState(0);
  const [notAttendingCount, setNotAttendingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [packageName, setPackageName] = useState<string>("ឥតគិតថ្លៃ");
  const [recentRsvps, setRecentRsvps] = useState<RsvpRow[]>([]);
  const [firstInvitation, setFirstInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data: invitations } = await supabase
        .from("invitations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const invitationIds = invitations?.map((i) => i.id) || [];
      setInvitationCount(invitationIds.length);
      setPublishedCount(invitations?.filter((i) => i.status === "published").length || 0);
      if (invitationIds.length > 0 && invitations) setFirstInvitation(invitations[0]);

      if (invitationIds.length > 0) {
        const [{ count: gCount }, { count: rCount }, { count: aCount }, { count: nCount }, { count: pCount }] = await Promise.all([
          supabase.from("guests").select("*", { count: "exact", head: true }).in("invitation_id", invitationIds),
          supabase.from("rsvps").select("*", { count: "exact", head: true }).in("invitation_id", invitationIds),
          supabase.from("rsvps").select("*", { count: "exact", head: true }).in("invitation_id", invitationIds).eq("status", "attending"),
          supabase.from("rsvps").select("*", { count: "exact", head: true }).in("invitation_id", invitationIds).eq("status", "not_attending"),
          supabase.from("rsvps").select("*", { count: "exact", head: true }).in("invitation_id", invitationIds).eq("status", "pending"),
        ]);

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
          .limit(6);
        setRecentRsvps(rsvpsData || []);
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, package:packages(name_kh, name)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const pkg: any = Array.isArray(sub?.package) ? sub?.package[0] : sub?.package;
      setPackageName(pkg?.name_kh || pkg?.name || "ឥតគិតថ្លៃ");
      setLoading(false);
    })();
  }, [user]);

  const statCards = [
    { label: "លិខិតអញ្ជើញ", value: String(invitationCount), sub: `${publishedCount} បានផ្សាយ`, icon: FileText, cls: "from-gold-50 to-white" },
    { label: "ភ្ញៀវសរុប", value: String(guestCount), sub: "ក្នុងបញ្ជីភ្ញៀវ", icon: Users, cls: "from-blue-50 to-white" },
    { label: "RSVP សរុប", value: String(rsvpCount), sub: `${attendingCount} ចូលរួម`, icon: CheckCircle, cls: "from-green-50 to-white" },
    { label: "កញ្ចប់", value: packageName, sub: "សកម្ម", icon: Crown, cls: "from-purple-50 to-white" },
  ];

  const rsvpStatus: Record<string, { label: string; color: string; bg: string }> = {
    attending: { label: "ចូលរួម", color: "text-green-700", bg: "bg-green-100" },
    not_attending: { label: "មិនចូលរួម", color: "text-red-700", bg: "bg-red-100" },
    pending: { label: "រង់ចាំ", color: "text-yellow-700", bg: "bg-yellow-100" },
  };

  const segTotal = attendingCount + notAttendingCount + pendingCount;
  const pct = (n: number) => (segTotal > 0 ? (n / segTotal) * 100 : 0);

  const daysLeft = firstInvitation?.wedding_date
    ? Math.ceil((new Date(firstInvitation.wedding_date).getTime() - Date.now()) / 86400000)
    : null;

  const coupleName = firstInvitation
    ? firstInvitation.type === "birthday"
      ? `🎂 ${firstInvitation.groom_name_kh || firstInvitation.groom_name || "ឈ្មោះអ្នកកំណើត"}`
      : `${firstInvitation.groom_name_kh || firstInvitation.groom_name || "កូនកំលោះ"} ❦ ${firstInvitation.bride_name_kh || firstInvitation.bride_name || "កូនក្រមុំ"}`
    : "";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gold-gradient p-6 md:p-8 text-white shadow-md">
        <div className="absolute inset-3 rounded-xl border border-white/25 pointer-events-none" />
        <Heart className="absolute -right-4 -top-4 h-28 w-28 text-white/10 rotate-12 pointer-events-none" />
        <div className="relative">
          <p className="text-sm text-white/80">{greeting()} 🌟</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-0.5">សូមស្វាគមន៍!</h1>
          <p className="text-sm text-white/85 mt-1 truncate max-w-lg">
            {firstInvitation ? (
              <>លិខិតអញ្ជើញរបស់អ្នក៖ <b>{coupleName}</b></>
            ) : (
              <>ចាប់ផ្តើមបង្កើតលិខិតអញ្ជើញដំបូងរបស់អ្នក</>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-medium">
              <Crown className="h-3.5 w-3.5" /> {packageName}
            </span>
            {daysLeft !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                {daysLeft > 0 ? `នៅសល់ ${daysLeft} ថ្ងៃទៀតដល់ពិធី` : daysLeft === 0 ? "ថ្ងៃនេះជាថ្ងៃពិធី!" : "ពិធីបានឆ្លងកាត់ហើយ"}
              </span>
            )}
            {firstInvitation?.status === "published" && (
              <Link href={`/invite/${firstInvitation.slug}`} target="_blank">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-secondary text-xs font-semibold hover:bg-white transition-colors cursor-pointer">
                  <ExternalLink className="h-3.5 w-3.5" /> មើលលិខិតអញ្ជើញ
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className={`border border-gold-200/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-gradient-to-br ${stat.cls}`}>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-secondary mt-1 leading-none truncate max-w-[140px]">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-gold-gradient flex items-center justify-center shrink-0 shadow-sm">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RSVP breakdown */}
            <Card className="border-gold-200/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-secondary flex items-center gap-2 text-base">
                  <CheckCircle className="h-4.5 w-4.5 h-5 w-5 text-primary" />
                  RSVP ស្ថិតិ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  <div className="bg-green-500 transition-all duration-500" style={{ width: `${pct(attendingCount)}%` }} />
                  <div className="bg-red-400 transition-all duration-500" style={{ width: `${pct(notAttendingCount)}%` }} />
                  <div className="bg-yellow-400 transition-all duration-500" style={{ width: `${pct(pendingCount)}%` }} />
                </div>
                <div className="space-y-2">
                  {[
                    { icon: UserCheck, label: "ចូលរួម", n: attendingCount, dot: "bg-green-500", txt: "text-green-700" },
                    { icon: UserX, label: "មិនចូលរួម", n: notAttendingCount, dot: "bg-red-400", txt: "text-red-700" },
                    { icon: Clock, label: "រង់ចាំ", n: pendingCount, dot: "bg-yellow-400", txt: "text-yellow-700" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                        <row.icon className={`h-4 w-4 ${row.txt} opacity-70`} />
                        <span className="text-sm text-secondary">{row.label}</span>
                      </div>
                      <span className={`font-bold ${row.txt}`}>{row.n}<span className="text-xs font-normal text-muted-foreground ml-1">នាក់</span></span>
                    </div>
                  ))}
                </div>
                {segTotal > 0 && (
                  <p className="text-xs text-muted-foreground text-center pt-1 border-t border-gold-100">
                    🎉 <b className="text-primary">{Math.round(pct(attendingCount))}%</b> បានបញ្ជាក់នឹងចូលរួម
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent RSVPs */}
            <Card className="border-gold-200/50 shadow-sm lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-secondary flex items-center gap-2 text-base">
                  <Heart className="h-5 w-5 text-primary" />
                  RSVP ថ្មីៗ
                </CardTitle>
                {firstInvitation && (
                  <Link href={`/guests/${firstInvitation.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-gold-50 gap-1">
                      មើលទាំងអស់ <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {recentRsvps.length > 0 ? (
                  <div className="divide-y divide-gold-100">
                    {recentRsvps.map((rsvp) => {
                      const name = Array.isArray(rsvp.guest) ? rsvp.guest[0]?.name : rsvp.guest?.name || "ភ្ញៀវ";
                      return (
                        <div key={rsvp.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-gold-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-secondary text-sm truncate">{name}</p>
                              <p className="text-xs text-muted-foreground">
                                {timeAgo(rsvp.created_at)}
                                {rsvp.message ? ` • "${rsvp.message.slice(0, 32)}${rsvp.message.length > 32 ? "..." : ""}"` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {rsvp.number_of_guests > 1 && (
                              <span className="text-xs text-muted-foreground hidden sm:inline">+{rsvp.number_of_guests - 1} នាក់</span>
                            )}
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rsvpStatus[rsvp.status]?.bg} ${rsvpStatus[rsvp.status]?.color}`}>
                              {rsvpStatus[rsvp.status]?.label || rsvp.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="h-14 w-14 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-7 w-7 text-primary/40" />
                    </div>
                    <p className="text-muted-foreground text-sm">មិនទាន់មាន RSVP</p>
                    <p className="text-xs text-muted-foreground mt-1">ភ្ញៀវនឹងឆ្លើយតបនៅពេលពួកគេបើក Link លិខិតអញ្ជើញ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/invitations", icon: Plus, title: "បង្កើតថ្មី", desc: "លិខិតអញ្ជើញថ្មី", primary: true },
              { href: firstInvitation ? `/guests/${firstInvitation.id}` : "/guests", icon: Users, title: "គ្រប់គ្រងភ្ញៀវ", desc: `${guestCount} នាក់ក្នុងបញ្ជី` },
              { href: "/analytics", icon: CheckCircle, title: "Analytics", desc: "ស្ថិតិលម្អិត" },
              { href: "/billing", icon: CreditCard, title: "ការទូទាត់", desc: `កញ្ចប់${packageName}` },
            ].map((a) =>
              a.primary ? (
                <Link key={a.title} href={a.href}>
                  <div className="group h-full rounded-2xl bg-gold-gradient text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-4 cursor-pointer">
                    <a.icon className="h-6 w-6 mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-sm">{a.title}</p>
                    <p className="text-xs text-white/75 mt-0.5">{a.desc}</p>
                  </div>
                </Link>
              ) : (
                <Link key={a.title} href={a.href}>
                  <div className="group h-full rounded-2xl bg-white border border-gold-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 cursor-pointer">
                    <div className="h-9 w-9 rounded-lg bg-gold-50 flex items-center justify-center mb-3 group-hover:bg-gold-100 transition-colors">
                      <a.icon className="h-4.5 w-4.5 h-5 w-5 text-primary" />
                    </div>
                    <p className="font-bold text-sm text-secondary">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                  </div>
                </Link>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
