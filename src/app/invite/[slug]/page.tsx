"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { startBuiltinMusic, stopMusic, pauseMusic, resumeMusic, isBuiltinMusic } from "@/lib/wedding-music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MapPin, Clock, Camera, Gift, MessageCircle, Calendar, ChevronDown, Play, Pause, Share2, Video, Shirt, X } from "lucide-react";
import type { Invitation, Guest, Wish, QRCode, GalleryPhoto, TimelineEvent } from "@/types/database";

function InvitationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawTo = searchParams.get("to") || "";
  const guestName = (() => { try { return decodeURIComponent(rawTo); } catch { return rawTo; } })();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const cleanName = (s: string) => s.replace(/-[a-z0-9]{10,}$/i, "").replace(/-/g, " ").trim();
  const displayName = guest?.name ? cleanName(guest.name) : cleanName(guestName);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "not_attending" | "">("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [wishName, setWishName] = useState("");
  useEffect(() => { if (displayName && !wishName) setWishName(displayName); }, [displayName]);
  const [wishContent, setWishContent] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [wishSubmitted, setWishSubmitted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeline = ((invitation as any)?.timeline || []) as TimelineEvent[];
  const supabase = createClient();

  const T: Record<string, {
    bg: string; bgMain: string; cardFrom: string; cardTo: string;
    textPri: string; textSec: string; textMut: string;
    accent: string; accentFill: string; accentBg: string;
    btnFrom: string; btnTo: string;
  }> = {
    "1":  { bg: "linear-gradient(180deg, #fdf8f0 0%, #f5edd8 50%, #efe4c8 100%)", bgMain: "linear-gradient(180deg, #fdf8f0 0%, #f5edd8 100%)", cardFrom: "#ffffffee", cardTo: "#faf6eecc", textPri: "#6b4c1e", textSec: "rgba(107,76,30,0.7)", textMut: "rgba(107,76,30,0.45)", accent: "#b8860b", accentFill: "rgba(184,134,11,0.25)", accentBg: "rgba(184,134,11,0.06)", btnFrom: "#d4a843", btnTo: "#b8860b" },
    "2":  { bg: "linear-gradient(135deg, #1a1a0e, #2d2a1e, #3d3520)", bgMain: "linear-gradient(180deg, #1a1a0e, #1a1505)", cardFrom: "#2a2510", cardTo: "#1a1505", textPri: "#fef3c7", textSec: "rgba(254,243,199,0.6)", textMut: "rgba(254,243,199,0.4)", accent: "#f59e0b", accentFill: "rgba(245,158,11,0.2)", accentBg: "rgba(245,158,11,0.05)", btnFrom: "#d97706", btnTo: "#92400e" },
    "3":  { bg: "linear-gradient(135deg, #2e1a1a, #3e1616, #601010)", bgMain: "linear-gradient(180deg, #2e1a1a, #1e0d0d)", cardFrom: "#4a1e1e", cardTo: "#3e0d0d", textPri: "#fecaca", textSec: "rgba(254,202,202,0.6)", textMut: "rgba(254,202,202,0.4)", accent: "#ef4444", accentFill: "rgba(239,68,68,0.2)", accentBg: "rgba(239,68,68,0.05)", btnFrom: "#dc2626", btnTo: "#991b1b" },
    "4":  { bg: "linear-gradient(135deg, #0e1a2e, #16213e, #1e3a5e)", bgMain: "linear-gradient(180deg, #0e1a2e, #0d1b3e)", cardFrom: "#1e2a5e", cardTo: "#0d1b4e", textPri: "#bfdbfe", textSec: "rgba(191,219,254,0.6)", textMut: "rgba(191,219,254,0.4)", accent: "#3b82f6", accentFill: "rgba(59,130,246,0.2)", accentBg: "rgba(59,130,246,0.05)", btnFrom: "#2563eb", btnTo: "#1d4ed8" },
    "5":  { bg: "linear-gradient(135deg, #1a0e2e, #2e1640, #401060)", bgMain: "linear-gradient(180deg, #1a0e2e, #1e0d3e)", cardFrom: "#2a1e4a", cardTo: "#1e0d3e", textPri: "#ddd6fe", textSec: "rgba(221,214,254,0.6)", textMut: "rgba(221,214,254,0.4)", accent: "#a855f7", accentFill: "rgba(168,85,247,0.2)", accentBg: "rgba(168,85,247,0.05)", btnFrom: "#9333ea", btnTo: "#7e22ce" },
    "6":  { bg: "linear-gradient(135deg, #0e2e1a, #163e21, #106030)", bgMain: "linear-gradient(180deg, #0e2e1a, #0d3e1a)", cardFrom: "#1e4a2a", cardTo: "#0d3e1a", textPri: "#bbf7d0", textSec: "rgba(187,247,208,0.6)", textMut: "rgba(187,247,208,0.4)", accent: "#22c55e", accentFill: "rgba(34,197,94,0.2)", accentBg: "rgba(34,197,94,0.05)", btnFrom: "#16a34a", btnTo: "#15803d" },
    "7":  { bg: "linear-gradient(135deg, #1a1a1e, #2e2e32, #404045)", bgMain: "linear-gradient(180deg, #1a1a1e, #1a1a20)", cardFrom: "#2a2a30", cardTo: "#1a1a20", textPri: "#e2e8f0", textSec: "rgba(226,232,240,0.6)", textMut: "rgba(226,232,240,0.4)", accent: "#94a3b8", accentFill: "rgba(148,163,184,0.2)", accentBg: "rgba(148,163,184,0.05)", btnFrom: "#64748b", btnTo: "#475569" },
    "8":  { bg: "linear-gradient(135deg, #2e1a0e, #402e16, #604010)", bgMain: "linear-gradient(180deg, #2e1a0e, #3e2a0d)", cardFrom: "#4a2a1e", cardTo: "#3e1a0d", textPri: "#fde68a", textSec: "rgba(253,230,138,0.6)", textMut: "rgba(253,230,138,0.4)", accent: "#fbbf24", accentFill: "rgba(251,191,36,0.2)", accentBg: "rgba(251,191,36,0.05)", btnFrom: "#f59e0b", btnTo: "#d97706" },
    "9":  { bg: "linear-gradient(135deg, #0e2e2e, #163e3e, #106060)", bgMain: "linear-gradient(180deg, #0e2e2e, #0d3e3e)", cardFrom: "#1e4a4a", cardTo: "#0d3e3e", textPri: "#a5f3fc", textSec: "rgba(165,243,252,0.6)", textMut: "rgba(165,243,252,0.4)", accent: "#06b6d4", accentFill: "rgba(6,182,212,0.2)", accentBg: "rgba(6,182,212,0.05)", btnFrom: "#0891b2", btnTo: "#0e7490" },
    "10": { bg: "linear-gradient(135deg, #2e0e2e, #401640, #601060)", bgMain: "linear-gradient(180deg, #2e0e2e, #3e0d3e)", cardFrom: "#4a1e4a", cardTo: "#3e0d3e", textPri: "#f5d0fe", textSec: "rgba(245,208,254,0.6)", textMut: "rgba(245,208,254,0.4)", accent: "#d946ef", accentFill: "rgba(217,70,239,0.2)", accentBg: "rgba(217,70,239,0.05)", btnFrom: "#c026d3", btnTo: "#a21caf" },
    "11": { bg: "linear-gradient(135deg, #2e1a0e, #3e2e16, #504010)", bgMain: "linear-gradient(180deg, #2e1a0e, #3e2a0d)", cardFrom: "#4a3a1e", cardTo: "#3e2a0d", textPri: "#fde68a", textSec: "rgba(253,230,138,0.6)", textMut: "rgba(253,230,138,0.4)", accent: "#d97706", accentFill: "rgba(217,119,6,0.2)", accentBg: "rgba(217,119,6,0.05)", btnFrom: "#b45309", btnTo: "#92400e" },
    "12": { bg: "linear-gradient(135deg, #1a1a1e, #2e2e32, #3e3e42)", bgMain: "linear-gradient(180deg, #1a1a1e, #1a1a20)", cardFrom: "#2a2a30", cardTo: "#1a1a20", textPri: "#e5e7eb", textSec: "rgba(229,231,235,0.6)", textMut: "rgba(229,231,235,0.4)", accent: "#9ca3af", accentFill: "rgba(156,163,175,0.2)", accentBg: "rgba(156,163,175,0.05)", btnFrom: "#6b7280", btnTo: "#4b5563" },
  };

  const tid = (invitation as any)?.template_id || "1";
  const t = T[tid] || T["1"];
  const isLight = tid === "1";

  const cardStyle = isLight
    ? { background: "linear-gradient(145deg, #fffefa, #f8f2e4)", border: `1.5px solid ${t.accent}20`, boxShadow: `0 4px 24px ${t.accent}10` }
    : { background: `linear-gradient(135deg, ${t.cardFrom}cc, ${t.cardTo}cc)`, border: `1px solid ${t.accent}25` };

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

  const toggleMusic = () => {
    const music = invitation?.background_music;
    if (!music) return;

    if (isBuiltinMusic(music)) {
      if (musicPlaying) {
        pauseMusic();
        setMusicPlaying(false);
      } else {
        resumeMusic();
        setMusicPlaying(true);
      }
      return;
    }

    if (!audioRef.current && music && !music.startsWith("builtin:")) {
      audioRef.current = new Audio(music);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      audioRef.current.addEventListener("error", () => {
        setMusicPlaying(false);
      });
    }
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const openEnvelope = () => {
    setOpened(true);
    const music = invitation?.background_music;
    if (!music) return;

    if (isBuiltinMusic(music)) {
      startBuiltinMusic(music);
      setMusicPlaying(true);
      return;
    }

    if (music && !music.startsWith("builtin:")) {
      const audio = new Audio(music);
      audio.loop = true;
      audio.volume = 0.4;
      audio.play().then(() => {
        audioRef.current = audio;
        setMusicPlaying(true);
      }).catch(() => {});
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = invitation
    ? `💌 សូមអញ្ជើញចូលរួមពិធីរៀបអាពាហ៍ពិពាហ៍ ${invitation.groom_name_kh || invitation.groom_name} & ${invitation.bride_name_kh || invitation.bride_name}`
    : "";

  const fetchInvitation = async () => {
    const { data: inv } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "published")
      .single();

    if (!inv) { setLoading(false); return; }
    setInvitation(inv);

    const [guestData, wishesData, qrData, photoData] = await Promise.all([
      guestName
        ? supabase.from("guests").select("*").eq("invitation_id", inv.id).ilike("custom_link", `%${guestName.toLowerCase().replace(/\s+/g, "-")}%`).single()
        : Promise.resolve({ data: null }),
      supabase.from("wishes").select("*").eq("invitation_id", inv.id).eq("is_approved", true).order("created_at", { ascending: false }),
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
    let finalGuestId = guest?.id;
    if (!finalGuestId && guestName) {
      const { data: ng } = await supabase.from("guests").insert({ invitation_id: invitation.id, name: guestName, custom_link: `${params.slug}/guest/${guestName.toLowerCase().replace(/\s+/g, "-")}`, side: "both" }).select().single();
      finalGuestId = ng?.id;
    }
    if (!finalGuestId) return;
    await supabase.from("rsvps").insert({ guest_id: finalGuestId, invitation_id: invitation.id, status: rsvpStatus, number_of_guests: rsvpGuests, message: rsvpMessage });
    setRsvpSubmitted(true);
    try {
      fetch("/api/telegram/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "guest_link",
          data: {
            guestName: guestName || "ភ្ញៀវ",
            coupleName: `${invitation.groom_name_kh || invitation.groom_name} & ${invitation.bride_name_kh || invitation.bride_name}`,
            weddingDate: new Date(invitation.wedding_date).toLocaleDateString("km-KH"),
            venueName: invitation.venue_name || "",
            inviteLink: typeof window !== "undefined" ? window.location.href : "",
          },
        }),
      });
    } catch {}
  };

  const submitWish = async () => {
    if (!invitation || !wishContent.trim()) return;
    await supabase.from("wishes").insert({ invitation_id: invitation.id, guest_id: guest?.id || null, sender_name: wishName || "អនាមិក", content: wishContent, is_approved: false });
    setWishSubmitted(true);
    setWishContent("");
  };

  const goldDot = (c: string) => (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${c}40)` }} />
      <div className="h-2 w-2 rounded-full" style={{ background: c }} />
      <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${c}40)` }} />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent mx-auto" style={{ borderColor: t.accent }} />
          <p className="mt-4 text-sm" style={{ color: t.textMut }}>កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="text-center px-4">
          <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ border: `2px solid ${t.accent}40` }}>
            <Heart className="h-10 w-10" style={{ color: `${t.accent}80` }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: t.textPri }}>រកមិនឃើញលិខិតអញ្ជើញ</h1>
          <p style={{ color: t.textMut }}>Link លិខិតអញ្ជើញនេះមិនត្រឹមត្រូវ ឬត្រូវបានលុប។</p>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(invitation.wedding_date);

  if (!opened) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: t.bg }}>
        <div className="text-center max-w-md w-full">
          {isLight ? (
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] opacity-30" style={{ background: `linear-gradient(135deg, ${t.accent}30, transparent, ${t.accent}20)` }} />
              <div className="relative rounded-[2rem] p-10 shadow-[0_8px_40px_rgba(184,134,11,0.15)]" style={{ background: "linear-gradient(145deg, #fffefa, #f8f2e4)", border: `2px solid ${t.accent}30` }}>
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[2rem]" style={{ background: `linear-gradient(to right, transparent, ${t.accent}60, transparent)` }} />
                <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `linear-gradient(135deg, ${t.accent}15, ${t.accent}08)`, border: `2px solid ${t.accent}30` }}>
                  <Heart className="h-10 w-10" style={{ color: t.accent, fill: t.accentFill }} />
                </div>
                <p className="text-xs tracking-[0.35em] uppercase mb-3 font-medium" style={{ color: t.accent }}>Wedding Invitation</p>
                <h1 className="text-3xl font-bold mb-1" style={{ color: t.textPri }}>{invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}</h1>
                <div className="flex items-center justify-center gap-4 my-4">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${t.accent}40)` }} />
                  <span className="text-3xl font-light" style={{ color: t.accent }}>&amp;</span>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${t.accent}40)` }} />
                </div>
                <h1 className="text-3xl font-bold mb-6" style={{ color: t.textPri }}>{invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}</h1>
                {displayName && (
                  <div className="mb-6 py-3 px-5 rounded-2xl" style={{ border: `1px solid ${t.accent}20`, background: `${t.accent}08` }}>
                    <p className="text-xs tracking-wider uppercase" style={{ color: t.accent }}>សូមអញ្ជើញ</p>
                    <p className="font-semibold text-lg mt-1" style={{ color: t.textPri }}>{displayName}</p>
                  </div>
                )}
                <p className="text-sm mb-8" style={{ color: t.textSec }}>{weddingDate.toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <Button onClick={openEnvelope} className="w-full text-white rounded-2xl h-12 font-semibold tracking-wide shadow-lg" style={{ background: `linear-gradient(135deg, ${t.btnFrom}, ${t.btnTo})`, boxShadow: `0 6px 24px ${t.accent}40` }}>បើកលិខិតអញ្ជើញ</Button>
                <div className="mt-6 flex items-center justify-center"><ChevronDown className="h-5 w-5 animate-bounce" style={{ color: `${t.accent}50` }} /></div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl blur-xl" style={{ background: `${t.accent}15` }} />
              <div className="relative rounded-3xl p-8 shadow-2xl" style={cardStyle}>
                <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ border: `1px solid ${t.accent}30`, background: t.accentBg }}>
                  <Heart className="h-8 w-8" style={{ color: t.accent, fill: t.accentFill }} />
                </div>
                <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: t.textMut }}>Wedding Invitation</p>
                <h1 className="text-3xl font-bold mb-1" style={{ color: t.textPri }}>{invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}</h1>
                <div className="flex items-center justify-center gap-3 my-3">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${t.accent}40)` }} />
                  <span className="text-2xl font-light" style={{ color: t.accent }}>&amp;</span>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${t.accent}40)` }} />
                </div>
                <h1 className="text-3xl font-bold mb-6" style={{ color: t.textPri }}>{invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}</h1>
                {displayName && (
                  <div className="mb-6 py-3 px-4 rounded-xl" style={{ border: `1px solid ${t.accent}25`, background: t.accentBg }}>
                    <p className="text-xs" style={{ color: t.textMut }}>សូមអញ្ជើញ</p>
                    <p className="font-semibold" style={{ color: t.textPri }}>{displayName}</p>
                  </div>
                )}
                <p className="text-sm mb-6" style={{ color: t.textSec }}>{weddingDate.toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <Button onClick={openEnvelope} className="w-full text-white rounded-xl h-12 font-medium tracking-wide shadow-lg" style={{ background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})` }}>បើកលិខិតអញ្ជើញ</Button>
                <div className="mt-6 flex items-center justify-center"><ChevronDown className="h-4 w-4 animate-bounce" style={{ color: `${t.accent}40` }} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: t.bgMain }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .7s ease-out both}` }} />
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: `${t.accent}08` }} />
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full blur-[60px]" style={{ background: `${t.accent}08` }} />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full blur-[60px]" style={{ background: `${t.accent}08` }} />
        </div>
        <div className="max-w-lg mx-auto relative">
          <div className="mb-8">
            {goldDot(t.accent)}
            <p className="text-xs tracking-[0.4em] uppercase mb-3 font-medium mt-6" style={{ color: t.accent }}>Invitation</p>
            <p className="text-sm mb-6" style={{ color: t.textSec }}>សូមអញ្ជើញចូលរួមក្នុងថ្ងៃរៀបការរបស់យើង</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-wide" style={{ color: t.textPri }}>{invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}</h1>
          <div className="flex items-center justify-center gap-4 my-5">
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${t.accent}50)` }} />
            <Heart className="h-6 w-6" style={{ color: t.accent, fill: t.accentFill }} />
            <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${t.accent}50)` }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-wide" style={{ color: t.textPri }}>{invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}</h1>
          {displayName && (
            <div className="inline-block rounded-full px-8 py-3 mb-6" style={{ border: `1.5px solid ${t.accent}25`, background: isLight ? `linear-gradient(135deg, #ffffffee, ${t.accent}08)` : t.accentBg }}>
              <p className="text-xs tracking-wider uppercase" style={{ color: t.accent }}>សូមអញ្ជើញ</p>
              <p className="font-semibold text-lg" style={{ color: t.textPri }}>{displayName}</p>
            </div>
          )}
          {invitation.quote && <p className="italic text-base max-w-sm mx-auto" style={{ color: t.textSec }}>&ldquo;{invitation.quote}&rdquo;</p>}
          <div className="mt-8">{goldDot(t.accent)}</div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: `${t.accent}20`, border: `1px solid ${t.accent}30` }}>
                <Share2 className="h-4 w-4" style={{ color: t.accent }} />
              </div>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: `${t.accent}20`, border: `1px solid ${t.accent}30` }}>
                <span className="text-sm font-bold" style={{ color: t.accent }}>f</span>
              </div>
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: `${t.accent}20`, border: `1px solid ${t.accent}30` }}>
                <span className="text-sm font-bold" style={{ color: t.accent }}>W</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="py-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[{ value: timeLeft.days, label: "ថ្ងៃ" }, { value: timeLeft.hours, label: "ម៉ោង" }, { value: timeLeft.minutes, label: "នាទី" }, { value: timeLeft.seconds, label: "វិនាទី" }].map((item, i) => (
              <div key={i} className="rounded-xl p-3" style={{ ...cardStyle, border: `1px solid ${t.accent}20` }}>
                <p className="text-2xl font-bold" style={{ color: t.textPri }}>{item.value}</p>
                <p className="text-xs" style={{ color: t.textMut }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 space-y-6 pb-20">
        <div className="rounded-2xl p-6 text-center" style={cardStyle}>
          <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: `1px solid ${t.accent}25`, background: t.accentBg }}>
            <Calendar className="h-5 w-5" style={{ color: t.accent }} />
          </div>
          <h2 className="text-lg font-bold mb-4 tracking-wide" style={{ color: t.textPri }}>ព័ត៌មានពិធីការ</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
              <Calendar className="h-4 w-4" style={{ color: `${t.accent}90` }} />
              <span className="text-sm">{weddingDate.toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            {invitation.ceremony_time && (
              <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
                <Clock className="h-4 w-4" style={{ color: `${t.accent}90` }} />
                <span className="text-sm">ពិធីជប់លៀង: {invitation.ceremony_time}</span>
              </div>
            )}
            {invitation.reception_time && (
              <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
                <Clock className="h-4 w-4" style={{ color: `${t.accent}90` }} />
                <span className="text-sm">ស្វាគមន៍: {invitation.reception_time}</span>
              </div>
            )}
            <div className="h-px w-16 mx-auto my-3" style={{ background: `${t.accent}25` }} />
            {invitation.venue_name && (
              <div className="flex items-center justify-center gap-2" style={{ color: t.textPri }}>
                <MapPin className="h-4 w-4" style={{ color: t.accent }} />
                <span className="font-medium">{invitation.venue_name}</span>
              </div>
            )}
            {invitation.venue_address && <p className="text-sm max-w-sm mx-auto" style={{ color: t.textMut }}>{invitation.venue_address}</p>}
            {invitation.venue_map_url && (
              <a href={invitation.venue_map_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl" style={{ borderColor: `${t.accent}35`, color: t.textSec }}><MapPin className="h-4 w-4" /> បើកក្នុង Google Maps</Button>
              </a>
            )}
          </div>
        </div>

        {timeline.length > 0 && (
          <div className="rounded-2xl p-6 fade-up" style={cardStyle}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-5 w-5" style={{ color: t.accent }} />
              <h2 className="text-lg font-bold tracking-wide" style={{ color: t.textPri }}>កាលវិភាគពិធី</h2>
            </div>
            <div className="h-px w-16 mx-auto mb-6" style={{ background: `${t.accent}25` }} />
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: `${t.accent}30` }} />
              {timeline.map((ev, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  <div className="absolute -left-5 top-1 h-3 w-3 rounded-full border-2" style={{ borderColor: t.accent, background: t.accentBg }} />
                  <p className="text-xs font-bold" style={{ color: t.accent }}>{ev.time}</p>
                  <p className="font-medium text-sm" style={{ color: t.textPri }}>{ev.title}</p>
                  {ev.description && <p className="text-xs mt-0.5" style={{ color: t.textMut }}>{ev.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {invitation.dress_code && (
          <div className="rounded-2xl p-6 fade-up" style={cardStyle}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shirt className="h-5 w-5" style={{ color: t.accent }} />
              <h2 className="text-lg font-bold tracking-wide" style={{ color: t.textPri }}>ការស្លៀកពាក់</h2>
            </div>
            <div className="h-px w-16 mx-auto mb-3" style={{ background: `${t.accent}25` }} />
            <p className="text-sm text-center" style={{ color: t.textSec }}>{invitation.dress_code}</p>
            {invitation.dress_code_color && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-5 w-5 rounded-full border" style={{ background: invitation.dress_code_color, borderColor: `${t.accent}30` }} />
                <span className="text-xs" style={{ color: t.textMut }}>{invitation.dress_code_color}</span>
              </div>
            )}
          </div>
        )}

        {invitation.story && (
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4 text-center tracking-wide" style={{ color: t.textPri }}>រឿងស្នេហារបស់យើង</h2>
            <div className="h-px w-16 mx-auto mb-4" style={{ background: `${t.accent}25` }} />
            <p className="whitespace-pre-line leading-relaxed text-sm text-center" style={{ color: t.textSec }}>{invitation.story}</p>
          </div>
        )}

        {invitation.video_url && (
          <div className="rounded-2xl p-6 fade-up" style={cardStyle}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Video className="h-5 w-5" style={{ color: t.accent }} />
              <h2 className="text-lg font-bold tracking-wide" style={{ color: t.textPri }}>វីដេអូរៀបការ</h2>
            </div>
            <div className="h-px w-16 mx-auto mb-4" style={{ background: `${t.accent}25` }} />
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={invitation.video_url}
                className="absolute inset-0 w-full h-full rounded-xl"
                style={{ border: `1px solid ${t.accent}20` }}
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="rounded-2xl p-6" style={cardStyle}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="h-5 w-5" style={{ color: t.accent }} />
              <h2 className="text-lg font-bold tracking-wide" style={{ color: t.textPri }}>វិចិត្រសាលរូបភាព</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-xl overflow-hidden cursor-pointer" style={{ border: `1px solid ${t.accent}15` }} onClick={() => setLightboxPhoto(photo.url)}>
                  <img src={photo.url} alt={photo.caption || "រូបភាពរៀបការ"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {qrCodes.length > 0 && (
          <div className="rounded-2xl p-6 text-center" style={cardStyle}>
            <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: `1px solid ${t.accent}25`, background: t.accentBg }}>
              <Gift className="h-5 w-5" style={{ color: t.accent }} />
            </div>
            <h2 className="text-lg font-bold mb-4 tracking-wide" style={{ color: t.textPri }}>ចំណងដៃ</h2>
            <div className="h-px w-16 mx-auto mb-4" style={{ background: `${t.accent}25` }} />
            <div className="grid grid-cols-1 gap-4">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="rounded-xl p-4" style={{ border: `1px solid ${t.accent}20`, background: t.accentBg }}>
                  {qr.qr_image_url && <img src={qr.qr_image_url} alt="QR Code" className="w-40 h-40 mx-auto mb-3 rounded-lg bg-white p-2" />}
                  {qr.bank_name && <p className="font-medium text-sm" style={{ color: t.textPri }}>{qr.bank_name}</p>}
                  {qr.account_name && <p className="text-xs" style={{ color: t.textSec }}>{qr.account_name}</p>}
                  {qr.account_number && <p className="text-xs font-mono" style={{ color: t.textMut }}>{qr.account_number}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-lg font-bold mb-4 text-center tracking-wide" style={{ color: t.textPri }}>បញ្ជាក់ការចូលរួម</h2>
          <div className="h-px w-16 mx-auto mb-4" style={{ background: `${t.accent}25` }} />
          {rsvpSubmitted ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: `1px solid ${t.accent}35`, background: t.accentBg }}>
                <Heart className="h-8 w-8" style={{ color: t.accent, fill: t.accentFill }} />
              </div>
              <p className="font-semibold text-lg" style={{ color: t.textPri }}>អរគុណ!</p>
              <p className="text-sm mt-1" style={{ color: t.textSec }}>យើងរង់ចាំជួបអ្នក។</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: t.textSec }}>តើអ្នកនឹងមកចូលរួមទេ?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([{ value: "attending" as const, label: "✓ នឹងមក" }, { value: "not_attending" as const, label: "✗ មិនមក" }]).map((opt) => (
                    <Button key={opt.value} variant="outline" className="rounded-xl h-11"
                      style={rsvpStatus === opt.value ? { background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})`, borderColor: t.accent, color: "white" } : { borderColor: `${t.accent}30`, color: t.textSec }}
                      onClick={() => setRsvpStatus(opt.value)}>
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              {rsvpStatus === "attending" && (
                <div className="space-y-2">
                  <Label className="text-sm" style={{ color: t.textSec }}>អ្នកមកជាមួយប៉ុន្មាននាក់?</Label>
                  <Input type="number" min={1} max={10} value={rsvpGuests} onChange={(e) => setRsvpGuests(parseInt(e.target.value) || 1)} className="rounded-xl" style={{ borderColor: `${t.accent}25`, background: t.accentBg, color: t.textPri }} />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: t.textSec }}>សារជូនពរ (ជម្រើស)</Label>
                <Textarea value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} placeholder="សរសេរពាក្យជូនពរដល់គូស្នេហ៍..." rows={3} className="rounded-xl" style={{ borderColor: `${t.accent}25`, background: t.accentBg, color: t.textPri }} />
              </div>
              <Button onClick={submitRSVP} className="w-full text-white rounded-xl h-11 shadow-lg" style={{ background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})` }} disabled={!rsvpStatus}>ផ្ញើការឆ្លើយតប</Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5" style={{ color: t.accent }} />
            <h2 className="text-lg font-bold tracking-wide" style={{ color: t.textPri }}>ពាក្យជូនពរ</h2>
          </div>
          <div className="h-px w-16 mx-auto mb-4" style={{ background: `${t.accent}25` }} />
          {wishSubmitted && (
            <div className="text-sm p-3 rounded-xl mb-4 text-center" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>បានផ្ញើពាក្យជូនពរ!</div>
          )}
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {wishes.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: t.textMut }}>មិនទាន់មានពាក្យជូនពរ។</p>
            ) : (
              wishes.map((wish) => (
                <div key={wish.id} className="rounded-xl p-3" style={{ border: `1px solid ${t.accent}15`, background: t.accentBg }}>
                  <p className="font-medium text-sm" style={{ color: t.textPri }}>{cleanName(wish.sender_name)}</p>
                  <p className="text-sm mt-1" style={{ color: t.textMut }}>{wish.content}</p>
                </div>
              ))
            )}
          </div>
          <div className="space-y-3 pt-4" style={{ borderTop: `1px solid ${t.accent}15` }}>
            <Input value={wishName} onChange={(e) => setWishName(e.target.value)} placeholder="ឈ្មោះរបស់អ្នក" className="rounded-xl" style={{ borderColor: `${t.accent}25`, background: t.accentBg, color: t.textPri }} />
            <Textarea value={wishContent} onChange={(e) => setWishContent(e.target.value)} placeholder="សរសេរពាក្យជូនពរ..." rows={2} className="rounded-xl" style={{ borderColor: `${t.accent}25`, background: t.accentBg, color: t.textPri }} />
            <Button onClick={submitWish} variant="outline" className="w-full rounded-xl" style={{ borderColor: `${t.accent}25`, color: t.textSec }} disabled={!wishContent.trim()}>ផ្ញើពាក្យជូនពរ</Button>
          </div>
        </div>

        <div className="text-center pt-4">
          <div className="h-px w-24 mx-auto mb-6" style={{ background: `linear-gradient(to right, transparent, ${t.accent}30, transparent)` }} />
          <p className="text-xs tracking-widest uppercase" style={{ color: t.textMut }}>E-Wedding</p>
        </div>
      </div>

      {invitation.background_music && (
        <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${t.btnFrom}, ${t.btnTo})` }}>
          {musicPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
        </button>
      )}

      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightboxPhoto(null)}>
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <X className="h-5 w-5 text-white" />
          </button>
          <img src={lightboxPhoto} alt="រូបភាព" className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #fdf8f0, #f5edd8)" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#b8860b] border-t-transparent" />
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}
