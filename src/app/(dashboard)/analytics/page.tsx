"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users, Heart, MessageCircle, UserCheck, UserX, Clock, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { StatsSkeleton } from "@/components/skeleton-loader";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Overview {
  total_views: number;
  unique_views: number;
  total_guests: number;
  total_rsvps: number;
  attending: number;
  not_attending: number;
  total_guests_coming: number;
  total_wishes: number;
  approved_wishes: number;
}

interface DailyView {
  date: string;
  views: number;
}

interface RsvpDaily {
  date: string;
  attending: number;
  not_attending: number;
}

interface Invitation {
  id: string;
  slug: string;
  groom_name_kh: string | null;
  groom_name: string;
  bride_name_kh: string | null;
  bride_name: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [rsvpDaily, setRsvpDaily] = useState<RsvpDaily[]>([]);
  const [recentRsvps, setRecentRsvps] = useState<any[]>([]);
  const [recentWishes, setRecentWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("invitations")
        .select("id, slug, groom_name_kh, groom_name, bride_name_kh, bride_name")
        .eq("user_id", user.id);
      const invs = data || [];
      setInvitations(invs);
      if (invs.length > 0) setSelectedId(invs[0].id);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const res = await fetch(`/api/analytics/stats?invitation_id=${selectedId}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data.overview);
        setDailyViews(data.daily_views || []);
        setRsvpDaily(data.rsvp_daily || []);
        setRecentRsvps(data.recent_rsvps || []);
        setRecentWishes(data.recent_wishes || []);
      }
    })();
  }, [selectedId]);

  const COLORS = ["#22c55e", "#ef4444", "#eab308"];

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const rsvpStatusMap: Record<string, { label: string; color: string; bg: string }> = {
    attending: { label: "ចូលរួម", color: "text-green-700", bg: "bg-green-100" },
    not_attending: { label: "មិនចូលរួម", color: "text-red-700", bg: "bg-red-100" },
    pending: { label: "រង់ចាំ", color: "text-yellow-700", bg: "bg-yellow-100" },
    maybe: { label: "ប្រហែល", color: "text-blue-700", bg: "bg-blue-100" },
  };

  const selectedInv = invitations.find((i) => i.id === selectedId);
  const inviteLabel = selectedInv
    ? `${selectedInv.groom_name_kh || selectedInv.groom_name} & ${selectedInv.bride_name_kh || selectedInv.bride_name}`
    : "";

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            ស្ថិតិវិភាគទាន
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {inviteLabel && `លិខិតអញ្ជើញ: ${inviteLabel}`}
          </p>
        </div>
        {invitations.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 border border-gold-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {invitations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.groom_name_kh || inv.groom_name} & {inv.bride_name_kh || inv.bride_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "ការចូលមើល", value: overview.total_views, icon: Eye, color: "from-blue-500 to-blue-600" },
            { label: "ភ្ញៀវសរុប", value: overview.total_guests, icon: Users, color: "from-purple-500 to-purple-600" },
            { label: "ចូលរួម", value: overview.attending, icon: UserCheck, color: "from-green-500 to-green-600" },
            { label: "ពាក្យជូនពរ", value: overview.total_wishes, icon: MessageCircle, color: "from-amber-500 to-amber-600" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
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

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-secondary">{overview.unique_views}</p>
              <p className="text-xs text-muted-foreground mt-1">អ្នកមើលខុសគ្នា</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{overview.total_guests_coming}</p>
              <p className="text-xs text-muted-foreground mt-1">ភ្ញៀវនឹងមក</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{overview.approved_wishes}</p>
              <p className="text-xs text-muted-foreground mt-1">ពាក្យជូនពរបានអនុម័ត</p>
            </CardContent>
          </Card>
        </div>
      )}

      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-secondary text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                ស្ថានភាព RSVP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "ចូលរួម", value: overview.attending },
                        { name: "មិនចូលរួម", value: overview.not_attending },
                        { name: "រង់ចាំ", value: overview.total_rsvps - overview.attending - overview.not_attending },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[0, 1, 2].map((i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {[
                  { label: "ចូលរួម", value: overview.attending, color: "bg-green-500" },
                  { label: "មិនចូលរួម", value: overview.not_attending, color: "bg-red-500" },
                  { label: "រង់ចាំ", value: overview.total_rsvps - overview.attending - overview.not_attending, color: "bg-yellow-500" },
                ].filter((d) => d.value > 0).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-secondary">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-secondary text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                ការចូលមើលតាមថ្ងៃ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyViews.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyViews}>
                    <defs>
                      <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b8860b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d6" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 11, fill: "#888" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                    <Tooltip
                      labelFormatter={(v) => `ថ្ងៃទី ${formatDate(v as string)}`}
                      formatter={(v: number) => [`${v} ដង`, "ការចូលមើល"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#b8860b"
                      strokeWidth={2}
                      fill="url(#viewGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                  មិនទាន់មានទិន្នន័យ
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {rsvpDaily.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-secondary text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              RSVP តាមថ្ងៃ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rsvpDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d6" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#888" }} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                <Tooltip
                  labelFormatter={(v) => `ថ្ងៃទី ${formatDate(v as string)}`}
                  formatter={(v: number, name: string) => [v, name === "attending" ? "ចូលរួម" : "មិនចូលរួម"]}
                />
                <Bar dataKey="attending" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="not_attending" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-secondary text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              RSVP ថ្មីៗ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRsvps.length > 0 ? (
              <div className="space-y-3">
                {recentRsvps.map((r: any) => {
                  const guestName = Array.isArray(r.guest) ? r.guest[0]?.name : r.guest?.name || "ភ្ញៀវ";
                  const s = rsvpStatusMap[r.status] || rsvpStatusMap.pending;
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-gold-50/50 rounded-xl border border-gold-200/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center text-white text-xs font-bold">
                          {guestName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-secondary text-sm">{guestName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString("km-KH")}
                            {r.number_of_guests > 1 && ` · +${r.number_of_guests - 1} នាក់`}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">មិនទាន់មាន RSVP</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-secondary text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              ពាក្យជូនពរថ្មីៗ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentWishes.length > 0 ? (
              <div className="space-y-3">
                {recentWishes.map((w: any) => (
                  <div key={w.id} className="p-3 bg-gold-50/50 rounded-xl border border-gold-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded-full bg-gold-gradient flex items-center justify-center text-white text-[10px] font-bold">
                        {w.sender_name?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium text-secondary text-sm">{w.sender_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(w.created_at).toLocaleDateString("km-KH")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 pl-8">{w.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">មិនទាន់មានពាក្យជូនពរ</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
