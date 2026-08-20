"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Eye, Calendar } from "lucide-react";
import type { Invitation } from "@/types/database";

export default function DashboardPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data } = await supabase
        .from("invitations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setInvitations(data || []);
      setLoading(false);
    })();
  }, [user]);

  const stats = [
    { title: "លិខិតអញ្ជើញសរុប", value: invitations.length, icon: Mail, color: "text-blue-500" },
    { title: "បានផ្សាយ", value: invitations.filter((i) => i.status === "published").length, icon: Eye, color: "text-green-500" },
    { title: "ព្រៀង", value: invitations.filter((i) => i.status === "draft").length, icon: Calendar, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">ស្វាគមន៍ការត្រឡប់មកវិញ!</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <Link href="/invitations">
          <Button className="gap-2 bg-gold-gradient text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> លិខិតអញ្ជើញថ្មី
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-secondary">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gold-50 flex items-center justify-center">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-secondary">លិខិតអញ្ជើញថ្មីៗ</CardTitle>
          <Link href="/invitations">
            <Button variant="ghost" size="sm" className="text-primary">មើលទាំងអស់</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">កំពុងផ្ទុក...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">មិនទាន់មានលិខិតអញ្ជើញទេ</p>
              <Link href="/invitations">
                <Button className="bg-gold-gradient text-white hover:opacity-90">បង្កើតលិខិតអញ្ជើញដំបូង</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.slice(0, 5).map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 rounded-lg border border-gold-200/50 hover:shadow-sm transition-all">
                  <div>
                    <p className="font-medium text-secondary">{invitation.groom_name || "កូនកំលោះ"} & {invitation.bride_name || "កូនក្រមុំ"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invitation.wedding_date).toLocaleDateString("km-KH")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invitation.status === "published" ? "default" : "secondary"} className={invitation.status === "published" ? "bg-green-500 text-white" : ""}>
                      {invitation.status === "published" ? "បានផ្សាយ" : "ព្រៀង"}
                    </Badge>
                    <Link href={`/builder/${invitation.id}`}>
                      <Button variant="outline" size="sm" className="border-gold-200 text-primary hover:bg-gold-50">កែប្រែ</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
