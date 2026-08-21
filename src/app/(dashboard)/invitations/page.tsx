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
import { Plus, Edit, Trash2, ExternalLink, Share2, Globe, Palette, Check, Crown, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Invitation } from "@/types/database";

const templateList = [
  { id: "1",  name: "ផ្កាឈូករ៉ូមែនទិច", bg: "linear-gradient(180deg, #fdf8f0, #f5edd8)", accent: "#b8860b", textPri: "#6b4c1e", isPremium: false },
  { id: "2",  name: "មាសប្រណិត",         bg: "linear-gradient(135deg, #1a1a0e, #3d3520)", accent: "#f59e0b", textPri: "#fef3c7", isPremium: true },
  { id: "3",  name: "ប្រពៃណីខ្មែរ",       bg: "linear-gradient(135deg, #2e1a1a, #601010)", accent: "#ef4444", textPri: "#fecaca", isPremium: false },
  { id: "4",  name: "សម័យទំនើប",         bg: "linear-gradient(135deg, #0e1a2e, #1e3a5e)", accent: "#3b82f6", textPri: "#bfdbfe", isPremium: false },
  { id: "5",  name: "រាជវាំង",           bg: "linear-gradient(135deg, #1a0e2e, #401060)", accent: "#a855f7", textPri: "#ddd6fe", isPremium: true },
  { id: "6",  name: "សួនច្បារ",           bg: "linear-gradient(135deg, #0e2e1a, #106030)", accent: "#22c55e", textPri: "#bbf7d0", isPremium: false },
  { id: "7",  name: "ផ្កាឈូកពណ៌ស",       bg: "linear-gradient(135deg, #1a1a1e, #404045)", accent: "#94a3b8", textPri: "#e2e8f0", isPremium: false },
  { id: "8",  name: "ភ្លើងបំភ្លឺ",        bg: "linear-gradient(135deg, #2e1a0e, #604010)", accent: "#fbbf24", textPri: "#fde68a", isPremium: true },
  { id: "9",  name: "ទឹកជ្រោះ",           bg: "linear-gradient(135deg, #0e2e2e, #106060)", accent: "#06b6d4", textPri: "#a5f3fc", isPremium: false },
  { id: "10", name: "ពណ៌ផ្កាឈូក",        bg: "linear-gradient(135deg, #2e0e2e, #601060)", accent: "#d946ef", textPri: "#f5d0fe", isPremium: true },
  { id: "11", name: "បុរាណ",              bg: "linear-gradient(135deg, #2e1a0e, #504010)", accent: "#d97706", textPri: "#fde68a", isPremium: false },
  { id: "12", name: "ទំនើប",              bg: "linear-gradient(135deg, #1a1a1e, #3e3e42)", accent: "#9ca3af", textPri: "#e5e7eb", isPremium: false },
];

const getTemplate = (id?: string | null) =>
  templateList.find((t) => t.id === (id || "1")) || templateList[0];

