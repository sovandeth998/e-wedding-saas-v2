"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, Music, Camera, Gift, MessageCircle, Share2, Calendar } from "lucide-react";
import type { Invitation, Guest, Wish, QRCode, GalleryPhoto } from "@/types/database";

function InvitationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const guestName = searchParams.get("to") || "";
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "not_attending" | "maybe" | "">("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [wishName, setWishName] = useState(guestName);
  const [wishContent, setWishContent] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [wishSubmitted, setWishSubmitted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchInvitation();
  }, [params.slug]);

  const fetchInvitation = async () => {
    const { data: inv } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "published")
      .single();

    if (!inv) {
      setLoading(false);
      return;
    }

    setInvitation(inv);

    const [guestData, wishesData, qrData, photoData] = await Promise.all([
      guestName
        ? supabase
            .from("guests")
            .select("*")
            .eq("invitation_id", inv.id)
            .ilike("custom_link", `%${guestName.toLowerCase().replace(/\s+/g, "-")}%`)
            .single()
        : Promise.resolve({ data: null }),
      supabase
        .from("wishes")
        .select("*")
        .eq("invitation_id", inv.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false }),
      supabase.from("qr_codes").select("*").eq("invitation_id", inv.id),
      supabase.from("gallery_photos").select("*").eq("invitation_id", inv.id).order("order_index"),
    ]);

    setGuest(guestData.data);
    setWishes(wishesData.data || []);
    setQrCodes(qrData.data || []);
    setPhotos(photoData.data || []);
    setLoading(false);
  };

  const submitRSVP = async () => {
    if (!invitation || !rsvpStatus) return;

    const guestId = guest?.id;

    let finalGuestId = guestId;
    if (!finalGuestId && guestName) {
      const { data: newGuest } = await supabase
        .from("guests")
        .insert({
          invitation_id: invitation.id,
          name: guestName,
          custom_link: `${params.slug}/guest/${guestName.toLowerCase().replace(/\s+/g, "-")}`,
          side: "both",
        })
        .select()
        .single();
      finalGuestId = newGuest?.id;
    }

    if (!finalGuestId) return;

    await supabase.from("rsvps").insert({
      guest_id: finalGuestId,
      invitation_id: invitation.id,
      status: rsvpStatus,
      number_of_guests: rsvpGuests,
      message: rsvpMessage,
    });

    setRsvpSubmitted(true);
  };

  const submitWish = async () => {
    if (!invitation || !wishContent.trim()) return;

    await supabase.from("wishes").insert({
      invitation_id: invitation.id,
      guest_id: guest?.id || null,
      sender_name: wishName || "អនាមិក",
      content: wishContent,
      is_approved: false,
    });

    setWishSubmitted(true);
    setWishContent("");
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(
      `សូមអញ្ជើញអ្នកទៅរោងពិធីរៀបការរបស់ ${invitation?.groom_name_kh || invitation?.groom_name} និង ${invitation?.bride_name_kh || invitation?.bride_name}! 🎉\n\nមើលលិខិតអញ្ជើញ: ${window.location.href}`
    );
    window.open(`https://t.me/share/url?url=${window.location.href}&text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-secondary">រកមិនឃើញលិខិតអញ្ជើញ</h1>
          <p className="text-muted-foreground">Link លិខិតអញ្ជើញនេះមិនត្រឹមត្រូវ ឬត្រូវបានលុប។</p>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(invitation.wedding_date);
  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="min-h-screen bg-cream-gradient">
      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 h-48 w-48 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto relative">
          <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-6">
            <Heart className="h-7 w-7 text-white fill-white" />
          </div>
          <p className="text-lg text-primary font-medium mb-2">លិខិតអញ្ជើញរោងពិធីរៀបការ</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-2 text-secondary">
            {invitation.groom_name_kh || invitation.groom_name}
          </h1>
          <p className="text-3xl text-primary font-bold my-4">&</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-secondary">
            {invitation.bride_name_kh || invitation.bride_name}
          </h1>
          {guestName && (
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-gold-200/50">
              <p className="text-sm text-muted-foreground">ជូនពរ</p>
              <p className="font-semibold text-primary">{guestName}</p>
            </div>
          )}
          {invitation.quote && (
            <p className="italic text-muted-foreground text-lg">&ldquo;{invitation.quote}&rdquo;</p>
          )}
        </div>
      </section>

      {/* Countdown */}
      <section className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { value: days, label: "ថ្ងៃ" },
              { value: hours, label: "ម៉ោង" },
              { value: minutes, label: "នាទី" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 border border-gold-200/30">
                <p className="text-2xl font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gold-200/30 flex flex-col items-center justify-center">
              <Share2 className="h-6 w-6 text-primary" />
              <p className="text-xs text-muted-foreground mt-1">ចែករំលែក</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 space-y-8 pb-20">
        {/* Event Info */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4 text-secondary">ព័ត៌មានរោងពិធី</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {weddingDate.toLocaleDateString("km-KH", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {invitation.ceremony_time && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>ពិធីជប់លៀង: {invitation.ceremony_time}</span>
                </div>
              )}
              {invitation.reception_time && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>ស្វាគមន៍: {invitation.reception_time}</span>
                </div>
              )}
              {invitation.venue_name && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{invitation.venue_name}</span>
                </div>
              )}
              {invitation.venue_address && (
                <p className="text-sm text-muted-foreground">{invitation.venue_address}</p>
              )}
              {invitation.venue_map_url && (
                <a href={invitation.venue_map_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                  <Button variant="outline" size="sm" className="gap-2 border-gold-200 text-primary hover:bg-gold-50">
                    <MapPin className="h-4 w-4" /> បើកក្នុង Google Maps
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Our Story */}
        {invitation.story && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-center text-secondary">រឿងស្នេហារបស់យើង</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{invitation.story}</p>
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {photos.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-secondary">វិចិត្រសាលរូបភាព</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square bg-gold-50 rounded-lg overflow-hidden">
                    <img src={photo.url} alt={photo.caption || "រូបភាពរៀបការ"} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code / Gift */}
        {qrCodes.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-4 text-secondary">ផ្ញើចំណងដៃតាម QR Code</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="bg-gold-50 rounded-lg border border-gold-200/50 p-4">
                    {qr.qr_image_url && (
                      <img src={qr.qr_image_url} alt="QR Code" className="w-48 h-48 mx-auto mb-2" />
                    )}
                    {qr.bank_name && <p className="font-medium text-secondary">{qr.bank_name}</p>}
                    {qr.account_name && <p className="text-sm text-muted-foreground">{qr.account_name}</p>}
                    {qr.account_number && <p className="text-sm font-mono text-muted-foreground">{qr.account_number}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* RSVP */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-center text-secondary">RSVP</h2>
            {rsvpSubmitted ? (
              <div className="text-center py-4">
                <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-7 w-7 text-white fill-white" />
                </div>
                <p className="font-semibold text-lg text-secondary">អរគុណសម្រាប់ការឆ្លើយតបរបស់អ្នក!</p>
                <p className="text-muted-foreground">យើងរង់ចាំជួបអ្នក។</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-secondary font-medium">ការឆ្លើយតបរបស់អ្នក</Label>
                  <div className="flex gap-2">
                    {([
                      { value: "attending", label: "✓ នឹងមក" },
                      { value: "not_attending", label: "✗ មិនមក" },
                      { value: "maybe", label: "? ប្រហែល" },
                    ] as const).map((opt) => (
                      <Button
                        key={opt.value}
                        variant={rsvpStatus === opt.value ? "default" : "outline"}
                        className={`flex-1 ${rsvpStatus === opt.value ? "bg-gold-gradient text-white" : "border-gold-200 text-secondary"}`}
                        onClick={() => setRsvpStatus(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {rsvpStatus === "attending" && (
                  <div className="space-y-2">
                    <Label className="text-secondary font-medium">ចំនួនភ្ញៀវ</Label>
                    <Input type="number" min={1} max={10} value={rsvpGuests} onChange={(e) => setRsvpGuests(parseInt(e.target.value) || 1)} className="border-gold-200" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-secondary font-medium">សារ (ជម្រើស)</Label>
                  <Textarea value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} placeholder="សរសេរសារជូនគូស្នេហ៍..." rows={3} className="border-gold-200" />
                </div>
                <Button onClick={submitRSVP} className="w-full bg-gold-gradient text-white hover:opacity-90" disabled={!rsvpStatus}>
                  ផ្ញើ RSVP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wishes */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-secondary">ពាក្យជូនពរ</h2>
            </div>
            {wishSubmitted && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg mb-4">
                បានផ្ញើពាក្យជូនពររបស់អ្នក! វានឹងបង្ហាញបន្ទាប់ពីអនុម័ត។
              </div>
            )}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {wishes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">មិនទាន់មានពាក្យជូនពរទេ។ ចូលរួមជាមួយដំបូង!</p>
              ) : (
                wishes.map((wish) => (
                  <div key={wish.id} className="bg-gold-50/50 rounded-lg p-3 border border-gold-200/30">
                    <p className="font-medium text-sm text-secondary">{wish.sender_name}</p>
                    <p className="text-sm text-muted-foreground">{wish.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-3 border-t border-gold-200/50 pt-4">
              <Input value={wishName} onChange={(e) => setWishName(e.target.value)} placeholder="ឈ្មោះរបស់អ្នក" className="border-gold-200" />
              <Textarea value={wishContent} onChange={(e) => setWishContent(e.target.value)} placeholder="សរសេរពាក្យជូនពររបស់អ្នក..." rows={2} className="border-gold-200" />
              <Button onClick={submitWish} className="w-full border-gold-200 text-primary hover:bg-gold-50" variant="outline" disabled={!wishContent.trim()}>
                ផ្ញើពាក្យជូនពរ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Share Button */}
        <div className="text-center">
          <Button onClick={shareToTelegram} className="gap-2 bg-[#0088cc] hover:bg-[#006da4] text-white">
            <Share2 className="h-4 w-4" /> ចែករំលែកទៅ Telegram
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-gold-200/50 bg-white">
        <p className="text-sm text-muted-foreground">
          បង្កើតដោយ E-Wedding 🇰🇭
        </p>
      </footer>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}
