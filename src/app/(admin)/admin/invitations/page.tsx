"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Eye, ExternalLink, Search, FileText, CheckCircle, Clock } from "lucide-react";

interface Invitation {
  id: string;
  slug: string;
  groom_name: string;
  groom_name_kh: string | null;
  bride_name: string;
  bride_name_kh: string | null;
  wedding_date: string;
  venue_name: string | null;
  status: string;
  created_at: string;
  user: { email: string; full_name: string | null } | null;
  guest_count?: number;
  rsvp_count?: number;
  view_count?: number;
}

export default function AdminInvitationsPage() {
  const supabase = createClient();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    const { data: invs } = await supabase
      .from("invitations")
      .select("*, user:user_id(email, full_name)")
      .order("created_at", { ascending: false });

    const allInvs = (invs || []) as any[];

    const invIds = allInvs.map((i: any) => i.id);

    const [guestCounts, rsvpCounts, viewCounts] = await Promise.all([
      invIds.length > 0
        ? supabase.from("guests").select("invitation_id").in("invitation_id", invIds)
        : Promise.resolve({ data: [] }),
      invIds.length > 0
        ? supabase.from("rsvps").select("invitation_id, status").in("invitation_id", invIds)
        : Promise.resolve({ data: [] }),
      invIds.length > 0
        ? supabase.from("page_views").select("invitation_id").in("invitation_id", invIds)
        : Promise.resolve({ data: [] }),
    ]);

    const guestMap: Record<string, number> = {};
    (guestCounts.data || []).forEach((g: any) => {
      guestMap[g.invitation_id] = (guestMap[g.invitation_id] || 0) + 1;
    });

    const rsvpMap: Record<string, number> = {};
    (rsvpCounts.data || []).forEach((r: any) => {
      rsvpMap[r.invitation_id] = (rsvpMap[r.invitation_id] || 0) + 1;
    });

    const viewMap: Record<string, number> = {};
    (viewCounts.data || []).forEach((v: any) => {
      viewMap[v.invitation_id] = (viewMap[v.invitation_id] || 0) + 1;
    });

    const enriched = allInvs.map((inv: any) => ({
      ...inv,
      guest_count: guestMap[inv.id] || 0,
      rsvp_count: rsvpMap[inv.id] || 0,
      view_count: viewMap[inv.id] || 0,
    }));

    setInvitations(enriched);
    setLoading(false);
  };

  const filtered = invitations.filter((inv) => {
    const matchSearch =
      !search ||
      inv.groom_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.bride_name.toLowerCase().includes(search.toLowerCase()) ||
      (inv.groom_name_kh || "").includes(search) ||
      (inv.bride_name_kh || "").includes(search) ||
      inv.slug.toLowerCase().includes(search.toLowerCase()) ||
      inv.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    published: { label: "បានផ្សាយ", color: "text-green-700", bg: "bg-green-100" },
    draft: { label: "ព្រាង", color: "text-yellow-700", bg: "bg-yellow-100" },
    archived: { label: "បានផ្ទុក", color: "text-gray-700", bg: "bg-gray-100" },
  };

  const totalGuests = invitations.reduce((s, i) => s + (i.guest_count || 0), 0);
  const totalRsvps = invitations.reduce((s, i) => s + (i.rsvp_count || 0), 0);
  const totalViews = invitations.reduce((s, i) => s + (i.view_count || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          លិខិតអញ្ជើញទាំងអស់
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          មើល និងគ្រប់គ្រងលិខិតអញ្ជើញរបស់អតិថិជនទាំងអស់
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "លិខិតសរុប", value: invitations.length, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "ភ្ញៀវសរុប", value: totalGuests, icon: Users, color: "from-purple-500 to-purple-600" },
          { label: "RSVP សរុប", value: totalRsvps, icon: CheckCircle, color: "from-green-500 to-green-600" },
          { label: "ការចូលមើល", value: totalViews, icon: Eye, color: "from-amber-500 to-amber-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-md">
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-gold-200"
          />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? "bg-gold-gradient text-white" : "border-gold-200 text-secondary"}
            >
              {s === "all" ? "ទាំងអស់" : statusMap[s]?.label || s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">មិនមានលិខិតអញ្ជើញ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const s = statusMap[inv.status] || statusMap.draft;
            return (
              <Card key={inv.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-secondary truncate">
                          {inv.groom_name_kh || inv.groom_name} & {inv.bride_name_kh || inv.bride_name}
                        </h3>
                        <Badge className={`${s.bg} ${s.color} border-0 text-xs`}>{s.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {inv.user?.email || "មិនស្គាល់"}
                        {inv.venue_name && ` · ${inv.venue_name}`}
                        {inv.wedding_date && ` · ${new Date(inv.wedding_date).toLocaleDateString("km-KH")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {inv.guest_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> {inv.rsvp_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {inv.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(inv.created_at).toLocaleDateString("km-KH")}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/invite/${inv.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                          <ExternalLink className="h-3 w-3" /> មើល
                        </Button>
                      </Link>
                      <Link href={`/guests/${inv.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-secondary hover:bg-gold-50">
                          <Users className="h-3 w-3" /> ភ្ញៀវ
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
