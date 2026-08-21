"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MapPin, Clock, Camera, Gift, MessageCircle, Share2, Calendar, Phone, ChevronDown } from "lucide-react";
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
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "not_attending" | "">("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [wishName, setWishName] = useState(guestName);
  const [wishContent, setWishContent] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [wishSubmitted, setWishSubmitted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const supabase = createClient();

  useEffect(() => {
    fetchInvitation();
  }, [params.slug]);

  useEffect(() => {
    if (!invitation) return;
    const calc = () => {
      const diff = new Date(invitation.wedding_date).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [invitation]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-500 border-t-transparent mx-auto" />
          <p className="text-yellow-200/60 mt-4 text-sm">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        <div className="text-center px-4">
          <div className="h-20 w-20 rounded-full border-2 border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-yellow-500/50" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-yellow-100">រកមិនឃើញលិខិតអញ្ជើញ</h1>
          <p className="text-yellow-200/50">Link លិខិតអញ្ជើញនេះមិនត្រឹមត្រូវ ឬត្រូវបានលុប។</p>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(invitation.wedding_date);

  if (!opened) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        <div className="text-center max-w-md w-full">
          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-500/10 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-[#1e2a4a] to-[#0d1b3e] rounded-3xl border border-yellow-500/20 p-8 shadow-2xl">
              <div className="h-16 w-16 rounded-full border border-yellow-500/30 flex items-center justify-center mx-auto mb-6 bg-yellow-500/5">
                <Heart className="h-8 w-8 text-yellow-500 fill-yellow-500/20" />
              </div>
              <p className="text-yellow-200/40 text-xs tracking-[0.3em] uppercase mb-4">Wedding Invitation</p>
              <h1 className="text-3xl font-bold text-yellow-100 mb-1">
                {invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}
              </h1>
              <div className="flex items-center justify-center gap-3 my-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                <span className="text-yellow-500 text-2xl font-light">&</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
              </div>
              <h1 className="text-3xl font-bold text-yellow-100 mb-6">
                {invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}
              </h1>

              {guestName && (
                <div className="mb-6 py-3 px-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                  <p className="text-yellow-200/40 text-xs">ជូនពរ</p>
                  <p className="text-yellow-100 font-semibold">{guestName}</p>
                </div>
              )}

              <p className="text-yellow-200/50 text-sm mb-6">
                {weddingDate.toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>

              <Button
                onClick={() => setOpened(true)}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl h-12 font-medium tracking-wide shadow-lg shadow-yellow-900/30"
              >
                បើកលិខិតអញ្ជើញ
              </Button>

              <div className="mt-6 flex items-center justify-center gap-1">
                <ChevronDown className="h-4 w-4 text-yellow-500/30 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0f1a35 100%)" }}>
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-yellow-500/5 blur-[120px]" />
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-yellow-500/5 blur-[60px]" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-yellow-500/5 blur-[60px]" />
        </div>

        <div className="max-w-lg mx-auto relative">
          <div className="mb-8">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mx-auto mb-6" />
            <p className="text-yellow-200/40 text-xs tracking-[0.4em] uppercase mb-4">Invitation</p>
            <p className="text-yellow-200/30 text-sm mb-6">សូមអញ្ជើញចូលរួមក្នុងថ្ងៃរៀបការរបស់យើង</p>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-yellow-100 tracking-wide">
            {invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}
          </h1>

          <div className="flex items-center justify-center gap-4 my-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500/40" />
            <Heart className="h-5 w-5 text-yellow-500 fill-yellow-500/30" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-500/40" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-yellow-100 tracking-wide">
            {invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}
          </h1>

          {guestName && (
            <div className="inline-block border border-yellow-500/20 rounded-full px-6 py-2 mb-6 bg-yellow-500/5 backdrop-blur-sm">
              <p className="text-xs text-yellow-200/40">ជូនពរ</p>
              <p className="font-semibold text-yellow-100">{guestName}</p>
            </div>
          )}

          {invitation.quote && (
            <p className="italic text-yellow-200/50 text-base max-w-sm mx-auto">&ldquo;{invitation.quote}&rdquo;</p>
          )}

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mx-auto mt-8" />
        </div>
      </section>

      {/* Countdown */}
      <section className="py-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { value: timeLeft.days, label: "ថ្ងៃ" },
              { value: timeLeft.hours, label: "ម៉ោង" },
              { value: timeLeft.minutes, label: "នាទី" },
              { value: timeLeft.seconds, label: "វិនាទី" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-3 border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
                <p className="text-2xl font-bold text-yellow-100">{item.value}</p>
                <p className="text-xs text-yellow-200/40">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 space-y-6 pb-20">
        {/* Event Info */}
        <div className="rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-[#1e2a4a]/80 to-[#0d1b3e]/80 p-6 text-center backdrop-blur-sm">
          <div className="h-12 w-12 rounded-full border border-yellow-500/20 flex items-center justify-center mx-auto mb-4 bg-yellow-500/5">
            <Calendar className="h-5 w-5 text-yellow-500" />
          </div>
          <h2 className="text-lg font-bold mb-4 text-yellow-100 tracking-wide">ព័ត៌មានពិធីការ</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-yellow-200/60">
              <Calendar className="h-4 w-4 text-yellow-500/60" />
              <span className="text-sm">
                {weddingDate.toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>

            {invitation.ceremony_time && (
              <div className="flex items-center justify-center gap-2 text-yellow-200/60">
                <Clock className="h-4 w-4 text-yellow-500/60" />
                <span className="text-sm">ពិធីជប់លៀង: {invitation.ceremony_time}</span>
              </div>
            )}

            {invitation.reception_time && (
              <div className="flex items-center justify-center gap-2 text-yellow-200/60">
                <Clock className="h-4 w-4 text-yellow-500/60" />
                <span className="text-sm">ស្វាគមន៍: {invitation.reception_time}</span>
              </div>
            )}

            <div className="h-px w-16 bg-yellow-500/20 mx-auto my-3" />

            {invitation.venue_name && (
              <div className="flex items-center justify-center gap-2 text-yellow-100">
                <MapPin className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{invitation.venue_name}</span>
              </div>
            )}

            {invitation.venue_address && (
              <p className="text-sm text-yellow-200/40 max-w-sm mx-auto">{invitation.venue_address}</p>
            )}

            {invitation.venue_map_url && (
              <a href={invitation.venue_map_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                <Button variant="outline" size="sm" className="gap-2 border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10 rounded-xl">
                  <MapPin className="h-4 w-4" /> បើកក្នុង Google Maps
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Story */}
        {invitation.story && (
          <div className="rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-[#1e2a4a]/80 to-[#0d1b3e]/80 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold mb-4 text-center text-yellow-100 tracking-wide">រឿងស្នេហារបស់យើង</h2>
            <div className="h-px w-16 bg-yellow-500/20 mx-auto mb-4" />
            <p className="text-yellow-200/50 whitespace-pre-line leading-relaxed text-sm text-center">{invitation.story}</p>
          </div>
        )}

        {/* Gallery */}
        {photos.length > 0 && (
          <div className="rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-[#1e2a4a]/80 to-[#0d1b3e]/80 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-yellow-100 tracking-wide">វិចិត្រសាលរូបភាព</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-yellow-500/10">
                  <img src={photo.url} alt={photo.caption || "រូបភាពរៀបការ"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code */}
        {qrCodes.length > 0 && (
          <div className="rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-[#1e2a4a]/80 to-[#0d1b3e]/80 p-6 text-center backdrop-blur-sm">
            <div className="h-12 w-12 rounded-full border border-yellow-500/20 flex items-center justify-center mx-auto mb-4 bg-yellow-500/5">
              <Gift className="h-5 w-5 text-yellow-500" />
            </div>
            <h2 className="text-lg font-bold mb-4 text-yellow-100 tracking-wide">ចំណងដៃ</h2>
            <div className="h-px w-16 bg-yellow-500/20 mx-auto mb-4" />
            <div className="grid grid-cols-1 gap-4">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-4">
                  {qr.qr_image_url && (
                    <img src={qr.qr_image_url} alt="QR Code" className="w-40 h-40 mx-auto mb-3 rounded-lg bg-white p-2" />
                  )}
                  {qr.bank_name && <p className="font-medium text-yellow-100 text-sm">{qr.bank_name}</p>}
                  {qr.account_name && <p className="text-xs text-yellow-200/50">{qr.account_name}</p>}
                  {qr.account_number && <p className="text-xs font-mono text-yellow-200/40">{qr.account_number}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP */}
        <div className="rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-[#1e2a4a]/80 to-[#0d1b3e]/80 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 text-center text-yellow-100 tracking-wide">RSVP</h2>
          <div className="h-px w-16 bg-yellow-500/20 mx-auto mb-4" />

          {rsvpSubmitted ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full border border-yellow-500/30 flex items-center justify-center mx-auto mb-4 bg-yellow-500/5">
                <Heart className="h-8 w-8 text-yellow-500 fill-yellow-500/20" />
              </div>
              <p className="font-semibold text-lg text-yellow-100">អរគុណ!</p>
              <p className="text-yellow-200/50 text-sm mt-1">យើងរង់ចាំជួបអ្នក។</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-yellow-200/60 text-sm">ការឆ្លើយតបរបស់អ្នក</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "attending", label: "✓ នឹងមក" },
                    { value: "not_attending", label: "✗ មិនមក" },
                  ] as const).map((opt) => (
                    <Button
                      key={opt.value}
                      variant="outline"
                      className={`rounded-xl h-11 ${rsvpStatus === opt.value ? "bg-yellow-600 border-yellow-500 text-white" : "border-yellow-500/20 text-yellow-200/60 hover:bg-yellow-500/10"}`}
                      onClick={() => setRsvpStatus(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {rsvpStatus === "attending" && (
                <div className="space-y-2">
                  <Label className="text-yellow-200/60 text-sm">ចំនួនភ្ញៀវ</Label>
                  <Input type="number" min={1} max={10} value={rsvpGuests} onChange={(e) => setRsvpGuests(parseInt(e.target.value) || 1)} className="border-yellow-500/20 bg-yellow-500/5 text-yellow-100 rounded-xl" />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-yellow-200/60 text-sm">សារ (ជម្រើស)</Label>
                <Textarea value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} placeholder="សរសេរសារជូនគូស្នេហ៍..." rows={3} className="border-yellow-500/20 bg-yellow-500/5 text-yellow-100 rounded-xl placeholder:text-yellow-200/20" />
              </div>

              <Button onClick={submitRSVP} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl h-11 shadow-lg shadow-yellow-900/30" disabled={!rsvpStatus}>
                ផ្ញើ RSVP
              </Button>
            </div>
          )}
        </div>

        {/* Wishes */}
        <div className="rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-[#1e2a4a]/80 to-[#0d1b3e]/80 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-yellow-100 tracking-wide">ពាក្យជូនពរ</h2>
          </div>
          <div className="h-px w-16 bg-yellow-500/20 mx-auto mb-4" />

          {wishSubmitted && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-300 text-sm p-3 rounded-xl mb-4 text-center">
              បានផ្ញើពាក្យជូនពរ!
            </div>
          )}

          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {wishes.length === 0 ? (
              <p className="text-sm text-yellow-200/30 text-center py-4">មិនទាន់មានពាក្យជូនពរ។</p>
            ) : (
              wishes.map((wish) => (
                <div key={wish.id} className="rounded-xl p-3 border border-yellow-500/10 bg-yellow-500/5">
                  <p className="font-medium text-sm text-yellow-100">{wish.sender_name}</p>
                  <p className="text-sm text-yellow-200/40 mt-1">{wish.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 border-t border-yellow-500/10 pt-4">
            <Input value={wishName} onChange={(e) => setWishName(e.target.value)} placeholder="ឈ្មោះរបស់អ្នក" className="border-yellow-500/20 bg-yellow-500/5 text-yellow-100 rounded-xl placeholder:text-yellow-200/20" />
            <Textarea value={wishContent} onChange={(e) => setWishContent(e.target.value)} placeholder="សរសេរពាក្យជូនពរ..." rows={2} className="border-yellow-500/20 bg-yellow-500/5 text-yellow-100 rounded-xl placeholder:text-yellow-200/20" />
            <Button onClick={submitWish} variant="outline" className="w-full border-yellow-500/20 text-yellow-200/60 hover:bg-yellow-500/10 rounded-xl" disabled={!wishContent.trim()}>
              ផ្ញើពាក្យជូនពរ
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent mx-auto mb-6" />
          <p className="text-xs text-yellow-200/20 tracking-widest uppercase">E-Wedding</p>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-500 border-t-transparent" />
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}
