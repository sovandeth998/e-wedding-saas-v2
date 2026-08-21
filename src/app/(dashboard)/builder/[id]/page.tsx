"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Save, Eye, Music, MapPin, Users, Heart, Image, CreditCard, Trash2, Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import type { Invitation, GalleryPhoto } from "@/types/database";

const steps = [
  { id: 1, icon: Heart, title: "ព័ត៌មានកូនកំលោះ-កូនក្រមុំ", short: "ព័ត៌មាន" },
  { id: 2, icon: MapPin, title: "ទីតាំង និងពេលវេលា", short: "ទីតាំង" },
  { id: 3, icon: Image, title: "រូបថត", short: "រូបភាព" },
  { id: 4, icon: CreditCard, title: "QR Code ចំណងដៃ", short: "QR Code" },
  { id: 5, icon: Music, title: "តន្ត្រី និងការរចនា", short: "រចនា" },
  { id: 6, icon: Eye, title: "មើល និងផ្សាយ", short: "ផ្សាយ" },
];

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
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
    status: "draft",
  });
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("1");

  const templateList = [
    { id: "1",  name: "ផ្កាឈូករ៉ូមែនទិច", category: "modern", isPremium: false, bg: "linear-gradient(180deg, #fdf8f0, #f5edd8, #efe4c8)", textPri: "#6b4c1e", accent: "#b8860b", btnFrom: "#d4a843", btnTo: "#b8860b" },
    { id: "2",  name: "មាសប្រណិត",         category: "luxury", isPremium: true,  bg: "linear-gradient(135deg, #1a1a0e, #2d2a1e, #3d3520)", textPri: "#fef3c7", accent: "#f59e0b", btnFrom: "#d97706", btnTo: "#92400e" },
    { id: "3",  name: "ប្រពៃណីខ្មែរ",       category: "classic", isPremium: false, bg: "linear-gradient(135deg, #2e1a1a, #3e1616, #601010)", textPri: "#fecaca", accent: "#ef4444", btnFrom: "#dc2626", btnTo: "#991b1b" },
    { id: "4",  name: "សម័យទំនើប",         category: "modern", isPremium: false, bg: "linear-gradient(135deg, #0e1a2e, #16213e, #1e3a5e)", textPri: "#bfdbfe", accent: "#3b82f6", btnFrom: "#2563eb", btnTo: "#1d4ed8" },
    { id: "5",  name: "រាជវាំង",           category: "luxury", isPremium: true,  bg: "linear-gradient(135deg, #1a0e2e, #2e1640, #401060)", textPri: "#ddd6fe", accent: "#a855f7", btnFrom: "#9333ea", btnTo: "#7e22ce" },
    { id: "6",  name: "សួនច្បារ",           category: "modern", isPremium: false, bg: "linear-gradient(135deg, #0e2e1a, #163e21, #106030)", textPri: "#bbf7d0", accent: "#22c55e", btnFrom: "#16a34a", btnTo: "#15803d" },
    { id: "7",  name: "ផ្កាឈូកពណ៌ស",       category: "classic", isPremium: false, bg: "linear-gradient(135deg, #1a1a1e, #2e2e32, #404045)", textPri: "#e2e8f0", accent: "#94a3b8", btnFrom: "#64748b", btnTo: "#475569" },
    { id: "8",  name: "ភ្លើងបំភ្លឺ",        category: "luxury", isPremium: true,  bg: "linear-gradient(135deg, #2e1a0e, #402e16, #604010)", textPri: "#fde68a", accent: "#fbbf24", btnFrom: "#f59e0b", btnTo: "#d97706" },
    { id: "9",  name: "ទឹកជ្រោះ",           category: "modern", isPremium: false, bg: "linear-gradient(135deg, #0e2e2e, #163e3e, #106060)", textPri: "#a5f3fc", accent: "#06b6d4", btnFrom: "#0891b2", btnTo: "#0e7490" },
    { id: "10", name: "ពណ៌ផ្កាឈូក",        category: "luxury", isPremium: true,  bg: "linear-gradient(135deg, #2e0e2e, #401640, #601060)", textPri: "#f5d0fe", accent: "#d946ef", btnFrom: "#c026d3", btnTo: "#a21caf" },
    { id: "11", name: "បុរាណ",              category: "classic", isPremium: false, bg: "linear-gradient(135deg, #2e1a0e, #3e2e16, #504010)", textPri: "#fde68a", accent: "#d97706", btnFrom: "#b45309", btnTo: "#92400e" },
    { id: "12", name: "ទំនើប",              category: "modern", isPremium: false, bg: "linear-gradient(135deg, #1a1a1e, #2e2e32, #3e3e42)", textPri: "#e5e7eb", accent: "#9ca3af", btnFrom: "#6b7280", btnTo: "#4b5563" },
  ];

  useEffect(() => {
    if (!params.id) return;

    (async () => {
      const { data } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setInvitation(data);
        if (data.template_id) setSelectedTemplate(data.template_id);
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

      if (qr?.qr_image_url) setQrImageUrl(qr.qr_image_url);
    })();
  }, [params.id]);

  const updateField = (field: string, value: string) => {
    setInvitation((prev) => ({ ...prev, [field]: value }));
  };

  const checkStepComplete = (step: number) => {
    switch (step) {
      case 1: return !!(invitation.groom_name || invitation.groom_name_kh) && !!(invitation.bride_name || invitation.bride_name_kh);
      case 2: return !!invitation.wedding_date && !!invitation.venue_name;
      case 3: return galleryPhotos.length > 0;
      case 4: return !!qrImageUrl;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (checkStepComplete(currentStep)) {
      setCompletedSteps((prev) => new Set(Array.from(prev).concat([currentStep])));
    }
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  const handleQrUpload = (url: string) => {
    setQrImageUrl(url);
  };

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const { error } = await supabase
      .from("invitations")
      .update({ template_id: templateId })
      .eq("id", params.id);
    if (!error) {
      const t = templateList.find((t) => t.id === templateId);
      toast.success(`ប្ដូរគំរូទៅ "${t?.name || templateId}" រួចរាល់`);
    } else {
      toast.error("រក្សាទុកគំរូមិនបានជោគជ័យ");
    }
  };

  const saveInvitation = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("invitations")
      .update({ ...invitation, template_id: selectedTemplate })
      .eq("id", params.id);

    if (!error) {
      if (qrImageUrl) {
        const { data: existingQr } = await supabase
          .from("qr_codes")
          .select("id")
          .eq("invitation_id", params.id)
          .single();

        if (existingQr) {
          await supabase
            .from("qr_codes")
            .update({ qr_image_url: qrImageUrl })
            .eq("id", existingQr.id);
        } else {
          await supabase.from("qr_codes").insert({
            invitation_id: params.id,
            type: "gift",
            qr_image_url: qrImageUrl,
          });
        }
      }
      toast.success("បានរក្សាទុកជោគជ័យ!");
    } else {
      toast.error("បរាជ័យក្នុងការរក្សាទុក");
    }
    setSaving(false);
  };

  const publishInvitation = async () => {
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

  const progress = Math.round((completedSteps.size / 6) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invitations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary">បង្កើតលិខិតអញ្ជើញ</h1>
            <p className="text-muted-foreground">ជំហាន {currentStep} / 6</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveInvitation} disabled={saving} className="border-gold-200 text-secondary hover:bg-gold-50">
            <Save className="h-4 w-4 mr-2" /> {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-secondary">រីកចម្រើន</span>
            <span className="text-sm text-primary font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-gold-gradient h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
            <div className="absolute top-4 left-0 h-0.5 bg-gold-gradient transition-all duration-500" style={{ width: `${((currentStep - 1) / 5) * 100}%` }} />

            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="relative flex flex-col items-center z-10 group"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep === step.id
                    ? "bg-gold-gradient text-white scale-110 shadow-lg"
                    : completedSteps.has(step.id)
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500 group-hover:bg-gold-100"
                }`}>
                  {completedSteps.has(step.id) ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className={`text-xs mt-1.5 hidden md:block ${
                  currentStep === step.id ? "text-primary font-medium" : "text-muted-foreground"
                }`}>
                  {step.short}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Navigation */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="space-y-1">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      currentStep === step.id
                        ? "bg-gold-50 text-primary font-medium border border-gold-200 shadow-sm"
                        : completedSteps.has(step.id)
                        ? "text-green-600 hover:bg-green-50"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                      currentStep === step.id
                        ? "bg-gold-gradient text-white"
                        : completedSteps.has(step.id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {completedSteps.has(step.id) ? <Check className="h-3 w-3" /> : step.id}
                    </div>
                    <span>{step.title}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 text-primary" })}
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Couple Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 bg-gold-50/50 rounded-xl border border-gold-200/50">
                      <h3 className="font-medium text-lg text-secondary flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary" /> កូនកំលោះ
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="groom_name" className="text-secondary">ឈ្មោះ (អង់គ្លេស)</Label>
                        <Input id="groom_name" value={invitation.groom_name || ""} onChange={(e) => updateField("groom_name", e.target.value)} placeholder="ឧ. Sovandeth" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="groom_name_kh" className="text-secondary">ឈ្មោះ (ខ្មែរ)</Label>
                        <Input id="groom_name_kh" value={invitation.groom_name_kh || ""} onChange={(e) => updateField("groom_name_kh", e.target.value)} placeholder="ឧ. សុវណ្ណដេត" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-secondary">រូបថត</Label>
                        <FileUpload bucket="uploads" path={`invitations/${params.id}/groom`} onUpload={(url) => updateField("groom_photo", url)} className="aspect-square max-w-[180px]" />
                      </div>
                    </div>
                    <div className="space-y-4 p-4 bg-gold-50/50 rounded-xl border border-gold-200/50">
                      <h3 className="font-medium text-lg text-secondary flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" /> កូនក្រមុំ
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="bride_name" className="text-secondary">ឈ្មោះ (អង់គ្លេស)</Label>
                        <Input id="bride_name" value={invitation.bride_name || ""} onChange={(e) => updateField("bride_name", e.target.value)} placeholder="ឧ. Dara" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bride_name_kh" className="text-secondary">ឈ្មោះ (ខ្មែរ)</Label>
                        <Input id="bride_name_kh" value={invitation.bride_name_kh || ""} onChange={(e) => updateField("bride_name_kh", e.target.value)} placeholder="ឧ. ដារ៉ា" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-secondary">រូបថត</Label>
                        <FileUpload bucket="uploads" path={`invitations/${params.id}/bride`} onUpload={(url) => updateField("bride_photo", url)} className="aspect-square max-w-[180px]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50 space-y-4">
                    <h3 className="font-medium text-lg text-secondary flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" /> ពាក្យពេចន៍ និងរឿងស្នេហា
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="quote" className="text-secondary">ពាក្យពេចន៍រៀបការ</Label>
                      <Input id="quote" value={invitation.quote || ""} onChange={(e) => updateField("quote", e.target.value)} placeholder="ឧ. រួមគ្នាអស់មួយជីវិត..." className="border-gold-200 focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="story" className="text-secondary">រឿងស្នេហារបស់យើង</Label>
                      <Textarea id="story" value={invitation.story || ""} onChange={(e) => updateField("story", e.target.value)} placeholder="ប្រាប់រឿងស្នេហារបស់អ្នក..." rows={4} className="border-gold-200 focus-visible:ring-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Venue & Time */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50 space-y-4">
                    <h3 className="font-medium text-lg text-secondary flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" /> ពេលវេលា
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="wedding_date" className="text-secondary">ថ្ងៃរៀបការ *</Label>
                      <Input id="wedding_date" type="datetime-local" value={invitation.wedding_date ? new Date(invitation.wedding_date).toISOString().slice(0, 16) : ""} onChange={(e) => updateField("wedding_date", new Date(e.target.value).toISOString())} className="border-gold-200 focus-visible:ring-primary" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ceremony_time" className="text-secondary">ម៉ោងពិធីជប់លៀង</Label>
                        <Input id="ceremony_time" value={invitation.ceremony_time || ""} onChange={(e) => updateField("ceremony_time", e.target.value)} placeholder="ឧ. 7:00 ព្រឹក - 9:00 ព្រឹក" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reception_time" className="text-secondary">ម៉ោងពិធីស្វាគមន៍</Label>
                        <Input id="reception_time" value={invitation.reception_time || ""} onChange={(e) => updateField("reception_time", e.target.value)} placeholder="ឧ. 11:00 ព្រឹក - 2:00 ថ្ងៃត្រង់" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50 space-y-4">
                    <h3 className="font-medium text-lg text-secondary flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> ទីតាំង
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="venue_name" className="text-secondary">ឈ្មោះទីតាំង *</Label>
                      <Input id="venue_name" value={invitation.venue_name || ""} onChange={(e) => updateField("venue_name", e.target.value)} placeholder="ឧ. Diamond Ballroom" className="border-gold-200 focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue_address" className="text-secondary">អាសយដ្ឋានទីតាំង</Label>
                      <Textarea id="venue_address" value={invitation.venue_address || ""} onChange={(e) => updateField("venue_address", e.target.value)} placeholder="អាសយដ្ឋានពេញ..." rows={2} className="border-gold-200 focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue_map_url" className="text-secondary">Link Google Maps</Label>
                      <Input id="venue_map_url" value={invitation.venue_map_url || ""} onChange={(e) => updateField("venue_map_url", e.target.value)} placeholder="https://maps.google.com/..." className="border-gold-200 focus-visible:ring-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Gallery */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50">
                    <p className="text-muted-foreground">បញ្ចូលរូបថត Pre-wedding របស់អ្នកដើម្បីបង្កើតវិចិត្រសាលដ៏ស្អាត។</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryPhotos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square">
                        <img src={photo.url} alt={photo.caption || "រូបភាព"} className="w-full h-full object-cover rounded-xl border border-gold-200" />
                        <button type="button" onClick={() => removeGalleryPhoto(photo.id)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <FileUpload bucket="uploads" path={`invitations/${params.id}/gallery`} onUpload={handleGalleryUpload} className="aspect-square" />
                  </div>
                </div>
              )}

              {/* Step 4: Payment QR */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50">
                    <p className="text-muted-foreground">បញ្ចូល QR Code KHQR របស់អ្នកដើម្បីឱ្យភ្ញៀវផ្ញើចំណងដៃ។</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50 space-y-4">
                      <h3 className="font-medium text-secondary flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" /> QR Code
                      </h3>
                      <FileUpload bucket="uploads" path={`invitations/${params.id}/qr`} onUpload={handleQrUpload} className="max-w-[250px]" />
                      {qrImageUrl && (
                        <div className="mt-2">
                          <img src={qrImageUrl} alt="QR Code" className="w-32 h-32 rounded-lg border border-gold-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50 space-y-4">
                      <h3 className="font-medium text-secondary flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" /> ព័ត៌មានគណនី
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="bank_name" className="text-secondary">ឈ្មោះធនាគារ</Label>
                        <Input id="bank_name" placeholder="ឧ. ABA Bank" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account_name" className="text-secondary">ឈ្មោះគណនី</Label>
                        <Input id="account_name" placeholder="ឈ្មោះម្ចាស់គណនី" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account_number" className="text-secondary">លេខគណនី</Label>
                        <Input id="account_number" placeholder="លេខគណនី" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Music & Design */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50 space-y-4">
                    <h3 className="font-medium text-secondary flex items-center gap-2">
                      <Music className="h-4 w-4 text-primary" /> តន្ត្រី
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="background_music" className="text-secondary">URL តន្ត្រីផ្ទៃខាងក្រោយ</Label>
                      <Input id="background_music" value={invitation.background_music || ""} onChange={(e) => updateField("background_music", e.target.value)} placeholder="YouTube ឬ URL តន្ត្រី..." className="border-gold-200 focus-visible:ring-primary" />
                    </div>
                  </div>
                  <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/50 space-y-4">
                    <h3 className="font-medium text-secondary flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" /> ជ្រើសរើសធៀបគំរូ
                    </h3>
                    <p className="text-sm text-muted-foreground">ជ្រើសរើសធៀបគំរូដែលអ្នកពេញចិត្ត។ ធៀបគំរូនឹងត្រូវបានប្រើសម្រាប់លិខិតអញ្ជើញរបស់អ្នក។</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {templateList.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => handleSelectTemplate(tpl.id)}
                          className={`relative group rounded-2xl p-4 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                            selectedTemplate === tpl.id
                              ? "ring-3 ring-primary shadow-xl bg-gold-50"
                              : "bg-white hover:bg-gold-50/50"
                          }`}
                        >
                          {selectedTemplate === tpl.id && (
                            <div className="absolute -top-2 -right-2 z-10 h-7 w-7 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                          {tpl.isPremium && (
                            <div className="absolute -top-2 left-4 z-10">
                              <span className="text-[10px] font-bold bg-gold-gradient text-white px-2 py-0.5 rounded-full shadow">Premium</span>
                            </div>
                          )}
                          <div className="mx-auto w-28 aspect-[3/5] rounded-[1.25rem] border-4 border-secondary/90 shadow-lg overflow-hidden relative transition-transform duration-300 group-hover:scale-[1.03]">
                            <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ background: tpl.bg }}>
                              <Heart className="h-5 w-5 mb-2" style={{ color: tpl.accent }} fill={tpl.accent} />
                              <p className="text-[6px] tracking-[0.2em] uppercase mb-1" style={{ color: tpl.accent }}>Wedding</p>
                              <p className="text-[10px] font-bold" style={{ color: tpl.textPri }}>សុវណ្ណដេត</p>
                              <p className="text-[8px] font-semibold my-0.5" style={{ color: tpl.accent }}>&amp;</p>
                              <p className="text-[10px] font-bold mb-2" style={{ color: tpl.textPri }}>ដារ៉ា</p>
                              <span className="text-[6px] px-2 py-0.5 rounded-full font-medium text-white" style={{ background: `linear-gradient(135deg, ${tpl.btnFrom}, ${tpl.btnTo})` }}>បើកលិខិត</span>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="text-xs font-medium text-white bg-black/50 px-3 py-1 rounded-full flex items-center gap-1">
                                <Eye className="h-3 w-3" /> ជ្រើសរើស
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-secondary mt-3">{tpl.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{tpl.category}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Preview & Publish */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-8 text-center border border-gold-200/50">
                    <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-7 w-7 text-white fill-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-secondary">
                      {invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"} & {invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}
                    </h2>
                    <p className="text-muted-foreground">
                      {invitation.wedding_date
                        ? new Date(invitation.wedding_date).toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                        : "កំណត់ពេលក្រោយ"}
                    </p>
                    {invitation.venue_name && <p className="text-sm text-muted-foreground mt-2">{invitation.venue_name}</p>}
                    {invitation.quote && <p className="italic text-muted-foreground mt-4">&ldquo;{invitation.quote}&rdquo;</p>}
                  </div>

                  <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl">
                    <p className="font-medium mb-2 text-secondary">Link លិខិតអញ្ជើញ</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-primary bg-white p-2 rounded-lg border border-gold-200">
                        {typeof window !== "undefined" ? window.location.origin : ""}/invite/{invitation.slug || "..."}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyLink} className="border-gold-200 text-primary hover:bg-gold-50">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {invitation.status === "published" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="font-medium text-green-800">លិខិតអញ្ជើញនេះកំពុងដំណើរការ!</p>
                      <p className="text-sm text-green-600 mt-1">ចែករំលែក Link ទៅភ្ញៀវរបស់អ្នក។</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href={`/preview/${params.id}`} target="_blank" className="flex-1">
                      <Button variant="outline" className="w-full border-gold-200 text-primary hover:bg-gold-50 gap-2">
                        <Eye className="h-4 w-4" /> មើល Preview
                      </Button>
                    </Link>
                    <Button onClick={publishInvitation} disabled={saving} className="flex-1 bg-gold-gradient text-white hover:opacity-90 gap-2">
                      {saving ? "កំពុងផ្សាយ..." : "ផ្សាយលិខិតអញ្ជើញ"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-gold-200/50">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1} className="border-gold-200 text-secondary hover:bg-gold-50">
                  <ArrowLeft className="h-4 w-4 mr-2" /> ក្រោយ
                </Button>
                {currentStep < 6 ? (
                  <Button onClick={handleNext} className="bg-gold-gradient text-white hover:opacity-90">
                    បន្ទាប់ <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={publishInvitation} disabled={saving} className="bg-gold-gradient text-white hover:opacity-90">
                    {saving ? "កំពុងផ្សាយ..." : "ផ្សាយលិខិតអញ្ជើញ"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
    </svg>
  );
}