export default function InvitationsPage() {
  const { user } = useAuth();
  const limits = useLimits();
  const router = useRouter();
  const supabase = createClient();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateDialogInvitationId, setTemplateDialogInvitationId] = useState<string | null>(null);

  const atLimit = !limits.loading && limits.currentInvitations >= limits.maxInvitations;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // បង្កើតលិខិតអញ្ជើញដោយស្វ័យប្រវត្តិ បើអ្នកប្រើបានជ្រើសរើសគំរូពីទំព័រគំរូមុន
  useEffect(() => {
    const pendingTemplateId = localStorage.getItem("pendingTemplateId");
    if (pendingTemplateId && user && !loading && invitations.length === 0) {
      localStorage.removeItem("pendingTemplateId");
      createNewInvitation(pendingTemplateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, invitations]);

  const createNewInvitation = async (templateId?: string) => {
    if (!user) return;
    if (atLimit) {
      toast.error(`អ្នកបានបង្កើតចប់ហើយសម្រាប់កម្មវិធី ${limits.planName}`);
      return;
    }
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
    if (!confirm("តើអ្នកប្រាកដទេថាចង់លុបលិខិតអញ្ជើញនេះ?")) return;
    await supabase.from("invitations").delete().eq("id", id);
    setInvitations(invitations.filter((i) => i.id !== id));
    toast.success("លុបលិខិតអញ្ជើញរួចរាល់!");
  };

  const handlePublish = async (id: string) => {
    await supabase.from("invitations").update({ status: "published" }).eq("id", id);
    toast.success("ផ្សាយលិខិតអញ្ជើញបានជោគជ័យ!");
    fetchData();
  };

  const shareLink = (invitation: Invitation) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.slug || invitation.id}`);
    toast.success("ចម្លងតំណភ្ជាប់រួចរាល់!");
  };

  const openTemplateDialog = (invitationId: string) => {
    setTemplateDialogInvitationId(invitationId);
    setTemplateDialogOpen(true);
  };

  const handleTemplateChange = async (invitationId: string, templateId: string) => {
    const { error } = await supabase
      .from("invitations")
      .update({ template_id: templateId })
      .eq("id", invitationId);
    if (!error) {
      const t = templateList.find((t) => t.id === templateId);
      toast.success(`ប្តូរគំរូទៅ "${t?.name || templateId}" រួចរាល់`);
      setTemplateDialogOpen(false);
      setTemplateDialogInvitationId(null);
      fetchData();
    } else {
      toast.error("ប្តូរគំរូមិនបានជោគជ័យ សូមព្យាយាមម្តងទៀត");
    }
  };

  return (
    <div className="space-y-6">
      {/* ក្បាលទំព័រ */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">លិខិតអញ្ជើញរបស់ខ្ញុំ</h1>
          <p className="text-muted-foreground">គ្រប់គ្រងលិខិតអញ្ជើញពិធីមង្គលការរបស់អ្នក</p>
        </div>
        <Button
          className="gap-2 bg-gold-gradient text-white hover:opacity-90"
          onClick={() => createNewInvitation()}
          disabled={atLimit}
        >
          <Plus className="h-4 w-4" /> បង្កើតថ្មី
        </Button>
      </div>

      {!limits.loading && atLimit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-700 font-medium">
            អ្នកបានបង្កើតលិខិតអញ្ជើញចប់ហើយសម្រាប់កម្មវិធី {limits.planName}
          </p>
          <Link href="/billing">
            <Button className="mt-2 bg-gold-gradient text-white" size="sm">ជាន់ឡើង</Button>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
      ) : invitations.length === 0 ? (
        /* ស្ថានភាពទំព័រទំនេរ */
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">មិនមានលិខិតអញ្ជើញទេ។ សូមបង្កើតលិខិតអញ្ជើញដំបូងរបស់អ្នក!</p>
            <Button onClick={() => createNewInvitation()} className="gap-2 bg-gold-gradient text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> បង្កើតលិខិតអញ្ជើញ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.map((invitation) => {
            const t = getTemplate(invitation.template_id);
            const isPublished = invitation.status === "published";
            return (
              <Card key={invitation.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
                {/* កន្លែងមើលជាមុន */}
                <div className="aspect-video flex items-center justify-center" style={{ background: t.bg }}>
                  <div className="text-center px-4">
                    <p className="text-2xl font-bold" style={{ color: t.textPri }}>
                      {invitation.groom_name || "ឈ្មោះប្រុស"} & {invitation.bride_name || "ឈ្មោះស្រី"}
                    </p>
                    <p className="text-sm mt-1" style={{ color: t.textPri, opacity: 0.7 }}>
                      {new Date(invitation.wedding_date).toLocaleDateString("km-KH")}
                    </p>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* ព័ត៌មានស្ថានភាព និងគំរូ */}
                  <div className="flex items-center gap-2">
                    <Badge className={isPublished ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}>
                      {isPublished ? "បានផ្សាយ" : "ព្រៀង"}
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1" style={{ borderColor: t.accent + "40", color: t.accent }}>
                      {t.isPremium && <Crown className="h-3 w-3" />}
                      {t.name}
                    </Badge>
                  </div>

                  {/* ប៊ូតុងសំខាន់ */}
                  {isPublished ? (
                    <Button
                      className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => shareLink(invitation)}
                    >
                      <Share2 className="h-4 w-4" /> ចែករំលែក
                    </Button>
                  ) : (
                    <Link href={`/builder/${invitation.id}`}>
                      <Button className="w-full gap-2 bg-gold-gradient text-white hover:opacity-90">
                        <Edit className="h-4 w-4" /> កែប្រែ
                      </Button>
                    </Link>
                  )}

                  {/* ជួរប៊ូតុងបន្ទាប់បន្សំ */}
                  <div className="grid grid-cols-4 gap-2">
                    <Link href={`/invite/${invitation.slug || invitation.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                        {isPublished ? <ExternalLink className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        មើល
                      </Button>
                    </Link>

                    {!isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 text-xs border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => handlePublish(invitation.id)}
                      >
                        <Globe className="h-3 w-3" /> ផ្សាយ
                      </Button>
                    )}

                    {isPublished && (
                      <Link href={`/builder/${invitation.id}`}>
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                          <Edit className="h-3 w-3" /> កែប្រែ
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1 text-xs"
                      onClick={() => openTemplateDialog(invitation.id)}
                    >
                      <Palette className="h-3 w-3" /> គំរូ
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => deleteInvitation(invitation.id)}
                    >
                      <Trash2 className="h-3 w-3" /> លុប
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ប្រអប់ជ្រើសរើសគំរូ */}
      <Dialog
        open={templateDialogOpen}
        onOpenChange={(open) => {
          setTemplateDialogOpen(open);
          if (!open) setTemplateDialogInvitationId(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-secondary">ជ្រើសរើសគំរូ</DialogTitle>
            <DialogDescription>ជ្រើសរើសគំរូសម្រាប់លិខិតអញ្ជើញរបស់អ្នក</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {templateList.map((tpl) => {
              const currentId = invitations.find((i) => i.id === templateDialogInvitationId)?.template_id;
              const isSelected = (currentId || "1") === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    if (templateDialogInvitationId) handleTemplateChange(templateDialogInvitationId, tpl.id);
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${isSelected ? "" : "border-transparent"}`}
                  style={{ borderColor: isSelected ? tpl.accent : undefined }}
                >
                  <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2 p-3" style={{ background: tpl.bg }}>
                    <p className="text-sm font-bold text-center leading-snug" style={{ color: tpl.textPri }}>
                      ឈ្មោះប្រុស & ឈ្មោះស្រី
                    </p>
                    <div className="w-8 h-px" style={{ background: tpl.accent }} />
                    <p className="text-[10px]" style={{ color: tpl.textPri, opacity: 0.7 }}>
                      {new Date().toLocaleDateString("km-KH")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-1 px-2 py-1.5 bg-background/95 border-t" style={{ borderTopColor: tpl.accent + "40" }}>
                    <span className="text-xs font-medium flex items-center gap-1 truncate" style={{ color: tpl.accent }}>
                      {tpl.isPremium && <Crown className="h-3 w-3 shrink-0" />}
                      {tpl.name}
                    </span>
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ background: tpl.accent }}>
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
