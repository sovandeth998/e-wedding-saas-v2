"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLimits } from "@/hooks/useLimits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink, Users, Eye, Share2, Globe, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Invitation } from "@/types/database";

export default function InvitationsPage() {
  const { user } = useAuth();
  const limits = useLimits();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  const fetchData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("invitations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setInvitations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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

  const handlePublish = async (id: string) => {
    await supabase.from("invitations").update({ status: "published" }).eq("id", id);
    toast.success("បានផ្សាយលិខិតអញ្ជើញ!");
    fetchData();
  };

  const shareLink = (invitation: Invitation) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.slug || invitation.id}`);
    toast.success("បានចម្លង Link!");
  };

  const handleInviteGuest = async () => {
    if (!inviteName.trim() || !selectedInvitationId) return;
    setInviteLoading(true);

    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .insert({
        invitation_id: selectedInvitationId,
        name: inviteName.trim(),
        phone: invitePhone.trim() || null,
        side: "other",
      })
      .select()
      .single();

    if (guest) {
      toast.success(`បានអញ្ជើញ ${inviteName} ដោយជោគជ័យ!`);
      setInviteName("");
      setInvitePhone("");
      setDialogOpen(false);
    } else {
      toast.error("បរាជ័យក្នុងការអញ្ជើញ");
    }
    setInviteLoading(false);
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

      {!limits.loading && limits.currentInvitations >= limits.maxInvitations && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-700 font-medium">
            អ្នកបានឈានដល់កំណត់របស់គម្រោង {limits.planName}
          </p>
          <Link href="/billing">
            <Button className="mt-2 bg-gold-gradient text-white" size="sm">
              អាប់គ្រោង
            </Button>
          </Link>
        </div>
      )}

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
                  {invitation.status === "published" ? (
                    <>
                      <Dialog open={dialogOpen && selectedInvitationId === invitation.id} onOpenChange={(open) => { setDialogOpen(open); setSelectedInvitationId(invitation.id); if (!open) { setInviteName(""); setInvitePhone(""); } }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50" onClick={() => { setSelectedInvitationId(invitation.id); setDialogOpen(true); }}>
                            <UserPlus className="h-4 w-4" /> អញ្ជើញភ្ញៀវ
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-secondary">អញ្ជើញភ្ញៀវថ្មី</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <Label className="text-secondary">ឈ្មោះភ្ញៀវ *</Label>
                              <Input
                                placeholder="បញ្ចូលឈ្មោះភ្ញៀវ"
                                value={inviteName}
                                onChange={(e) => setInviteName(e.target.value)}
                                className="border-gold-200 focus:border-primary"
                              />
                            </div>
                            <div>
                              <Label className="text-secondary">លេខទូរស័ព្ទ (ស្រេចចិត្ត)</Label>
                              <Input
                                placeholder="012 345 678"
                                value={invitePhone}
                                onChange={(e) => setInvitePhone(e.target.value)}
                                className="border-gold-200 focus:border-primary"
                              />
                            </div>
                            <Button
                              onClick={handleInviteGuest}
                              disabled={!inviteName.trim() || inviteLoading}
                              className="w-full bg-gold-gradient text-white hover:opacity-90"
                            >
                              {inviteLoading ? "កំពុងអញ្ជើញ..." : "អញ្ជើញភ្ញៀវ"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" className="gap-1 text-green-600 hover:bg-green-50" onClick={() => shareLink(invitation)}>
                        <Share2 className="h-4 w-4" /> ចែករំលែក
                      </Button>
                      <Link href={`/preview/${invitation.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                          <Eye className="h-4 w-4" /> មើលជាសាធារណៈ
                        </Button>
                      </Link>
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
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => handlePublish(invitation.id)}>
                        <Globe className="h-4 w-4" /> ផ្សាយ
                      </Button>
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
