"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink, Copy, Users } from "lucide-react";
import type { Invitation } from "@/types/database";

export default function InvitationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    supabase
      .from("invitations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setInvitations(data || []);
        setLoading(false);
      });
  }, [user]);

  const createNewInvitation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("invitations")
      .insert({
        user_id: user.id,
        slug: `wedding-${Date.now()}`,
        groom_name: "",
        bride_name: "",
        wedding_date: new Date().toISOString(),
        status: "draft",
      })
      .select()
      .single();

    if (data) {
      router.push(`/builder/${data.id}`);
    }
  };

  const deleteInvitation = async (id: string) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបលិខិតអញ្ជើញនេះទេ?")) return;

    await supabase.from("invitations").delete().eq("id", id);
    setInvitations(invitations.filter((i) => i.id !== id));
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${slug}`);
    alert("បានចម្លង Link!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">លិខិតអញ្ជើញរបស់ខ្ញុំ</h1>
          <p className="text-muted-foreground">គ្រប់គ្រងលិខិតអញ្ជើញរោងពិធីរបស់អ្នក</p>
        </div>
        <Button className="gap-2 bg-gold-gradient text-white hover:opacity-90" onClick={createNewInvitation}>
          <Plus className="h-4 w-4" /> បង្កើតថ្មី
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
      ) : invitations.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">អ្នកមិនទាន់បង្កើតលិខិតអញ្ជើញណាមួយទេ។</p>
            <Button onClick={createNewInvitation} className="gap-2 bg-gold-gradient text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> បង្កើតលិខិតអញ្ជើញដំបូង
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
              <div className="aspect-video bg-gradient-to-br from-gold-50 via-gold-100 to-gold-50 flex items-center justify-center relative">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">
                    {invitation.groom_name || "កូនកំលោះ"} & {invitation.bride_name || "កូនក្រមុំ"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(invitation.wedding_date).toLocaleDateString("km-KH")}
                  </p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={invitation.status === "published" ? "default" : "secondary"} className={invitation.status === "published" ? "bg-green-500 text-white" : ""}>
                    {invitation.status === "published" ? "បានផ្សាយ" : "ព្រៀង"}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/builder/${invitation.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                      <Edit className="h-3 w-3" /> កែប្រែ
                    </Button>
                  </Link>
                  {invitation.status === "published" && (
                    <>
                      <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50" onClick={() => copyLink(invitation.slug)}>
                        <Copy className="h-3 w-3" /> ចម្លង Link
                      </Button>
                      <Link href={`/invite/${invitation.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                          <ExternalLink className="h-3 w-3" /> មើល
                        </Button>
                      </Link>
                      <Link href={`/guests/${invitation.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                          <Users className="h-3 w-3" /> ភ្ញៀវ
                        </Button>
                      </Link>
                      <Link href={`/rsvp/${invitation.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                          RSVP
                        </Button>
                      </Link>
                    </>
                  )}
                  <Button variant="outline" size="sm" className="gap-1 text-red-500 border-red-200 hover:bg-red-50" onClick={() => deleteInvitation(invitation.id)}>
                    <Trash2 className="h-3 w-3" />
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
