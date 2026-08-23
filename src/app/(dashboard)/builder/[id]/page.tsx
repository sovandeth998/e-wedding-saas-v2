"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isBuiltinMusic } from "@/lib/wedding-music";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Save, Eye, Music, MapPin, Heart, Image as ImageIcon, CreditCard, Trash2, Check, Copy, Video, Shirt, Clock, CalendarDays, CloudUpload, CircleCheck, Loader2, Globe, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import type { Invitation, GalleryPhoto } from "@/types/database";

const steps = [
  { id: 1, icon: Heart, title: "ព័ត៌មានកូនកំលោះ-កូនក្រមុំ", short: "ព័ត៌មាន" },
  { id: 2, icon: MapPin, title: "ទីតាំង និងពេលវេលា", short: "ទីតាំង" },
  { id: 3, icon: ImageIcon, title: "រូបថត", short: "រូបភាព" },
  { id: 4, icon: CreditCard, title: "QR Code ចំណងដៃ", short: "QR Code" },
  { id: 5, icon: Sparkles, title: "តន្ត្រី និងការរចនា", short: "រចនា" },
  { id: 6, icon: Eye, title: "មើល និងផ្សាយ", short: "ផ្សាយ" },
];

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [invitation, setInvitation] = useState<Partial<Invitation>>({
    groom_name: "",
    groom_name_kh: "",
    bride_name: "",
    bride_name_kh: "",
    wedding_date: "",
    ceremony_time: "",
    reception_time: "",
    venue_name: "",
    venue_address: "",
    venue_map_url: "",
    story: "",
    quote: "",
    background_music: "",
    video_url: "",
    timeline: [],
    dress_code: "",
    dress_code_color: "#b8860b",
    status: "draft",
  });
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("1");
  const [dbTemplates, setDbTemplates] = useState<Array<{ code: string; name: string; category: string; is_premium: boolean; config: any }>>([]);

  const loadedRef = useRef(false);
  const lastSnapshotRef = useRef("");
  const currentStepRef = useRef(1);
  currentStepRef.current = currentStep;

  const isBirthday = invitation.type === "birthday";

  const templateList = dbTemplates.map((tpl) => {
    const c = typeof tpl.config === "string" ? JSON.parse(tpl.config) : (tpl.config || {});
    return {
      id: tpl.code,
      name: tpl.name,
      category: tpl.category,
      isPremium: tpl.is_premium,
      bg: c.bg || "linear-gradient(135deg, #1a1a1e, #2e2e32, #3e3e42)",
      textPri: c.textPri || "#e5e7eb",
      accent: c.accent || "#9ca3af",
      btnFrom: c.btnFrom || "#6b7280",
      btnTo: c.btnTo || "#4b5563",
    };
  });

  const activeTpl =
    templateList.find((t) => t.id === selectedTemplate) ||
    templateList[0] || { id: "1", name: "", category: "", isPremium: false, bg: "#fdf8f0", textPri: "#6b4c1e", accent: "#b8860b", btnFrom: "#b8860b", btnTo: "#8b6508" };

  const timelinePresets = [
    { title: "ពិធីសូត្រធម៌", description: "សូត្រធម៌ពីព្រះសង្ឃ" },
    { title: "ពិធីក្រុងពរ", description: "ក្រុងពរពីអ្នកចាស់ទុំ" },
    { title: "ពិធីភ្ជាប់ពាក្យ", description: "ពិធីភ្ជាប់ពាក្យរវាងគ្រួសារ" },
    { title: "ពិធីស្រាយផ្កាឈូក", description: "ស្រាយផ្កាឈូកពីកូនក្រមុំ" },
    { title: "ពិធីបញ្ចូលសំពត់", description: "ពិធីបញ្ចូលសំពត់ស្វាមី" },
    { title: "ពិធីច្រត់ក្បាលក្រាប", description: "ពិធីច្រត់ក្បាលក្រាប" },
    { title: "ពិធីផ្សំដៃ", description: "ពិធីផ្សំដៃគូស្នេហ៍" },
    { title: "ពិធីជួបជុំភ្ញៀវ", description: "ជួបជុំភ្ញៀវការ" },
    { title: "ពិធីកាត់ស្ករស", description: "ពិធីកាត់ស្ករស" },
    { title: "ពិធីជប់លៀង", description: "ពិធីជប់លៀងរាត្រី" },
  ];

  const musicPresets = [
    { id: "wedding_classical",  title: "🎵 Wedding March — ពិធីរៀបការ" },
    { id: "wedding_romantic",   title: "🎵 Romantic Love — ស្នេហ៍រ៉ូមែនទិច" },
    { id: "wedding_traditional",title: "🎵 Traditional Khmer — ភ្លេងប្រពៃណី" },
    { id: "wedding_celebration",title: "🎵 Celebration — ការអបអរ" },
    { id: "wedding_gentle",     title: "🎵 Gentle Piano — ស្តើងរ៉ូយ៉ាង" },
    { id: "wedding_ethereal",   title: "🎵 Ethereal — ឋានសួគ៌" },
  ];

  useEffect(() => {
    if (!params.id) return;
    loadedRef.current = false;

    (async () => {
      const { data } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setInvitation(data);
        setSelectedTemplate(data.template_id || "1");
        lastSnapshotRef.current = JSON.stringify({ i: data, t: data.template_id || "1", q: "" });
      }

      const { data: photos } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("invitation_id", params.id)
        .order("order_index");

      if (photos) setGalleryPhotos(photos);

      const { data: qr } = await supabase
        .from("qr_codes")
        .select("qr_image_url")
        .eq("invitation_id", params.id)
        .single();

      if (qr?.qr_image_url) {
        setQrImageUrl(qr.qr_image_url);
        lastSnapshotRef.current = JSON.stringify({ i: data, t: data?.template_id || "1", q: qr.qr_image_url });
      }

      const { data: tpls } = await supabase
        .from("templates")
        .select("code, name, category, is_premium, config")
        .order("code");
      if (tpls) setDbTemplates(tpls);

      requestAnimationFrame(() => { loadedRef.current = true; });
    })();
  }, [params.id]);

  const updateField = (field: string, value: string) => {
    setInvitation((prev) => ({ ...prev, [field]: value }));
  };

  const checkStepComplete = (step: number) => {
    switch (step) {
      case 1: return !!(invitation.groom_name || invitation.groom_name_kh) && (isBirthday || !!(invitation.bride_name || invitation.bride_name_kh));
      case 2: return !!invitation.wedding_date && !!invitation.venue_name;
      case 3: return galleryPhotos.length > 0;
      case 4: return !!qrImageUrl;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  const completedCount = steps.filter((s) => checkStepComplete(s.id)).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const persist = async (withToast: boolean) => {
    const { error } = await supabase
      .from("invitations")
      .update({ ...invitation, template_id: selectedTemplate })
      .eq("id", params.id);

    if (!error && qrImageUrl) {
      const { data: existingQr } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("invitation_id", params.id)
        .single();

      if (existingQr) {
        await supabase.from("qr_codes").update({ qr_image_url: qrImageUrl }).eq("id", existingQr.id);
      } else {
        await supabase.from("qr_codes").insert({
          invitation_id: params.id,
          type: "gift",
          qr_image_url: qrImageUrl,
        });
      }
    }

    if (withToast) {
      if (!error) toast.success("បានរក្សាទុកជោគជ័យ!");
      else toast.error("បរាជ័យក្នុងការរក្សាទុក");
    }
    return !error;
  };

  // Track unsaved changes (manual save only)
  useEffect(() => {
    if (!loadedRef.current) return;
    const snap = JSON.stringify({ i: invitation, t: selectedTemplate, q: qrImageUrl });
    setDirty(snap !== lastSnapshotRef.current);
  }, [invitation, selectedTemplate, qrImageUrl]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const saveInvitation = async () => {
    setSaving(true);
    await persist(true);
    const snap = JSON.stringify({ i: invitation, t: selectedTemplate, q: qrImageUrl });
    lastSnapshotRef.current = snap;
    setDirty(false);
    setSaving(false);
  };

  const handleGalleryUpload = async (url: string) => {
    if (!url) return;
    const { data, error } = await supabase
      .from("gallery_photos")
      .insert({
        invitation_id: params.id,
        url,
        order_index: galleryPhotos.length,
      })
      .select()
      .single();

    if (!error && data) {
      setGalleryPhotos((prev) => [...prev, data]);
    }
  };

  const removeGalleryPhoto = async (photoId: string) => {
    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", photoId);

    if (!error) {
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const publishInvitation = async () => {
    if (!checkStepComplete(1)) {
      toast.error("សូមបញ្ចូលឈ្មោះកូនកំលោះ និងកូនក្រមុំជាមុនសិន");
      setCurrentStep(1);
      return;
    }
    if (!checkStepComplete(2)) {
      toast.error("សូមបញ្ចូលថ្ងៃរៀបការ និងឈ្មោះទីតាំងជាមុនសិន");
      setCurrentStep(2);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("invitations")
      .update({
        ...invitation,
        template_id: selectedTemplate,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (!error) {
      toast.success("បានផ្សាយលិខិតអញ្ជើញ!");
      router.push("/invitations");
    } else {
      toast.error("បរាជ័យក្នុងការផ្សាយ");
    }
    setSaving(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.slug || params.id}`);
    toast.success("បានចម្លង Link!");
  };

  const SectionCard = ({ icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="p-5 bg-gold-50/40 rounded-2xl border border-gold-200/50 space-y-4">
      <h3 className="font-semibold text-secondary flex items-center gap-2">
        {React.createElement(icon, { className: "h-4 w-4 text-primary" })} {title}
      </h3>
      {children}
    </div>
  );

  const StepperButton = ({ step }: { step: (typeof steps)[0] }) => {
    const done = checkStepComplete(step.id);
    const active = currentStep === step.id;
    return (
      <button
        onClick={() => setCurrentStep(step.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
          active
            ? "bg-gold-gradient text-white font-medium shadow-md"
            : done
            ? "text-green-700 hover:bg-green-50"
            : "text-muted-foreground hover:bg-gold-50"
        }`}
      >
        <span className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs ${
          active ? "bg-white/20 text-white" : done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
        }`}>
          {done && !active ? <Check className="h-3.5 w-3.5" /> : <step.icon className="h-3.5 w-3.5" />}
        </span>
        <span className="truncate">{step.short}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/invitations">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gold-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-secondary truncate max-w-[280px] md:max-w-none">
              {(invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ")}
              <span className="mx-1 text-primary">❦</span>
              {(invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ")}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {saving ? (
                <span className="inline-flex items-center gap-1 text-orange-500"><Loader2 className="h-3 w-3 animate-spin" /> កំពុងរក្សាទុក...</span>
              ) : dirty ? (
                <span className="inline-flex items-center gap-1 text-orange-500"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> មិនទាន់រក្សាទុក — ចុច "រក្សាទុក"</span>
              ) : (
                <span>ជំហាន {currentStep} / {steps.length}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/preview/${params.id}`} target="_blank">
            <Button variant="outline" size="sm" className="border-gold-200 text-secondary hover:bg-gold-50 gap-1.5 h-9">
              <Eye className="h-4 w-4" /> Preview
            </Button>
          </Link>
          <Button variant="outline" onClick={saveInvitation} disabled={saving} className="border-gold-200 text-secondary hover:bg-gold-50 gap-1.5 h-9">
            <Save className="h-4 w-4" /> {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </Button>
        </div>
      </div>

      {/* Mobile step chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden -mx-1 px-1">
        {steps.map((step) => {
          const done = checkStepComplete(step.id);
          const active = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                active ? "bg-gold-gradient text-white border-transparent shadow" : done ? "border-green-200 text-green-700 bg-green-50" : "border-gold-200 text-muted-foreground bg-white"
              }`}
            >
              {done && !active ? <Check className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
              {step.short}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px] gap-6 items-start">
        {/* Sidebar */}
        <aside className="hidden lg:block sticky top-24 space-y-4">
          <Card className="border-gold-200/60 shadow-sm">
            <CardContent className="p-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-secondary">ដំណើរការ</span>
                  <span className="text-xs font-bold text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-gold-gradient h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="space-y-1 pt-1">
                {steps.map((step) => <StepperButton key={step.id} step={step} />)}
              </div>
            </CardContent>
          </Card>

          {invitation.status === "published" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <Globe className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-green-700">បានផ្សាយរួចរាល់</p>
              <button onClick={copyLink} className="text-[11px] text-green-600 underline mt-0.5">ចម្លង Link លិខិតអញ្ជើញ</button>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <Card className="border-gold-200/60 shadow-sm">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-100">
                <div className="h-10 w-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-sm shrink-0">
                  {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 text-white" })}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-primary/60 font-medium">ជំហានទី {currentStep}</p>
                  <h2 className="font-bold text-secondary leading-tight">{steps[currentStep - 1].title}</h2>
                </div>
                {!checkStepComplete(currentStep) && currentStep <= 4 && (
                  <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full shrink-0">មិនទាន់ពេញលេញ</span>
                )}
              </div>

              <div className="space-y-5">
                {/* Step 1: Couple / Celebrant Info */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <SectionCard icon={Sparkles} title="ប្រភេទពិធី">
                      <div className="grid grid-cols-2 gap-3">
                        {[{ v: "wedding", label: "💒 ការរៀបការ" }, { v: "birthday", label: "🎂 ខួបកំណើត" }].map((opt) => (
                          <button key={opt.v} type="button"
                            onClick={() => setInvitation((prev) => ({ ...prev, type: opt.v as any }))}
                            className={`h-11 rounded-xl text-sm font-medium border transition-all ${invitation.type === opt.v ? "bg-gold-gradient text-white border-transparent shadow-md" : "bg-white border-gold-200 text-secondary hover:border-gold-300"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </SectionCard>
                    <div className={isBirthday ? "" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
                      <SectionCard icon={Heart} title={isBirthday ? "ឈ្មោះអ្នកកំណើត" : "កូនកំលោះ"}>
                        <div className="space-y-2">
                          <Label className="text-secondary">ឈ្មោះ (ខ្មែរ)</Label>
                          <Input value={invitation.groom_name_kh || ""} onChange={(e) => updateField("groom_name_kh", e.target.value)} placeholder={isBirthday ? "ឧ. សុវណ្ណដេត" : "ឧ. សុវណ្ណដេត"} className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-secondary">ឈ្មោះ (អង់គ្លេស)</Label>
                          <Input value={invitation.groom_name || ""} onChange={(e) => updateField("groom_name", e.target.value)} placeholder="ឧ. Sovandeth" className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-secondary">រូបថត</Label>
                          <FileUpload bucket="uploads" path={`invitations/${params.id}/groom`} onUpload={(url) => updateField("groom_photo", url)} className="aspect-square max-w-[160px]" />
                        </div>
                      </SectionCard>
                      {!isBirthday && (
                        <SectionCard icon={Heart} title="កូនក្រមុំ">
                          <div className="space-y-2">
                            <Label className="text-secondary">ឈ្មោះ (ខ្មែរ)</Label>
                            <Input value={invitation.bride_name_kh || ""} onChange={(e) => updateField("bride_name_kh", e.target.value)} placeholder="ឧ. ដារ៉ា" className="border-gold-200 focus-visible:ring-primary bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-secondary">ឈ្មោះ (អង់គ្លេស)</Label>
                            <Input value={invitation.bride_name || ""} onChange={(e) => updateField("bride_name", e.target.value)} placeholder="ឧ. Dara" className="border-gold-200 focus-visible:ring-primary bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-secondary">រូបថត</Label>
                            <FileUpload bucket="uploads" path={`invitations/${params.id}/bride`} onUpload={(url) => updateField("bride_photo", url)} className="aspect-square max-w-[160px]" />
                          </div>
                        </SectionCard>
                      )}
                    </div>
                    {!isBirthday && (
                      <SectionCard icon={Heart} title="ពាក្យពេចន៍ និងរឿងស្នេហា">
                        <div className="space-y-2">
                          <Label className="text-secondary">ពាក្យពេចន៍រៀបការ</Label>
                          <Input value={invitation.quote || ""} onChange={(e) => updateField("quote", e.target.value)} placeholder="ឧ. រួមគ្នាអស់មួយជីវិត..." className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-secondary">រឿងស្នេហារបស់យើង</Label>
                          <Textarea value={invitation.story || ""} onChange={(e) => updateField("story", e.target.value)} placeholder="ប្រាប់រឿងស្នេហារបស់អ្នក..." rows={4} className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                      </SectionCard>
                    )}
                  </div>
                )}

                {/* Step 2: Venue & Time */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                      <SectionCard icon={CalendarDays} title="ពេលវេលា">
                        <div className="space-y-2">
                          <Label className="text-secondary">{isBirthday ? "ថ្ងៃខួបកំណើត" : "ថ្ងៃរៀបការ"} *</Label>
                        <Input type="datetime-local" value={invitation.wedding_date ? new Date(invitation.wedding_date).toISOString().slice(0, 16) : ""} onChange={(e) => updateField("wedding_date", new Date(e.target.value).toISOString())} className="border-gold-200 focus-visible:ring-primary bg-white" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-secondary">ម៉ោងពិធីជប់លៀង</Label>
                          <Input value={invitation.ceremony_time || ""} onChange={(e) => updateField("ceremony_time", e.target.value)} placeholder="ឧ. 7:00 ព្រឹក - 9:00 ព្រឹក" className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-secondary">ម៉ោងពិធីស្វាគមន៍</Label>
                          <Input value={invitation.reception_time || ""} onChange={(e) => updateField("reception_time", e.target.value)} placeholder="ឧ. 11:00 ព្រឹក - 2:00 ថ្ងៃត្រង់" className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                      </div>
                    </SectionCard>
                    <SectionCard icon={MapPin} title="ទីតាំង">
                      <div className="space-y-2">
                        <Label className="text-secondary">ឈ្មោះទីតាំង *</Label>
                        <Input value={invitation.venue_name || ""} onChange={(e) => updateField("venue_name", e.target.value)} placeholder="ឧ. Diamond Ballroom" className="border-gold-200 focus-visible:ring-primary bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-secondary">អាសយដ្ឋានទីតាំង</Label>
                        <Textarea value={invitation.venue_address || ""} onChange={(e) => updateField("venue_address", e.target.value)} placeholder="អាសយដ្ឋានពេញ..." rows={2} className="border-gold-200 focus-visible:ring-primary bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-secondary">Link Google Maps</Label>
                        <Input value={invitation.venue_map_url || ""} onChange={(e) => updateField("venue_map_url", e.target.value)} placeholder="https://maps.google.com/..." className="border-gold-200 focus-visible:ring-primary bg-white" />
                      </div>
                    </SectionCard>
                  </div>
                )}

                {/* Step 3: Gallery */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gold-50/40 rounded-2xl border border-gold-200/50 text-sm text-muted-foreground">
                      បញ្ចូលរូបថត Pre-wedding ដើម្បីបង្ហាញក្នុងវិចិត្រសាល។ រូបដំបូងនឹងប្រើជា preview ពេល share link!
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryPhotos.map((photo, idx) => (
                        <div key={photo.id} className="relative group aspect-square">
                          <img src={photo.url} alt={photo.caption || "រូបភាព"} className="w-full h-full object-cover rounded-xl border border-gold-200" />
                          {idx === 0 && (
                            <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">Preview share</span>
                          )}
                          <button type="button" onClick={() => removeGalleryPhoto(photo.id)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <FileUpload bucket="uploads" path={`invitations/${params.id}/gallery`} onUpload={handleGalleryUpload} className="aspect-square" />
                    </div>
                  </div>
                )}

                {/* Step 4: Gift QR */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <SectionCard icon={QrCode} title="QR Code ចំណងដៃ">
                        <p className="text-sm text-muted-foreground">បញ្ចូលរូប KHQR/ABA របស់អ្នក — ភ្ញៀវនឹងឃើញនៅផ្នែកចំណងដៃក្នុងលិខិតអញ្ជើញ។</p>
                        <FileUpload bucket="uploads" path={`invitations/${params.id}/qr`} onUpload={(url) => setQrImageUrl(url)} className="max-w-[220px]" />
                        {qrImageUrl && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gold-200">
                            <img src={qrImageUrl} alt="QR Code" className="w-20 h-20 rounded-lg object-cover" />
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <CircleCheck className="h-4 w-4" /> បានដាក់រួចរាល់
                            </div>
                          </div>
                        )}
                      </SectionCard>
                      <SectionCard icon={Sparkles} title="គន្លឹះ">
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                          <li>ប្រើ KHQR មួយសម្រាប់គ្រប់ធនាគារ</li>
                          <li>សរសេរចំណាំណែនាំឱ្យភ្ញៀវ screenshot បន្ទាប់ពីបង់</li>
                          <li>អាចផ្លាស់ប្តូររូបបានគ្រប់ពេល</li>
                        </ul>
                      </SectionCard>
                    </div>
                  </div>
                )}

                {/* Step 5: Music & Design */}
                {currentStep === 5 && (
                  <div className="space-y-5">
                    <SectionCard icon={Music} title="តន្ត្រីផ្ទៃខាងក្រោយ">
                      <select
                        value={invitation.background_music || ""}
                        onChange={(e) => updateField("background_music", e.target.value)}
                        className="w-full border border-gold-200 rounded-lg px-3 py-2 text-sm bg-white text-secondary focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="">គ្មានតន្ត្រី</option>
                        {musicPresets.map((m) => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                        <option value="__custom__">🔗 បញ្ចូល URL ផ្ទាល់...</option>
                      </select>
                      {invitation.background_music && invitation.background_music !== "__custom__" && !isBuiltinMusic(invitation.background_music) && (
                        <audio controls src={invitation.background_music} className="w-full h-10 rounded-lg" style={{ filter: "sepia(20%) saturate(70%)" }} />
                      )}
                      {invitation.background_music && isBuiltinMusic(invitation.background_music) && (
                        <p className="text-xs text-muted-foreground bg-gold-50 rounded-lg p-2">🎵 តន្ត្រីនឹងចាក់ដោយស្វ័យប្រវត្តិនៅពេលភ្ញៀវបើកលិខិត</p>
                      )}
                      {(!invitation.background_music || invitation.background_music === "__custom__") && (
                        <Input value={invitation.background_music === "__custom__" ? "" : (invitation.background_music || "")} onChange={(e) => updateField("background_music", e.target.value)} placeholder="បញ្ចូល URL តន្ត្រី (MP3)..." className="border-gold-200 focus-visible:ring-primary bg-white" />
                      )}
                    </SectionCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <SectionCard icon={Video} title="វីដេអូ">
                        <div className="space-y-2">
                          <Label className="text-secondary">URL វីដេអូរៀបការ</Label>
                          <Input value={invitation.video_url || ""} onChange={(e) => updateField("video_url", e.target.value)} placeholder="YouTube embed URL..." className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                      </SectionCard>
                      <SectionCard icon={Shirt} title="ការស្លៀកពាក់">
                        <div className="space-y-2">
                          <Label className="text-secondary">សេចក្ដីណែនាំ</Label>
                          <Input value={invitation.dress_code || ""} onChange={(e) => updateField("dress_code", e.target.value)} placeholder="ឧ. ពណ៌ស្វាយ, ផ្លូវការ" className="border-gold-200 focus-visible:ring-primary bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-secondary">ពណ៌សំខាន់</Label>
                          <div className="flex items-center gap-2">
                            <Input type="color" value={invitation.dress_code_color || "#b8860b"} onChange={(e) => updateField("dress_code_color", e.target.value)} className="w-12 h-10 p-1 cursor-pointer border-gold-200" />
                            <Input value={invitation.dress_code_color || "#b8860b"} onChange={(e) => updateField("dress_code_color", e.target.value)} placeholder="#b8860b" className="border-gold-200 focus-visible:ring-primary bg-white" />
                          </div>
                        </div>
                      </SectionCard>
                    </div>

                    <SectionCard icon={Clock} title="កាលវិភាគពិធី">
                      <p className="text-sm text-muted-foreground -mt-1">ជ្រើសរើសពិធី ឬសរសេរថ្មី។ អាចលុបបាន。</p>
                      {((invitation.timeline || []) as any[]).map((ev: any, i: number) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-gold-100 space-y-2">
                          <div className="flex gap-2 items-center">
                            <Input value={ev.time || ""} onChange={(e) => {
                              const tl = [...(invitation.timeline || []) as any[]];
                              tl[i] = { ...tl[i], time: e.target.value };
                              updateField("timeline" as any, tl as any);
                            }} placeholder="ម៉ោង (ឧ. 07:00)" className="w-28 border-gold-200 focus-visible:ring-primary text-sm" />
                            <select
                              value={ev.title || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const tl = [...(invitation.timeline || []) as any[]];
                                if (val === "__custom__") {
                                  tl[i] = { ...tl[i], title: "" };
                                } else {
                                  const preset = timelinePresets.find((p) => p.title === val);
                                  tl[i] = { ...tl[i], title: val, description: preset?.description || tl[i].description || "" };
                                }
                                updateField("timeline" as any, tl as any);
                              }}
                              className="flex-1 border border-gold-200 rounded-lg px-3 py-2 text-sm bg-white text-secondary focus:ring-2 focus:ring-primary outline-none"
                            >
                              <option value="">ជ្រើសរើសពិធី...</option>
                              {timelinePresets.map((p) => (
                                <option key={p.title} value={p.title}>{p.title}</option>
                              ))}
                              <option value="__custom__">✍️ សរសេរផ្ទាល់...</option>
                            </select>
                            <Button variant="ghost" size="icon" onClick={() => {
                              const tl = [...(invitation.timeline || []) as any[]];
                              tl.splice(i, 1);
                              updateField("timeline" as any, tl as any);
                            }} className="text-red-500 shrink-0 h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          {(ev.title === "" || !timelinePresets.find((p) => p.title === ev.title)) && (
                            <Input value={ev.title || ""} onChange={(e) => {
                              const tl = [...(invitation.timeline || []) as any[]];
                              tl[i] = { ...tl[i], title: e.target.value };
                              updateField("timeline" as any, tl as any);
                            }} placeholder="ឈ្មោះពិធី..." className="border-gold-200 focus-visible:ring-primary text-sm" />
                          )}
                          <Input value={ev.description || ""} onChange={(e) => {
                            const tl = [...(invitation.timeline || []) as any[]];
                            tl[i] = { ...tl[i], description: e.target.value };
                            updateField("timeline" as any, tl as any);
                          }} placeholder="ពិស្តារ (ជម្រើស)..." className="border-gold-200 focus-visible:ring-primary text-sm" />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => {
                        const tl = [...(invitation.timeline || []) as any[], { time: "", title: "", description: "" }];
                        updateField("timeline" as any, tl as any);
                      }} className="border-gold-200 text-secondary hover:bg-gold-50 gap-1">+ បន្ថែមពិធី</Button>
                    </SectionCard>

                    <SectionCard icon={Sparkles} title="ជ្រើសរើសគំរូ">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {templateList.map((tpl) => (
                          <button
                            key={tpl.id}
                            onClick={() => handleSelectTemplate(tpl.id)}
                            className={`relative group rounded-2xl p-3 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                              selectedTemplate === tpl.id ? "ring-2 ring-primary shadow-lg bg-gold-50" : "bg-white hover:bg-gold-50/50"
                            }`}
                          >
                            {selectedTemplate === tpl.id && (
                              <div className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-gold-gradient flex items-center justify-center shadow-md">
                                <Check className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                            {tpl.isPremium && (
                              <div className="absolute -top-2 left-3 z-10">
                                <span className="text-[9px] font-bold bg-gold-gradient text-white px-2 py-0.5 rounded-full shadow">Premium</span>
                              </div>
                            )}
                            <div className="mx-auto w-24 aspect-[3/5] rounded-[1rem] border-4 border-secondary/90 shadow overflow-hidden relative transition-transform duration-300 group-hover:scale-[1.03]">
                              <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ background: tpl.bg }}>
                                <Heart className="h-4 w-4 mb-1.5" style={{ color: tpl.accent }} fill={tpl.accent} />
                                <p className="text-[6px] tracking-[0.2em] uppercase mb-1" style={{ color: tpl.accent }}>Wedding</p>
                                <p className="text-[9px] font-bold" style={{ color: tpl.textPri }}>{invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}</p>
                                <p className="text-[7px] font-semibold my-0.5" style={{ color: tpl.accent }}>&amp;</p>
                                <p className="text-[9px] font-bold mb-2" style={{ color: tpl.textPri }}>{invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}</p>
                                <span className="text-[6px] px-2 py-0.5 rounded-full font-medium text-white" style={{ background: `linear-gradient(135deg, ${tpl.btnFrom}, ${tpl.btnTo})` }}>បើកលិខិត</span>
                              </div>
                            </div>
                            <p className="text-xs font-bold text-secondary mt-2 truncate">{tpl.name}</p>
                          </button>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                )}

                {/* Step 6: Preview & Publish */}
                {currentStep === 6 && (
                  <div className="space-y-5">
                    <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-8 text-center border border-gold-200/50 relative overflow-hidden">
                      <div className="absolute inset-3 rounded-xl border pointer-events-none border-gold-300/50" />
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
                          <Heart className="h-7 w-7 text-white fill-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-secondary">
                          {invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"} ❦ {invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}
                        </h2>
                        <p className="text-muted-foreground">
                          {invitation.wedding_date
                            ? new Date(invitation.wedding_date).toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                            : "កំណត់ពេលក្រោយ"}
                        </p>
                        {invitation.venue_name && <p className="text-sm text-muted-foreground mt-2">{invitation.venue_name}</p>}
                        {invitation.quote && <p className="italic text-muted-foreground mt-4">&ldquo;{invitation.quote}&rdquo;</p>}
                      </div>
                    </div>

                    <div className="p-4 bg-gold-50/40 border border-gold-200 rounded-2xl">
                      <p className="font-medium mb-2 text-secondary text-sm">Link លិខិតអញ្ជើញ</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs md:text-sm font-mono text-primary bg-white p-2.5 rounded-lg border border-gold-200 truncate">
                          {typeof window !== "undefined" ? window.location.origin : ""}/invite/{invitation.slug || "..."}
                        </code>
                        <Button size="sm" variant="outline" onClick={copyLink} className="border-gold-200 text-primary hover:bg-gold-50 shrink-0">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {(() => {
                      const ready = checkStepComplete(1) && checkStepComplete(2);
                      return !ready ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
                          ⚠️ សូមបំពេញ <b>ឈ្មោះគូស្នេហ៍</b> (ជំហាន ១) និង <b>ថ្ងៃរៀបការ + ទីតាំង</b> (ជំហាន ២) មុនផ្សាយ
                        </div>
                      ) : null;
                    })()}

                    {invitation.status === "published" && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="font-medium text-green-800">លិខិតអញ្ជើញនេះកំពុងដំណើរការ!</p>
                        <p className="text-sm text-green-600 mt-1">ចែករំលែក Link ទៅភ្ញៀវរបស់អ្នក។</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-5 mt-2 border-t border-gold-100">
                  <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1} className="border-gold-200 text-secondary hover:bg-gold-50">
                    <ArrowLeft className="h-4 w-4 mr-2" /> ក្រោយ
                  </Button>
                  {currentStep < 6 ? (
                    <Button onClick={() => setCurrentStep((s) => Math.min(6, s + 1))} className="bg-gold-gradient text-white hover:opacity-90">
                      បន្ទាប់ <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={publishInvitation} disabled={saving} className="bg-gold-gradient text-white hover:opacity-90 min-w-[180px]">
                      {saving ? "កំពុងផ្សាយ..." : invitation.status === "published" ? "ផ្សាយឡើងវិញ" : "ផ្សាយលិខិតអញ្ជើញ"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Live Preview */}
        <aside className="hidden xl:block sticky top-24">
          <p className="text-[11px] uppercase tracking-widest text-center text-muted-foreground mb-3">👀 មើលដូចភ្ញៀវ</p>
          <div className="mx-auto w-[270px] rounded-[2.2rem] border-[10px] border-secondary/90 shadow-2xl overflow-hidden bg-black">
            <div className="aspect-[9/17] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden" style={{ background: activeTpl.bg }}>
              <div className="absolute inset-2 rounded-2xl border pointer-events-none opacity-70" style={{ borderColor: activeTpl.accent + "45" }} />
              {(invitation.groom_photo || invitation.bride_photo) && (
                <div className="flex -space-x-4 mb-4 relative z-[1]">
                  {invitation.groom_photo && <img src={invitation.groom_photo} alt="" className="h-12 w-12 rounded-full object-cover border-2" style={{ borderColor: activeTpl.accent }} />}
                  {invitation.bride_photo && <img src={invitation.bride_photo} alt="" className="h-12 w-12 rounded-full object-cover border-2" style={{ borderColor: activeTpl.accent }} />}
                </div>
              )}
              <p className="text-[8px] uppercase tracking-[0.35em] mb-2 relative z-[1]" style={{ color: activeTpl.accent }}>
                Wedding Invitation
              </p>
              <p className="text-base font-bold leading-snug relative z-[1]" style={{ color: activeTpl.textPri }}>
                {invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}
              </p>
              <p className="text-xs font-semibold my-1 relative z-[1]" style={{ color: activeTpl.accent }}>❦</p>
              <p className="text-base font-bold mb-3 relative z-[1]" style={{ color: activeTpl.textPri }}>
                {invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}
              </p>
              <div className="flex items-center justify-center gap-2 my-2 relative z-[1]">
                <span className="h-px w-8" style={{ background: activeTpl.accent + "80" }} />
                <span className="h-1.5 w-1.5 rotate-45" style={{ background: activeTpl.accent }} />
                <span className="h-px w-8" style={{ background: activeTpl.accent + "80" }} />
              </div>
              <p className="text-[11px] relative z-[1]" style={{ color: activeTpl.textPri, opacity: 0.85 }}>
                {invitation.wedding_date
                  ? new Date(invitation.wedding_date).toLocaleDateString("km-KH", { year: "numeric", month: "long", day: "numeric" })
                  : "— — —"}
              </p>
              {invitation.venue_name && (
                <p className="text-[10px] mt-1.5 relative z-[1] truncate max-w-full" style={{ color: activeTpl.textPri, opacity: 0.7 }}>
                  📍 {invitation.venue_name}
                </p>
              )}
              {invitation.quote && (
                <p className="text-[9px] italic mt-3 line-clamp-2 relative z-[1]" style={{ color: activeTpl.textPri, opacity: 0.65 }}>
                  &ldquo;{invitation.quote}&rdquo;
                </p>
              )}
              <span className="mt-5 text-[10px] px-4 py-1.5 rounded-full font-medium text-white relative z-[1]" style={{ background: `linear-gradient(135deg, ${activeTpl.btnFrom}, ${activeTpl.btnTo})` }}>
                បើកលិខិតអញ្ជើញ
              </span>
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-3">ធៀបគំរូ៖ <b className="text-secondary">{activeTpl.name || "—"}</b></p>
        </aside>
      </div>

      {/* Sticky mobile save bar */}
      <div className="fixed bottom-4 inset-x-4 z-40 xl:hidden">
        <div className="mx-auto max-w-md bg-secondary/95 backdrop-blur text-white rounded-full shadow-2xl px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="text-xs flex items-center gap-1.5 min-w-0">
            {saving ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> <span className="truncate">កំពុងរក្សាទុក...</span></>
            ) : dirty ? (
              <><span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" /> <span className="truncate">មិនទាន់រក្សាទុក</span></>
            ) : (
              <><CloudUpload className="h-3.5 w-3.5 opacity-60 shrink-0" /> <span className="truncate">ជំហាន {currentStep}/{steps.length} • {progress}%</span></>
            )}
          </span>
          {currentStep < 6 ? (
            <Button size="sm" onClick={() => setCurrentStep((s) => Math.min(6, s + 1))} className="bg-gold-gradient text-white rounded-full h-8 px-4 shrink-0">
              បន្ទាប់ <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={publishInvitation} disabled={saving} className="bg-gold-gradient text-white rounded-full h-8 px-4 shrink-0">
              ផ្សាយ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
