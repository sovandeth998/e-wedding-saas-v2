"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { startBuiltinMusic, stopMusic, pauseMusic, resumeMusic, isBuiltinMusic } from "@/lib/wedding-music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MapPin, Clock, Camera, Gift, MessageCircle, Calendar, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, Share2, Video, Shirt, X, Send, Sparkles } from "lucide-react";
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
  const [wishSending, setWishSending] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeline = ((invitation as any)?.timeline || []) as TimelineEvent[];
  const supabase = createClient();
  const [templateConfig, setTemplateConfig] = useState<Record<string, any> | null>(null);

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
  const fallbackT = T[tid] || T["1"];
  const t = templateConfig && templateConfig.bg ? {
    bg: templateConfig.bg || fallbackT.bg,
    bgMain: templateConfig.bgMain || fallbackT.bgMain,
    cardFrom: templateConfig.cardFrom || fallbackT.cardFrom,
    cardTo: templateConfig.cardTo || fallbackT.cardTo,
    textPri: templateConfig.textPri || fallbackT.textPri,
    textSec: templateConfig.textSec || fallbackT.textSec,
    textMut: templateConfig.textMut || fallbackT.textMut,
    accent: templateConfig.accent || fallbackT.accent,
    accentFill: templateConfig.accentFill || fallbackT.accentFill,
    accentBg: templateConfig.accentBg || fallbackT.accentBg,
    btnFrom: templateConfig.btnFrom || fallbackT.btnFrom,
    btnTo: templateConfig.btnTo || fallbackT.btnTo,
  } : fallbackT;
  const isLight = templateConfig?.isLight ?? (tid === "1");

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

    if (inv.template_id) {
      const { data: tpl } = await supabase
        .from("templates")
        .select("config")
        .eq("code", inv.template_id)
        .single();
      if (tpl?.config) setTemplateConfig(typeof tpl.config === "string" ? JSON.parse(tpl.config) : tpl.config);
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitation_id: inv.id,
        guest_id: null,
        guest_name: guestName || null,
      }),
    }).catch(() => {});

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

  const ensureGuestId = async (): Promise<string | null | undefined> => {
    if (guest?.id) return guest.id;
    if (!guestName) return undefined;
    const { data: ng } = await supabase.from("guests").insert({ invitation_id: (invitation as any).id, name: guestName, custom_link: `${params.slug}/guest/${guestName.toLowerCase().replace(/\s+/g, "-")}`, share_code: undefined as any, side: "both" }).select().single();
    return ng?.id;
  };

  const submitRSVP = async () => {
    if (!invitation || !rsvpStatus) return;
    let finalGuestId = await ensureGuestId();
    if (!finalGuestId) return;
    await supabase.from("rsvps").insert({ guest_id: finalGuestId, invitation_id: invitation.id, status: rsvpStatus, number_of_guests: rsvpGuests, message: rsvpMessage });
    setRsvpSubmitted(true);
    if (rsvpMessage.trim()) {
      const senderName = displayName || guestName || "អនាមិក";
      const { error: wErr } = await supabase.from("wishes").insert({ invitation_id: invitation.id, guest_id: finalGuestId, sender_name: senderName, content: rsvpMessage, is_approved: true });
      if (!wErr) {
        const { data: freshWishes } = await supabase.from("wishes").select("*").eq("invitation_id", invitation.id).eq("is_approved", true).order("created_at", { ascending: false });
        setWishes(freshWishes || []);
      }
    }
    try {
      fetch("/api/telegram/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rsvp",
          data: {
            guestName: displayName || guestName || "ភ្ញៀវ",
            status: rsvpStatus,
            numberOfGuests: rsvpGuests.toString(),
            message: rsvpMessage,
          },
        }),
      });
    } catch {}
  };

  const submitWish = async () => {
    if (!invitation || !wishContent.trim()) return;
    setWishSending(true);
    let finalGuestId: string | null | undefined = guest?.id;
    if (!finalGuestId && (wishName.trim() || displayName)) {
      const nm = wishName.trim() || displayName!;
      const { data: ng } = await supabase.from("guests").insert({ invitation_id: invitation.id, name: nm, custom_link: `${params.slug}/guest/${nm.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, side: "both" }).select().single();
      finalGuestId = ng?.id;
    }
    const { error } = await supabase.from("wishes").insert({
      invitation_id: invitation.id,
      guest_id: finalGuestId || null,
      sender_name: wishName.trim() || displayName || "អនាមិក",
      content: wishContent.trim(),
      is_approved: true,
    });
    if (!error) {
      const { data: fresh } = await supabase.from("wishes").select("*").eq("invitation_id", invitation.id).eq("is_approved", true).order("created_at", { ascending: false });
      setWishes(fresh || []);
      setWishContent("");
      toast.success("បានផ្ញើពាក្យជូនពរ! 💐");
    } else {
      toast.error("បរាជ័យក្នុងការផ្ញើ");
    }
    setWishSending(false);
  };

  // ---------- shared decorative pieces ----------
  const Ornament = ({ c }: { c: string }) => (
    <div className="flex items-center justify-center gap-2">
      <span className="h-px w-10 md:w-14" style={{ background: `linear-gradient(to right, transparent, ${c}60)` }} />
      <span className="h-1.5 w-1.5 rotate-45 shrink-0" style={{ background: c }} />
      <span className="h-px w-10 md:w-14" style={{ background: `linear-gradient(to left, transparent, ${c}60)` }} />
    </div>
  );

  const SectionHead = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="text-center mb-5">
      <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ border: `1px solid ${t.accent}25`, background: t.accentBg }}>
        <Icon className="h-5 w-5" style={{ color: t.accent }} />
      </div>
      <h2 className="text-lg font-bold tracking-wide mb-2" style={{ color: t.textPri }}>{title}</h2>
      <Ornament c={t.accent} />
    </div>
  );

  const CoupleAvatars = ({ size = 56 }: { size?: number }) =>
    invitation?.groom_photo || invitation?.bride_photo ? (
      <div className="flex -space-x-3 justify-center mb-4">
        {[invitation.groom_photo, invitation.bride_photo].map((p, i) =>
          p ? (
            <img
              key={i}
              src={p}
              alt=""
              className={`rounded-full object-cover border-2 shadow-md ${i === 1 ? "" : ""}`}
              style={{ width: size, height: size, borderColor: t.accent }}
            />
          ) : null
        )}
      </div>
    ) : null;

  // ---------- loading / not found ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="text-center">
          <Heart className="h-10 w-10 mx-auto animate-pulse" style={{ color: t.accent, fill: t.accentFill }} />
          <p className="mt-4 text-sm" style={{ color: t.textMut }}>កំពុងផ្ទុកលិខិតអញ្ជើញ...</p>
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

  // ---------- ENVELOPE ----------
  if (!opened) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: t.bg }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes envIn{from{opacity:0;transform:translateY(26px) scale(.96)}to{opacity:1;transform:none}}
          @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          @keyframes pulseGlow{0%,100%{opacity:.35}50%{opacity:.7}}
        `}} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[15%] w-72 h-72 rounded-full blur-[110px]" style={{ background: `${t.accent}18`, animation: "pulseGlow 5s ease-in-out infinite" }} />
          <div className="absolute bottom-[-8%] right-[10%] w-80 h-80 rounded-full blur-[120px]" style={{ background: `${t.accent}14`, animation: "pulseGlow 6s ease-in-out 1s infinite" }} />
        </div>

        <div className="relative max-w-md w-full" style={{ animation: "envIn .8s ease-out both" }}>
          <div className="absolute -inset-4 rounded-[2.4rem] blur-2xl pointer-events-none" style={{ background: `${t.accent}20`, animation: "pulseGlow 4s ease-in-out infinite" }} />
          <div className="relative rounded-[2rem] px-8 py-10 md:px-10 shadow-2xl text-center overflow-hidden" style={cardStyle}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, transparent, ${t.accent}70, transparent)` }} />

            <CoupleAvatars size={64} />

            {!invitation.groom_photo && !invitation.bride_photo && (
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `linear-gradient(135deg, ${t.accent}15, ${t.accent}08)`, border: `2px solid ${t.accent}30`, animation: "floatY 4s ease-in-out infinite" }}>
                <Heart className="h-8 w-8" style={{ color: t.accent, fill: t.accentFill }} />
              </div>
            )}

            <p className="text-[10px] tracking-[0.4em] uppercase mb-3 font-medium" style={{ color: t.accent }}>Wedding Invitation</p>

            <h1 className="text-3xl font-bold leading-tight" style={{ color: t.textPri }}>
              {invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}
            </h1>
            <div className="flex items-center justify-center gap-3 my-3">
              <span className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${t.accent}50)` }} />
              <span className="text-xl font-light" style={{ color: t.accent }}>&amp;</span>
              <span className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${t.accent}50)` }} />
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-5" style={{ color: t.textPri }}>
              {invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}
            </h1>

            <Ornament c={t.accent} />

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ border: `1px solid ${t.accent}25`, color: t.textSec }}>
              <Calendar className="h-4 w-4" style={{ color: t.accent }} />
              {weddingDate.toLocaleDateString("km-KH", { day: "numeric", month: "long", year: "numeric" })}
            </div>

            {displayName && (
              <div className="mt-5 py-3.5 px-5 rounded-2xl" style={{ border: `1.5px solid ${t.accent}25`, background: t.accentBg }}>
                <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: t.accent }}>គូរាល់ជូន</p>
                <p className="font-bold text-lg" style={{ color: t.textPri }}>{displayName}</p>
              </div>
            )}

            <Button onClick={openEnvelope} className="mt-7 w-full text-white rounded-2xl h-13 h-12 font-semibold tracking-wide shadow-lg hover:scale-[1.02] transition-transform"
              style={{ background: `linear-gradient(135deg, ${t.btnFrom}, ${t.btnTo})`, boxShadow: `0 8px 28px ${t.accent}45` }}>
              ✉️ បើកលិខិតអញ្ជើញ
            </Button>

            <div className="mt-5"><ChevronDown className="h-5 w-5 animate-bounce mx-auto" style={{ color: `${t.accent}55` }} /></div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MAIN PAGE ----------
  return (
    <div className="min-h-screen" style={{ background: t.bgMain }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .7s ease-out both}
      `}} />

      {/* HERO */}
      <section className="relative pt-16 pb-10 px-4 text-center overflow-hidden fade-up">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[130px]" style={{ background: `${t.accent}0d` }} />
          <div className="absolute top-24 left-8 w-28 h-28 rounded-full blur-[60px]" style={{ background: `${t.accent}0d` }} />
          <div className="absolute bottom-4 right-8 w-28 h-28 rounded-full blur-[60px]" style={{ background: `${t.accent}0d` }} />
        </div>
        <div className="max-w-lg mx-auto relative">
          <CoupleAvatars size={72} />
          <p className="text-[10px] tracking-[0.45em] uppercase mb-2 font-medium mt-4" style={{ color: t.accent }}>Invitation</p>
          <p className="text-sm mb-7" style={{ color: t.textSec }}>សូមអញ្ជើញចូលរួមក្នុងថ្ងៃរៀបការរបស់យើង</p>

          {(invitation.groom_photo || invitation.bride_photo) ? (
            <div className="flex items-end justify-center gap-4 mb-6">
              {[{ p: invitation.groom_photo, n: invitation.groom_name_kh || invitation.groom_name }, { p: invitation.bride_photo, n: invitation.bride_name_kh || invitation.bride_name }].map((x, i) => (
                <div key={i} className="text-center">
                  {x.p ? (
                    <img src={x.p} alt="" className="rounded-[1.6rem] object-cover shadow-xl" style={{ width: 128, height: 158, border: `2px solid ${t.accent}45` }} />
                  ) : (
                    <div className="rounded-[1.6rem] flex items-center justify-center" style={{ width: 128, height: 158, border: `2px dashed ${t.accent}35`, color: `${t.accent}70` }}>
                      <Heart className="h-8 w-8" style={{ fill: t.accentFill, color: t.accent }} />
                    </div>
                  )}
                  <p className="text-sm font-semibold mt-2.5" style={{ color: t.textPri }}>{x.n || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold tracking-wide" style={{ color: t.textPri }}>{invitation.groom_name_kh || invitation.groom_name || "កូនកំលោះ"}</h1>
              <div className="flex items-center justify-center gap-4 my-5">
                <span className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${t.accent}50)` }} />
                <Heart className="h-6 w-6" style={{ color: t.accent, fill: t.accentFill }} />
                <span className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${t.accent}50)` }} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-wide" style={{ color: t.textPri }}>{invitation.bride_name_kh || invitation.bride_name || "កូនក្រមុំ"}</h1>
            </>
          )}

          {displayName && (
            <div className="inline-block mt-7 rounded-full px-7 py-2.5 fade-up" style={{ animationDelay: ".2s", border: `1.5px solid ${t.accent}30`, background: t.accentBg }}>
              <p className="font-semibold" style={{ color: t.textPri }}>
                <Sparkles className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" style={{ color: t.accent }} />
                សូមអញ្ជើញ <b>{displayName}</b>
              </p>
            </div>
          )}
          {invitation.quote && <p className="italic text-base max-w-sm mx-auto mt-5" style={{ color: t.textSec }}>&ldquo;{invitation.quote}&rdquo;</p>}

          <div className="mt-7"><Ornament c={t.accent} /></div>

          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, el: <Share2 className="h-4 w-4" /> },
              { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, el: <span className="text-sm font-bold">f</span> },
              { href: `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`, el: <span className="text-sm font-bold">W</span> },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="h-10 w-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30`, color: t.accent }}>
                {s.el}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="py-4 px-4 fade-up" style={{ animationDelay: ".15s" }}>
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2.5 text-center">
          {[{ v: timeLeft.days, l: "ថ្ងៃ" }, { v: timeLeft.hours, l: "ម៉ោង" }, { v: timeLeft.minutes, l: "នាទី" }, { v: timeLeft.seconds, l: "វិនាទី" }].map((item, i) => (
            <div key={i} className="rounded-2xl py-3 relative overflow-hidden" style={{ ...cardStyle }}>
              <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: `linear-gradient(to right, transparent, ${t.accent}55, transparent)` }} />
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: t.accent }}>{String(item.v).padStart(2, "0")}</p>
              <p className="text-[10px] mt-0.5" style={{ color: t.textMut }}>{item.l}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 space-y-6 pb-24 pt-4">

        {/* Event info */}
        <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".2s" }}>
          <SectionHead icon={Calendar} title="ព័ត៌មានពិធីការ" />
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
              <Calendar className="h-4 w-4 shrink-0" style={{ color: t.accent }} />
              <span className="text-sm">{weddingDate.toLocaleDateString("km-KH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            {invitation.ceremony_time && (
              <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
                <Clock className="h-4 w-4 shrink-0" style={{ color: t.accent }} />
                <span className="text-sm">ពិធីជប់លៀង៖ {invitation.ceremony_time}</span>
              </div>
            )}
            {invitation.reception_time && (
              <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
                <Clock className="h-4 w-4 shrink-0" style={{ color: t.accent }} />
                <span className="text-sm">ស្វាគមន៍៖ {invitation.reception_time}</span>
              </div>
            )}
            {invitation.venue_name && (
              <>
                <div className="pt-2"><Ornament c={t.accent} /></div>
                <div className="flex items-center justify-center gap-2" style={{ color: t.textPri }}>
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: t.accent }} />
                  <span className="font-semibold">{invitation.venue_name}</span>
                </div>
              </>
            )}
            {invitation.venue_address && <p className="text-sm max-w-sm mx-auto" style={{ color: t.textMut }}>{invitation.venue_address}</p>}
            {invitation.venue_map_url && (
              <a href={invitation.venue_map_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                <Button variant="outline" size="sm" className="gap-2 rounded-full hover:text-white transition-colors"
                  style={{ borderColor: `${t.accent}40`, color: t.accent, background: t.accentBg }}>
                  <MapPin className="h-4 w-4" /> បើកក្នុង Google Maps
                </Button>
              </a>
            )}
          </div>
        </section>

        {/* Timeline */}
        {timeline.length > 0 && (
          <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".25s" }}>
            <SectionHead icon={Clock} title="កាលវិភាគពិធី" />
            <div className="relative pl-8">
              <div className="absolute left-[11px] top-1 bottom-1 w-0.5 rounded" style={{ background: `linear-gradient(to bottom, ${t.accent}50, ${t.accent}15)` }} />
              {timeline.map((ev, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  <div className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full border-2 shadow-sm" style={{ borderColor: t.accent, background: isLight ? "#fff" : t.cardFrom }} />
                  <p className="text-xs font-extrabold tracking-wide" style={{ color: t.accent }}>{ev.time}</p>
                  <p className="font-semibold text-sm" style={{ color: t.textPri }}>{ev.title}</p>
                  {ev.description && <p className="text-xs mt-0.5" style={{ color: t.textMut }}>{ev.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dress code */}
        {invitation.dress_code && (
          <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".3s" }}>
            <SectionHead icon={Shirt} title="ការស្លៀកពាក់" />
            <p className="text-sm text-center" style={{ color: t.textSec }}>{invitation.dress_code}</p>
            {invitation.dress_code_color && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="h-5 w-5 rounded-full border shadow-inner" style={{ background: invitation.dress_code_color, borderColor: `${t.accent}35` }} />
                <span className="text-xs" style={{ color: t.textMut }}>ពណ៌ណែនាំ</span>
              </div>
            )}
          </section>
        )}

        {/* Story */}
        {invitation.story && (
          <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".35s" }}>
            <SectionHead icon={MessageCircle} title="រឿងស្នេហារបស់យើង" />
            <p className="whitespace-pre-line leading-relaxed text-sm text-center" style={{ color: t.textSec }}>{invitation.story}</p>
          </section>
        )}

        {/* Video */}
        {invitation.video_url && (
          <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".4s" }}>
            <SectionHead icon={Video} title="វីដេអូរៀបការ" />
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={invitation.video_url}
                className="absolute inset-0 w-full h-full rounded-2xl"
                style={{ border: `1px solid ${t.accent}20` }}
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
          </section>
        )}

        {/* Gallery */}
        {photos.length > 0 && (
          <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".45s" }}>
            <SectionHead icon={Camera} title="វិចិត្រសាលរូបភាព" />
            {photos.length === 1 ? (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in" style={{ border: `1px solid ${t.accent}20` }} onClick={() => setLightboxIdx(0)}>
                <img src={photos[0].url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className={`${idx === 0 ? "col-span-2 aspect-video" : "aspect-square"} rounded-xl overflow-hidden cursor-zoom-in`} style={{ border: `1px solid ${t.accent}15` }} onClick={() => setLightboxIdx(idx)}>
                    <img src={photo.url} alt={photo.caption || ""} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Gift QR */}
        {qrCodes.length > 0 && (
          <section className="rounded-3xl p-6 text-center fade-up" style={{ ...cardStyle, animationDelay: ".5s" }}>
            <SectionHead icon={Gift} title="ចំណងដៃ" />
            <p className="text-xs mb-4 -mt-2" style={{ color: t.textMut }}>សូមស្កេន QR ខាងក្រោមដើម្បីផ្ញើចំណងដៃ</p>
            <div className="space-y-4">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="rounded-2xl p-5 inline-block w-full" style={{ border: `1px solid ${t.accent}20`, background: t.accentBg }}>
                  {qr.qr_image_url && (
                    <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                      <img src={qr.qr_image_url} alt="QR Code" className="w-44 h-44 object-contain" />
                    </div>
                  )}
                  <div className="mt-3 space-y-0.5">
                    {qr.bank_name && <p className="font-bold text-sm" style={{ color: t.textPri }}>{qr.bank_name}</p>}
                    {qr.account_name && <p className="text-xs" style={{ color: t.textSec }}>{qr.account_name}</p>}
                    {qr.account_number && <p className="text-xs font-mono" style={{ color: t.textMut }}>{qr.account_number}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Wishes wall */}
        <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".55s" }}>
          <SectionHead icon={MessageCircle} title="ពាក្យជូនពរ" />
          {wishes.length > 0 && (
            <div className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1 -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
              {wishes.map((w) => (
                <div key={w.id} className="rounded-2xl px-4 py-3" style={{ border: `1px solid ${t.accent}18`, background: t.accentBg }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: `linear-gradient(135deg, ${t.btnFrom}, ${t.btnTo})` }}>
                      {(w.sender_name || "?").charAt(0)}
                    </span>
                    <p className="text-xs font-semibold truncate" style={{ color: t.accent }}>{w.sender_name || "អនាមិក"}</p>
                  </div>
                  <p className="text-sm leading-relaxed break-words" style={{ color: t.textSec }}>{w.content}</p>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-2xl p-4 space-y-3" style={{ border: `1px solid ${t.accent}22` }}>
            {!displayName && (
              <Input value={wishName} onChange={(e) => setWishName(e.target.value)} placeholder="ឈ្មោះរបស់អ្នក..." className="rounded-xl text-sm" style={{ borderColor: `${t.accent}25`, background: isLight ? "#fff" : t.accentBg, color: t.textPri }} />
            )}
            <Textarea value={wishContent} onChange={(e) => setWishContent(e.target.value)} placeholder="សរសេរពាក្យជូនពរដល់គូស្នេហ៍..." rows={2} className="rounded-xl text-sm resize-none" style={{ borderColor: `${t.accent}25`, background: isLight ? "#fff" : t.accentBg, color: t.textPri }} />
            <Button onClick={submitWish} disabled={!wishContent.trim() || wishSending} size="sm"
              className="w-full text-white rounded-xl h-10 gap-2"
              style={{ background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})` }}>
              <Send className="h-4 w-4" /> {wishSending ? "កំពុងផ្ញើ..." : "ផ្ញើពាក្យជូនពរ"}
            </Button>
          </div>
        </section>

        {/* RSVP */}
        <section className="rounded-3xl p-6 fade-up" style={{ ...cardStyle, animationDelay: ".6s" }}>
          <SectionHead icon={Calendar} title="បញ្ជាក់ការចូលរួម" />
          {rsvpSubmitted ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: `1.5px solid ${t.accent}40`, background: t.accentBg }}>
                <Heart className="h-8 w-8" style={{ color: t.accent, fill: t.accentFill }} />
              </div>
              <p className="font-bold text-lg" style={{ color: t.textPri }}>អរគុណសម្រាប់ការឆ្លើយតប!</p>
              <p className="text-sm mt-1" style={{ color: t.textSec }}>យើងរង់ចាំជួបអ្នកនៅថ្ងៃពិធី 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {([{ value: "attending" as const, label: "✓ នឹងមកចូលរួម" }, { value: "not_attending" as const, label: "✗ មិនអាចមក" }]).map((opt) => (
                  <Button key={opt.value} variant="outline" className="rounded-2xl h-12 font-medium transition-all"
                    style={rsvpStatus === opt.value
                      ? { background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})`, borderColor: t.accent, color: "white", boxShadow: `0 4px 16px ${t.accent}40` }
                      : { borderColor: `${t.accent}30`, color: t.textSec, background: "transparent" }}
                    onClick={() => setRsvpStatus(opt.value)}>
                    {opt.label}
                  </Button>
                ))}
              </div>
              {rsvpStatus === "attending" && (
                <div className="fade-up space-y-2">
                  <p className="text-sm text-center" style={{ color: t.textSec }}>អ្នកមកជាមួយប៉ុន្មាននាក់?</p>
                  <div className="flex items-center justify-center gap-4">
                    <button type="button" onClick={() => setRsvpGuests((g) => Math.max(1, g - 1))}
                      className="h-10 w-10 rounded-full text-lg font-bold transition-transform active:scale-90"
                      style={{ border: `1px solid ${t.accent}35`, color: t.accent, background: t.accentBg }}>−</button>
                    <span className="text-2xl font-extrabold w-10 text-center" style={{ color: t.textPri }}>{rsvpGuests}</span>
                    <button type="button" onClick={() => setRsvpGuests((g) => Math.min(10, g + 1))}
                      className="h-10 w-10 rounded-full text-lg font-bold transition-transform active:scale-90"
                      style={{ border: `1px solid ${t.accent}35`, color: t.accent, background: t.accentBg }}>+</button>
                  </div>
                </div>
              )}
              <Textarea value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} placeholder="សារជូនពរ (ជម្រើស) — នឹងបង្ហាញក្នុងជញ្ជាំងជូនពរ..." rows={3} className="rounded-2xl resize-none" style={{ borderColor: `${t.accent}25`, background: isLight ? "#fff" : t.accentBg, color: t.textPri }} />
              <Button onClick={submitRSVP} disabled={!rsvpStatus} className="w-full text-white rounded-2xl h-12 shadow-lg font-semibold"
                style={{ background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})`, boxShadow: `0 6px 20px ${t.accent}40` }}>
                ផ្ញើការឆ្លើយតប
              </Button>
            </div>
          )}
        </section>

        <footer className="text-center pt-6">
          <Ornament c={t.accent} />
          <p className="text-[10px] tracking-[0.35em] uppercase mt-5" style={{ color: t.textMut }}>E-Wedding • សូមជូនពរពីចម្ងាយឬទៅទស្សនា</p>
        </footer>
      </div>

      {/* Music button */}
      {invitation.background_music && (
        <button onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
          style={{ background: `linear-gradient(135deg, ${t.btnFrom}, ${t.btnTo})` }}>
          {musicPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
        </button>
      )}

      {/* Lightbox with nav */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 bg-black/90" onClick={() => setLightboxIdx(null)}>
          <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25">
            <X className="h-5 w-5 text-white" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + photos.length - 1) % photos.length); }}
                className="absolute left-3 h-11 w-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25">
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % photos.length); }}
                className="absolute right-3 h-11 w-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25">
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/40 px-3 py-1 rounded-full">
                {lightboxIdx + 1} / {photos.length}
              </span>
            </>
          )}
          <img src={photos[lightboxIdx].url} alt="រូបភាព" className="max-w-[92vw] max-h-[88vh] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
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
