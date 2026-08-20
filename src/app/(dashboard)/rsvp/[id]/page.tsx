"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { RSVP, Wish, Guest } from "@/types/database";

type RSVPWithGuest = RSVP & { guest?: Guest };

export default function RSVPTrackerPage() {
  const params = useParams();
  const [rsvps, setRsvps] = useState<RSVPWithGuest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"rsvp" | "wishes">("rsvp");
  const supabase = createClient();

  useEffect(() => {
    if (!params.id) return;
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    const [rsvpRes, wishesRes] = await Promise.all([
      supabase.from("rsvps").select("*, guest:guests(name)").eq("invitation_id", params.id).order("created_at", { ascending: false }),
      supabase.from("wishes").select("*").eq("invitation_id", params.id).order("created_at", { ascending: false }),
    ]);

    setRsvps(rsvpRes.data || []);
    setWishes(wishesRes.data || []);
    setLoading(false);
  };

  const approveWish = async (id: string) => {
    await supabase.from("wishes").update({ is_approved: true }).eq("id", id);
    setWishes(wishes.map((w) => (w.id === id ? { ...w, is_approved: true } : w)));
  };

  const deleteWish = async (id: string) => {
    await supabase.from("wishes").delete().eq("id", id);
    setWishes(wishes.filter((w) => w.id !== id));
  };

  const attending = rsvps.filter((r) => r.status === "attending").length;
  const notAttending = rsvps.filter((r) => r.status === "not_attending").length;
  const pending = rsvps.filter((r) => r.status === "pending").length;

  const stats = [
    { title: "RSVP សរុប", value: rsvps.length, icon: Users, color: "text-blue-500" },
    { title: "នឹងមក", value: attending, icon: CheckCircle, color: "text-green-500" },
    { title: "មិនមក", value: notAttending, icon: XCircle, color: "text-red-500" },
    { title: "កំពុងរង់ចាំ", value: pending, icon: Clock, color: "text-yellow-500" },
  ];

  const statusLabels: Record<string, string> = {
    attending: "នឹងមក",
    not_attending: "មិនមក",
    maybe: "ប្រហែល",
    pending: "រង់ចាំ",
  };

  const statusColors: Record<string, string> = {
    attending: "bg-green-100 text-green-700",
    not_attending: "bg-red-100 text-red-700",
    maybe: "bg-yellow-100 text-yellow-700",
    pending: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invitations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary">តាមដាន RSVP និងពាក្យជូនពរ</h1>
          <p className="text-muted-foreground">តាមដានការឆ្លើយតប និងពាក្យជូនពររបស់ភ្ញៀវ</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 border-b border-gold-200/50 pb-2">
        <Button variant={tab === "rsvp" ? "default" : "ghost"} onClick={() => setTab("rsvp")} className={`gap-2 ${tab === "rsvp" ? "bg-gold-gradient text-white" : ""}`}>
          <Users className="h-4 w-4" /> RSVP ({rsvps.length})
        </Button>
        <Button variant={tab === "wishes" ? "default" : "ghost"} onClick={() => setTab("wishes")} className={`gap-2 ${tab === "wishes" ? "bg-gold-gradient text-white" : ""}`}>
          <MessageSquare className="h-4 w-4" /> ពាក្យជូនពរ ({wishes.length})
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
      ) : tab === "rsvp" ? (
        rsvps.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">មិនទាន់មាន RSVP ទេ</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold-200/50 bg-gold-50/50">
                      <th className="text-left p-3 text-sm font-medium text-secondary">ភ្ញៀវ</th>
                      <th className="text-left p-3 text-sm font-medium text-secondary">ស្ថានភាព</th>
                      <th className="text-left p-3 text-sm font-medium text-secondary">ភ្ញៀវ</th>
                      <th className="text-left p-3 text-sm font-medium text-secondary">ពិធី</th>
                      <th className="text-left p-3 text-sm font-medium text-secondary">ស្វាគមន៍</th>
                      <th className="text-left p-3 text-sm font-medium text-secondary">សារ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="border-b border-gold-200/30 last:border-0">
                        <td className="p-3 font-medium text-secondary">{rsvp.guest?.name || rsvp.guest_id}</td>
                        <td className="p-3">
                          <Badge className={`${statusColors[rsvp.status]} border-0`}>{statusLabels[rsvp.status] || rsvp.status}</Badge>
                        </td>
                        <td className="p-3 text-secondary">{rsvp.number_of_guests}</td>
                        <td className="p-3 text-secondary">{rsvp.attending_ceremony ? "បាទ/ចាស" : "ទេ"}</td>
                        <td className="p-3 text-secondary">{rsvp.attending_reception ? "បាទ/ចាស" : "ទេ"}</td>
                        <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">
                          {rsvp.message || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      ) : wishes.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">មិនទាន់មានពាក្យជូនពរទេ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishes.map((wish) => (
            <Card key={wish.id} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-secondary">{wish.sender_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(wish.created_at).toLocaleString("km-KH")}
                    </p>
                  </div>
                  <Badge className={`${wish.is_approved ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"} border-0`}>
                    {wish.is_approved ? "បានអនុម័ត" : "រង់ចាំ"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{wish.content}</p>
                <div className="flex gap-2">
                  {!wish.is_approved && (
                    <Button size="sm" variant="outline" onClick={() => approveWish(wish.id)} className="border-gold-200 text-primary hover:bg-gold-50">
                      អនុម័ត
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => deleteWish(wish.id)}>
                    លុប
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
