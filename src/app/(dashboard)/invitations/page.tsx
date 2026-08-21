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
import { Plus, Edit, Trash2, ExternalLink, Users, Eye, Share2, Globe, UserPlus, Palette, Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import type { Invitation } from "@/types/database";

const templateList = [
  { id: "1",  name: "\u1795\u17b6\u1789\u179f\u17cb\u17a0\u17d2\u179a\u17b8\u1785\u179b\u17d2\u1793\u17a4", category: "modern",  isPremium: false, bg: "linear-gradient(180deg, #fdf8f0, #f5edd8)", accent: "#b8860b", textPri: "#6b4c1e" },
  { id: "2",  name: "\u1798\u17b7\u1784\u179c\u17bb\u1793\u17d2\u1793",         category: "luxury",  isPremium: true,  bg: "linear-gradient(135deg, #1a1a0e, #3d3520)", accent: "#f59e0b", textPri: "#fef3c7" },
  { id: "3",  name: "\u179b\u17c1\u1784\u1796\u17b7\u1785\u17a2\u1784",       category: "classic", isPremium: false, bg: "linear-gradient(135deg, #2e1a1a, #601010)", accent: "#ef4444", textPri: "#fecaca" },
  { id: "4",  name: "\u179f\u17b6\u179b\u17d2\u1798\u179b\u17d2\u1793",         category: "modern",  isPremium: false, bg: "linear-gradient(135deg, #0e1a2e, #1e3a5e)", accent: "#3b82f6", textPri: "#bfdbfe" },
  { id: "5",  name: "\u17a0\u17b7\u179c\u17d2\u178f\u17a2\u17d2\u1793",           category: "luxury",  isPremium: true,  bg: "linear-gradient(135deg, #1a0e2e, #401060)", accent: "#a855f7", textPri: "#ddd6fe" },
  { id: "6",  name: "\u179f\u17d2\u1796\u1784\u1789\u17cb\u17a0",           category: "modern",  isPremium: false, bg: "linear-gradient(135deg, #0e2e1a, #106030)", accent: "#22c55e", textPri: "#bbf7d0" },
  { id: "7",  name: "\u1795\u17b6\u1789\u179f\u17cb\u179c\u17d2\u1793\u17a4",       category: "classic", isPremium: false, bg: "linear-gradient(135deg, #1a1a1e, #404045)", accent: "#94a3b8", textPri: "#e2e8f0" },
  { id: "8",  name: "\u1795\u17d2\u179b\u17b6\u1781\u17b8\u1793\u17cb",        category: "luxury",  isPremium: true,  bg: "linear-gradient(135deg, #2e1a0e, #604010)", accent: "#fbbf24", textPri: "#fde68a" },
  { id: "9",  name: "\u179c\u17b7\u1784\u179f\u17d2\u1796\u17a4",           category: "modern",  isPremium: false, bg: "linear-gradient(135deg, #0e2e2e, #106060)", accent: "#06b6d4", textPri: "#a5f3fc" },
  { id: "10", name: "\u179a\u17c1\u1795\u17b6\u1789\u179f\u17cb",        category: "luxury",  isPremium: true,  bg: "linear-gradient(135deg, #2e0e2e, #601060)", accent: "#d946ef", textPri: "#f5d0fe" },
  { id: "11", name: "\u179b\u17c1\u1798",              category: "classic", isPremium: false, bg: "linear-gradient(135deg, #2e1a0e, #504010)", accent: "#d97706", textPri: "#fde68a" },
  { id: "12", name: "\u179f\u17d2\u1798\u17d2\u1793",              category: "modern",  isPremium: false, bg: "linear-gradient(135deg, #1a1a1e, #3e3e42)", accent: "#9ca3af", textPri: "#e5e7eb" },
];

const categoryLabels: Record<string, string> = {
  modern: "\u179f\u17b6\u179b\u17d2\u1798\u179b\u17d2\u1793",
  classic: "\u179b\u17c1\u1784\u1796\u17b7\u1785",
  luxury: "\u179b\u17d2\u179a\u17b8\u1793\u17d2\u1793",
};

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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateDialogInvitationId, setTemplateDialogInvitationId] = useState<string | null>(null);
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

  useEffect(() => { fetchData(); }, [user]);

  useEffect(() => {
    const pendingTemplateId = localStorage.getItem("pendingTemplateId");
    if (pendingTemplateId && user && !loading && invitations.length === 0) {
      localStorage.removeItem("pendingTemplateId");
      createNewInvitation(pendingTemplateId);
    }
  }, [user, loading, invitations]);

  const createNewInvitation = async (templateId?: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("invitations")
      .insert({
        user_id: user.id,
        slug: `wedding-${Date.now()}`,
        groom_name: "",
        bride_name: "",
        wedding_date: new Date().toISOString(),
        status: "draft",
        template_id: templateId || "1",
      })
      .select()
      .single();
    if (data) router.push(`/builder/${data.id}`);
  };

  const deleteInvitation = async (id: string) => {
    if (!confirm("\u17d4\u1798\u17b7\u1784\u1798\u17c2\u179b\u1792\u17d2\u179c\u17cb \u1798\u17b6\u1793\u17cb\u1798\u17b7\u1789\u1784\u17a0\u17b6\u1789 \u178f\u1798\u17b7\u1789\u1784\u17a0\u17b6\u1789\u1794\u17d2\u1793\u17cb?")) return;
    await supabase.from("invitations").delete().eq("id", id);
    setInvitations(invitations.filter((i) => i.id !== id));
    toast.success("\u17d4\u179b\u1792\u17d2\u179c\u17cb\u1784\u17a0\u17b6\u1789\u17a1\u17b6\u179f!");
  };

  const handlePublish = async (id: string) => {
    await supabase.from("invitations").update({ status: "published" }).eq("id", id);
    toast.success("\u17d4\u179b\u1792\u17d2\u179c\u17cb\u17a2\u17b6\u1794\u17b6\u1793!");
    fetchData();
  };

  const shareLink = (invitation: Invitation) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.slug || invitation.id}`);
    toast.success("\u17d4\u179b\u1792\u17d2\u179c\u17cb\u1795\u17d2\u179b\u17b6\u1797!");
  };

  const handleTemplateChange = async (invitationId: string, templateId: string) => {
    const { error } = await supabase
      .from("invitations")
      .update({ template_id: templateId })
      .eq("id", invitationId);
    if (!error) {
      const t = templateList.find((t) => t.id === templateId);
      toast.success(`\u17d4\u179b\u1792\u17d2\u179c\u17cb\u17a0\u17b6\u1789\u178f\u17d2\u1791\u17b6\u1794\u17cb ${t?.name || templateId}`);
      setTemplateDialogOpen(false);
      setTemplateDialogInvitationId(null);
      fetchData();
    } else {
      toast.error("\u1794\u17d2\u179a\u17b8\u1793\u17d2\u1793\u178f\u1798\u17b7\u1789\u1784\u178f\u17d2\u1791\u17b6\u1794\u17cb\u179b\u17c1\u1784\u1796\u17b7\u1785");
    }
  };

  const handleInviteGuest = async () => {
    if (!inviteName.trim() || !selectedInvitationId) return;
    setInviteLoading(true);
    const { data: guest } = await supabase
      .from("guests")
      .insert({ invitation_id: selectedInvitationId, name: inviteName.trim(), phone: invitePhone.trim() || null, side: "other" })
      .select()
      .single();
    if (guest) {
      toast.success(`\u17d4\u179b\u1792\u17d2\u179c\u17cb ${inviteName} \u1796\u17b6\u1780\u17d4\u179b\u17d2\u1793\u17cb!`);
      setInviteName(""); setInvitePhone(""); setDialogOpen(false);
    } else {
      toast.error("\u1794\u17d2\u179a\u17b8\u1793\u17d2\u1793\u178f\u1798\u17b7\u1789\u1784\u178f\u17d2\u1791\u17b6\u1794\u17cb\u1795\u17b6\u1789\u1795\u17d2\u1791\u17b6\u1794");
    }
    setInviteLoading(false);
  };

  const getTemplate = (id?: string | null) => templateList.find((t) => t.id === (id || "1")) || templateList[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">{"\u1794\u17d2\u179a\u17b8\u179f\u17d2\u179a\u179c\u17a4\u179b\u17b6\u179f \u1787\u1798\u17b7\u1789\u1784\u17a0\u17b6\u1789"}</h1>
          <p className="text-muted-foreground">{"\u1796\u17c4\u1798\u179b\u17c4\u179f\u1784\u17a0\u17b6\u1789 \u1794\u17d2\u179a\u17b8\u179f\u17d2\u179a\u179c\u17a4\u179b\u17b6\u179f \u1780\u17b6\u17d2\u1781\u179b\u17c8\u17d2\u1793"}</p>
        </div>
        <Button className="gap-2 bg-gold-gradient text-white hover:opacity-90" onClick={() => createNewInvitation()}>
          <Plus className="h-4 w-4" /> {"\u1794\u17b6\u1789\u17f0\u17d2\u1793\u1793\u17b6\u1789"}
        </Button>
      </div>

      {!limits.loading && limits.currentInvitations >= limits.maxInvitations && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-700 font-medium">
            {"\u1798\u17b6\u1793\u17cb \u179b\u17b6\u1787\u1798\u17d2\u1793\u1785\u179b\u17d2\u1793\u17cb\u179c\u17a4\u179b\u17b6\u179f "} {limits.planName}
          </p>
          <Link href="/billing">
            <Button className="mt-2 bg-gold-gradient text-white" size="sm">{"\u17a2\u17b6\u179b\u17d2\u1787\u17d2\u1784"}</Button>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{"\u1780\u17b6\u1793\u17cb\u17a2\u17b6\u179b\u17d2\u179b..."}</div>
      ) : invitations.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{"\u1798\u17b6\u1793\u17cb \u179b\u17c1\u1798\u17a0\u17b6\u1789\u1794\u17d2\u1793\u17cb \u1794\u17b6\u1789\u17f0\u17d2\u1793\u1793\u17b6\u1789 \u1794\u17d2\u179a\u17b8\u179f\u17d2\u179a\u179c\u17a4\u179b\u17b6\u179f\u17a0\u17b6\u1789\u179f\u17d2\u1793\u17b8\u17d4"}</p>
            <Button onClick={() => createNewInvitation()} className="gap-2 bg-gold-gradient text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> {"\u1794\u17b6\u1789\u17f0\u17d2\u1793\u1793\u17b6\u1789 \u1794\u17d2\u179a\u17b8\u179f\u17d2\u179a\u179c\u17a4\u179b\u17b6\u179f \u1796\u17b6\u1780\u1796\u17b6\u1780"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.map((invitation) => {
            const ct = getTemplate(invitation.template_id);
            return (
              <Card key={invitation.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
                <div className="aspect-video flex items-center justify-center relative overflow-hidden" style={{ background: ct.bg }}>
                  <div className="text-center px-4">
                    <p className="text-2xl font-bold" style={{ color: ct.textPri }}>
                      {invitation.groom_name || "\u1781\u17b6\u1789\u179b\u17d2\u1793\u1798\u17b6\u179f"} & {invitation.bride_name || "\u1781\u17b6\u1789\u179f\u17b6\u179f\u17a4"}
                    </p>
                    <p className="text-sm mt-1" style={{ color: ct.textPri, opacity: 0.6 }}>
                      {new Date(invitation.wedding_date).toLocaleDateString("km-KH")}
                    </p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={invitation.status === "published" ? "default" : "secondary"} className={invitation.status === "published" ? "bg-green-500 text-white" : ""}>
                        {invitation.status === "published" ? "\u17a2\u17b6\u1794\u17b6\u1793" : "\u179a\u17d4\u178f\u17b8"}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1" style={{ borderColor: ct.accent + "40", color: ct.accent }}>
                        {ct.isPremium && <Crown className="h-3 w-3" />}
                        {ct.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/builder/${invitation.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                        <Edit className="h-3 w-3" /> {"\u1780\u17b6\u1798\u17cb\u179b\u17c4"}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50" onClick={() => { setTemplateDialogInvitationId(invitation.id); setTemplateDialogOpen(true); }}>
                      <Palette className="h-3 w-3" /> {"\u179f\u17d2\u1791\u17b6\u1794\u17cb\u179b\u17c1\u1784\u1796\u17b7\u1785"}
                    </Button>
                    {invitation.status === "published" ? (
                      <>
                        <Dialog open={dialogOpen && selectedInvitationId === invitation.id} onOpenChange={(open) => { setDialogOpen(open); setSelectedInvitationId(invitation.id); if (!open) { setInviteName(""); setInvitePhone(""); } }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50" onClick={() => { setSelectedInvitationId(invitation.id); setDialogOpen(true); }}>
                              <UserPlus className="h-4 w-4" /> {"\u1795\u17b6\u1789\u1795\u17d2\u1791\u17b6\u1794\u17cb\u1796\u17d2\u179a\u1798\u17d2\u1793"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-secondary">{"\u1795\u17b6\u1789\u1795\u17d2\u1791\u17b6\u1794\u17cb\u1796\u17d2\u179a\u1798\u17d2\u1793\u179b\u17c8\u17d2\u1793"}</DialogTitle>
                              <DialogDescription>{"\u1794\u1793\u17d2\u1791\u17b6\u1791\u17c4\u1780\u17a2\u17d2\u1793\u17b6\u1780\u1795\u17d2\u179b\u17b6\u1797\u1795\u17d2\u1791\u17b6\u1794\u17cb\u1796\u17d2\u179a\u1798\u17d2\u1793\u179a\u1794\u179f\u17cb\u17a2\u17d2\u1793\u17b6\u1780"}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label className="text-secondary">{"\u1787\u1798\u17b6\u179f\u1796\u17d2\u179a\u1798\u17d2\u1793 *"}</Label>
                                <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder={"012 345 678"} />
                              </div>
                              <div>
                                <Label className="text-secondary">{"\u179b\u17c1\u1781\u1791\u17bc\u179a\u179f\u17d0\u1796\u17d2\u1791"}</Label>
                                <Input value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} placeholder="012 345 678" />
                              </div>
                              <Button onClick={handleInviteGuest} disabled={inviteLoading} className="w-full bg-gold-gradient text-white hover:opacity-90">
                                {inviteLoading ? "\u1780\u17c6\u1796\u17bb\u1784\u179a\u1780\u17d2\u179f\u17b6\u1792\u17bb\u1780..." : "\u179a\u1780\u17d2\u179f\u17b6\u1792\u17bb\u1780"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50" onClick={() => shareLink(invitation)}>
                          <Share2 className="h-3 w-3" /> {"\u1785\u17c2\u1780\u179a\u17c6\u179b\u17c2\u1780"}
                        </Button>
                        <Link href={`/invite/${invitation.slug || invitation.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                            <ExternalLink className="h-3 w-3" /> {"\u1798\u17be\u179b"}
                          </Button>
                        </Link>
                        <Link href={`/rsvp/${invitation.id}`}>
                          <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                            <Users className="h-3 w-3" /> {"RSVP"}
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href={`/invite/${invitation.slug || invitation.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="gap-1 border-gold-200 text-primary hover:bg-gold-50">
                            <Eye className="h-3 w-3" /> {"\u1798\u17be\u179b"}
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="gap-1 border-green-300 text-green-700 hover:bg-green-50" onClick={() => handlePublish(invitation.id)}>
                          <Globe className="h-3 w-3" /> {"\u1795\u17d2\u179f\u17b6\u1799"}
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="gap-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => deleteInvitation(invitation.id)}>
                      <Trash2 className="h-3 w-3" /> {"\u179b\u17bb\u1794"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={templateDialogOpen} onOpenChange={(open) => { setTemplateDialogOpen(open); if (!open) setTemplateDialogInvitationId(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-secondary">{"\u1787\u17d2\u179a\u17be\u179f\u179a\u17be\u179f\u1792\u17c0\u1794\u1780\u17c6\u179a\u17bc"}</DialogTitle>
            <DialogDescription>
              {"\u1787\u17d2\u179a\u17be\u179f\u179a\u17be\u179f\u1792\u17c0\u1794\u1780\u179f\u1798\u17d2\u179a\u17b6\u1794\u17cb\u1796\u17b7\u1792\u17b8\u17a2\u17b6\u1796\u17b6\u17a0\u17cb\u1796\u17b7\u1796\u17b6\u17a0\u17cb\u179a\u1794\u179f\u17cb\u17a2\u17d2\u1793\u17b6\u1780"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {templateList.map((t) => {
              const currentId = invitations.find((i) => i.id === templateDialogInvitationId)?.template_id;
              const isSelected = (currentId || "1") === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { if (templateDialogInvitationId) handleTemplateChange(templateDialogInvitationId, t.id); }}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${isSelected ? "" : "border-transparent"}`}
                  style={{ borderColor: isSelected ? t.accent : undefined }}
                >
                  <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2 p-3" style={{ background: t.bg }}>
                    <p className="text-sm font-bold text-center leading-snug" style={{ color: t.textPri }}>
                      {"\u1781\u17b6\u1789\u179b\u17d2\u1793\u1798\u17b6\u179f"} & {"\u1781\u17b6\u1789\u179f\u17b6\u179f\u17a4"}
                    </p>
                    <div className="w-8 h-px" style={{ background: t.accent }} />
                    <p className="text-[10px]" style={{ color: t.textPri, opacity: 0.7 }}>
                      {new Date().toLocaleDateString("km-KH")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-1 px-2 py-1.5 bg-background/95 border-t" style={{ borderTopColor: t.accent + "40" }}>
                    <span className="text-xs font-medium flex items-center gap-1 truncate" style={{ color: t.accent }}>
                      {t.isPremium && <Crown className="h-3 w-3 shrink-0" />}
                      {t.name}
                    </span>
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ background: t.accent }}>
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
