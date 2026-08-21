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
import { ArrowLeft, ArrowRight, Save, Eye, Music, MapPin, Users, Heart, Image, CreditCard, Trash2 } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";
import type { Invitation, GalleryPhoto } from "@/types/database";

const steps = [
  { id: 1, icon: Heart, title: "ព័ត៌មានកូនកំលោះ-កូនក្រមុំ" },
  { id: 2, icon: MapPin, title: "ទីតាំង និងពេលវេលា" },
  { id: 3, icon: Image, title: "រូបថត" },
  { id: 4, icon: CreditCard, title: "QR Code ចំណងដៃ" },
  { id: 5, icon: Music, title: "តន្ត្រី និងការរចនា" },
  { id: 6, icon: Eye, title: "មើល និងផ្សាយ" },
];

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (!params.id) return;

    (async () => {
      const { data } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) setInvitation(data);

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

  const saveInvitation = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("invitations")
      .update(invitation)
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
      alert("បានរក្សាទុកជោគជ័យ!");
    }
    setSaving(false);
  };

  const publishInvitation = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("invitations")
      .update({
        ...invitation,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (!error) {
      alert("បានផ្សាយលិខិតអញ្ជើញ!");
      router.push("/invitations");
    }
    setSaving(false);
  };

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
            <h1 className="text-2xl font-bold text-secondary">បង្កើងលិខិតអញ្ជើញ</h1>
            <p className="text-muted-foreground">ប្ដូរតាមបំណងលិខិតអញ្ជើញរបស់អ្នក</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveInvitation} disabled={saving} className="border-gold-200 text-secondary hover:bg-gold-50">
            <Save className="h-4 w-4 mr-2" /> រក្សាទុក
          </Button>
          {invitation.status !== "published" && (
            <Button onClick={publishInvitation} disabled={saving} className="bg-gold-gradient text-white hover:opacity-90">
              ផ្សាយ
            </Button>
          )}
        </div>
      </div>

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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      currentStep === step.id
                        ? "bg-gold-50 text-primary font-medium border border-gold-200"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <step.icon className="h-4 w-4" />
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
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg text-secondary">កូនកំលោះ</h3>
                      <div className="space-y-2">
                        <Label htmlFor="groom_name" className="text-secondary">ឈ្មោះ (អង់គ្លេស)</Label>
                        <Input id="groom_name" value={invitation.groom_name || ""} onChange={(e) => updateField("groom_name", e.target.value)} placeholder="ឧ. Kim Sun" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="groom_name_kh" className="text-secondary">ឈ្មោះ (ខ្មែរ)</Label>
                        <Input id="groom_name_kh" value={invitation.groom_name_kh || ""} onChange={(e) => updateField("groom_name_kh", e.target.value)} placeholder="ឧ. គឹម សុន" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-secondary">រូបថត</Label>
                        <FileUpload
                          bucket="uploads"
                          path={`invitations/${params.id}/groom`}
                          onUpload={(url) => updateField("groom_photo", url)}
                          className="aspect-square max-w-[200px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg text-secondary">កូនក្រមុំ</h3>
                      <div className="space-y-2">
                        <Label htmlFor="bride_name" className="text-secondary">ឈ្មោះ (អង់គ្លេស)</Label>
                        <Input id="bride_name" value={invitation.bride_name || ""} onChange={(e) => updateField("bride_name", e.target.value)} placeholder="ឧ. Channet" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bride_name_kh" className="text-secondary">ឈ្មោះ (ខ្មែរ)</Label>
                        <Input id="bride_name_kh" value={invitation.bride_name_kh || ""} onChange={(e) => updateField("bride_name_kh", e.target.value)} placeholder="ឧ. ចន្ធី" className="border-gold-200 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-secondary">រូបថត</Label>
                        <FileUpload
                          bucket="uploads"
                          path={`invitations/${params.id}/bride`}
                          onUpload={(url) => updateField("bride_photo", url)}
                          className="aspect-square max-w-[200px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quote" className="text-secondary">ពាក្យពេចន៍រៀបការ</Label>
                    <Input id="quote" value={invitation.quote || ""} onChange={(e) => updateField("quote", e.target.value)} placeholder="ឧ. រួមគ្នាអស់មួយជីវិត..." className="border-gold-200 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story" className="text-secondary">រឿងស្នេហារបស់យើង</Label>
                    <Textarea id="story" value={invitation.story || ""} onChange={(e) => updateField("story", e.target.value)} placeholder="ប្រាប់រឿងស្នេហារបស់អ្នក..." rows={4} className="border-gold-200 focus-visible:ring-primary" />
                  </div>
                </div>
              )}

              {/* Step 2: Venue & Time */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="wedding_date" className="text-secondary">ថ្ងៃរៀបការ</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="venue_name" className="text-secondary">ឈ្មោះទីតាំង</Label>
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
              )}

              {/* Step 3: Gallery */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">បញ្ចូលរូបថត Pre-wedding របស់អ្នកដើម្បីបង្កើតវិចិត្រសាលដ៏ស្អាត។</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryPhotos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square">
                        <img
                          src={photo.url}
                          alt={photo.caption || "រូបភាព"}
                          className="w-full h-full object-cover rounded-lg border border-gold-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto(photo.id)}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <FileUpload
                      bucket="uploads"
                      path={`invitations/${params.id}/gallery`}
                      onUpload={handleGalleryUpload}
                      className="aspect-square"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Payment QR */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">បញ្ចូល QR Code KHQR របស់អ្នកដើម្បីឱ្យភ្ញៀវផ្ញើចំណងដៃ។</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-secondary">រូបភាព QR Code</Label>
                        <FileUpload
                          bucket="uploads"
                          path={`invitations/${params.id}/qr`}
                          onUpload={handleQrUpload}
                          className="max-w-[250px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="background_music" className="text-secondary">URL តន្ត្រីផ្ទៃខាងក្រោយ</Label>
                    <Input id="background_music" value={invitation.background_music || ""} onChange={(e) => updateField("background_music", e.target.value)} placeholder="YouTube ឬ URL តន្ត្រី..." className="border-gold-200 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary">ជ្រើសរើសធៀបគំរូ</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["ផ្កាឈូករ៉ូមែនទិច", "មាសប្រណិត", "ប្រពៃណីខ្មែរ", "សម័យទំនើប", "រាជវាំង", "សួនច្បារ"].map((name) => (
                        <div key={name} className="border border-gold-200 rounded-lg p-4 text-center hover:border-primary cursor-pointer transition-colors hover:shadow-md">
                          <div className="aspect-[3/4] bg-gradient-to-br from-gold-50 to-gold-100 rounded mb-2" />
                          <p className="text-sm font-medium text-secondary">{name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Preview & Publish */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2 text-secondary">
                      {invitation.groom_name || "កូនកំលោះ"} & {invitation.bride_name || "កូនក្រមុំ"}
                    </h2>
                    <p className="text-muted-foreground">
                      {invitation.wedding_date
                        ? new Date(invitation.wedding_date).toLocaleDateString("km-KH", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "កំណត់ពេលក្រោយ"}
                    </p>
                    {invitation.venue_name && (
                      <p className="text-sm text-muted-foreground mt-2">{invitation.venue_name}</p>
                    )}
                    {invitation.quote && (
                      <p className="italic text-muted-foreground mt-4">&ldquo;{invitation.quote}&rdquo;</p>
                    )}
                  </div>
                  <div className="bg-gold-50 border border-gold-200 text-sm p-4 rounded-lg">
                    <p className="font-medium mb-1 text-secondary">Link លិខិតអញ្ជើញ</p>
                    <p className="font-mono text-primary">
                      {typeof window !== "undefined" ? window.location.origin : ""}/invite/{invitation.slug || "..."}
                    </p>
                  </div>
                  {invitation.status === "published" && (
                    <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-lg">
                      <p className="font-medium">លិខិតអញ្ជើញនេះកំពុងដំណើរការ!</p>
                      <p>ចែករំលែក Link ទៅភ្ញៀវរបស់អ្នក។</p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-gold-200/50">
                <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="border-gold-200 text-secondary hover:bg-gold-50">
                  <ArrowLeft className="h-4 w-4 mr-2" /> ក្រោយ
                </Button>
                {currentStep < 6 ? (
                  <Button onClick={() => setCurrentStep(Math.min(6, currentStep + 1))} className="bg-gold-gradient text-white hover:opacity-90">
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
