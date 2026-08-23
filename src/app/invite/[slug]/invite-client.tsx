"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { startBuiltinMusic, stopMusic, pauseMusic, resumeMusic, isBuiltinMusic } from "@/lib/wedding-music";
import { formatKhmerDate, formatKhmerDateShort, formatKhmerTime } from "@/lib/khmer-date";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MapPin, Clock, Camera, Gift, MessageCircle, Calendar, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, Share2, Video, Shirt, X, Sparkles } from "lucide-react";
import type { Invitation, Guest, QRCode, GalleryPhoto, TimelineEvent } from "@/types/database";

const ANIM_CSS = `
  @keyframes envIn{from{opacity:0;transform:translateY(26px) scale(.96)}to{opacity:1;transform:none}}
  @keyframes envOut{to{opacity:0;transform:translateY(-34px) scale(1.05)}}
  @keyframes pageIn{from{opacity:0}to{opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
  @keyframes floatUp{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:.32}88%{opacity:.14}100%{transform:translateY(-108vh) rotate(26deg);opacity:0}}
  .float-heart{position:absolute;bottom:-36px;animation-name:floatUp;animation-timing-function:linear;animation-iteration-count:infinite;pointer-events:none}
  @keyframes pulseGlow{0%,100%{opacity:.35}50%{opacity:.7}}
  @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes cdPop{from{transform:translateY(8px) scale(.82);opacity:.25}to{transform:none;opacity:1}}
  @keyframes shine{0%{left:-80%}55%{left:135%}100%{left:135%}}
  .btn-shine{position:relative;overflow:hidden}
  .btn-shine::before{content:"";position:absolute;top:0;left:-80%;width:48%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);animation:shine 3.4s ease-in-out infinite}
  @keyframes lbIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
  .lb-img{animation:lbIn .32s cubic-bezier(.22,1,.36,1) both}
  @keyframes tlPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,0,0,0)}50%{box-shadow:0 0 0 5px transparent}}
  .reveal{opacity:0;transform:translateY(30px);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1)}
  .reveal-in{opacity:1;transform:none}
  .fade-up{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) both}
`;

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} reveal ${vis ? "reveal-in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function FloatHearts({ color, count = 9 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 11.3 + ((i * 37) % 13)) % 97;
        const dur = 10 + ((i * 41) % 80) / 10;
        const del = ((i * 53) % 90) / 10;
        const size = 10 + ((i * 29) % 16);
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            fill={color}
            className="float-heart"
            style={{ left: `${left}%`, width: size, height: size, opacity: 0, animationDuration: `${dur}s`, animationDelay: `${del}s` }}
          >
            <path d="M12 21s-7.5-4.9-10-9.3C.6 8.6 2.3 5 5.7 5c2 0 3.3 1.1 4.3 2.6h4C15 6.1 16.3 5 18.3 5c3.4 0 5.1 3.6 3.7 6.7C19.5 16.1 12 21 12 21z" />
          </svg>
        );
      })}
    </div>
  );
}

function InvitationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawTo = searchParams.get("to") || "";
  const guestName = (() => { try { return decodeURIComponent(rawTo); } catch { return rawTo; } })();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const cleanName = (s: string) => s.replace(/-[a-z0-9]{10,}$/i, "").replace(/-/g, " ").trim();
  const displayName = guest?.name ? cleanName(guest.name) : cleanName(guestName);
  const isBirthday = invitation?.type === "birthday";
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [showGift, setShowGift] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "not_attending" | "">("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
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
    setOpening(true);
    setTimeout(() => {
      window.scrollTo({ top: 0 });
      setOpened(true);
    }, 620);
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
    ? isBirthday
      ? `🎂 សូមអញ្ជើញចូលរួមពិធីខួបកំណើត ${invitation.groom_name_kh || invitation.groom_name}!`
      : `💌 សូមអញ្ជើញចូលរួមពិធីរៀបអាពាហ៍ពិពាហ៍ ${invitation.groom_name_kh || invitation.groom_name} & ${invitation.bride_name_kh || invitation.bride_name}`
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

    const [guestData, qrData, photoData] = await Promise.all([
      guestName
        ? supabase.from("guests").select("*").eq("invitation_id", inv.id).ilike("custom_link", `%${guestName.toLowerCase().replace(/\s+/g, "-")}%`).single()
        : Promise.resolve({ data: null }),
      supabase.from("qr_codes").select("*").eq("invitation_id", inv.id),
      supabase.from("gallery_photos").select("*").eq("invitation_id", inv.id).order("order_index"),
    ]);

    setGuest(guestData.data);
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
      await supabase.from("wishes").insert({ invitation_id: invitation.id, guest_id: finalGuestId, sender_name: senderName, content: rsvpMessage, is_approved: true });
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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: t.bg, animation: "pageIn .4s ease both" }}>
        <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />
        <div className="absolute inset-0 pointer-events-none">
          <FloatHearts color={t.accent} count={10} />
          <div className="absolute top-[-10%] left-[15%] w-72 h-72 rounded-full blur-[110px]" style={{ background: `${t.accent}18`, animation: "pulseGlow 5s ease-in-out infinite" }} />
          <div className="absolute bottom-[-8%] right-[10%] w-80 h-80 rounded-full blur-[120px]" style={{ background: `${t.accent}14`, animation: "pulseGlow 6s ease-in-out 1s infinite" }} />
        </div>

        <div
          className="relative max-w-md w-full"
          style={{
            animation: opening ? "envOut .62s cubic-bezier(.55,0,.55,.2) forwards" : "envIn .8s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          <div className="absolute -inset-4 rounded-[2.4rem] blur-2xl pointer-events-none" style={{ background: `${t.accent}20`, animation: "pulseGlow 4s ease-in-out infinite" }} />
          <div className="relative rounded-[2rem] px-8 py-10 md:px-10 shadow-2xl text-center overflow-hidden" style={cardStyle}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, transparent, ${t.accent}70, transparent)` }} />

            <CoupleAvatars size={64} />

            {!invitation.groom_photo && !invitation.bride_photo && (
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `linear-gradient(135deg, ${t.accent}15, ${t.accent}08)`, border: `2px solid ${t.accent}30`, animation: "floatY 4s ease-in-out infinite" }}>
                {isBirthday ? <span className="text-3xl">🎂</span> : <Heart className="h-8 w-8" style={{ color: t.accent, fill: t.accentFill }} />}
              </div>
            )}

            <p className="text-[10px] tracking-[0.4em] uppercase mb-3 font-medium" style={{ color: t.accent }}>{isBirthday ? "Birthday Invitation" : "Wedding Invitation"}</p>

            {isBirthday ? (
              <h1 className="text-3xl font-bold leading-tight mb-5" style={{ color: t.textPri }}>
                {invitation.groom_name_kh || invitation.groom_name || "អ្នកកំណើត"}
              </h1>
            ) : (
              <>
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
              </>
            )}

            <Ornament c={t.accent} />

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ border: `1px solid ${t.accent}25`, color: t.textSec }}>
              <Calendar className="h-4 w-4" style={{ color: t.accent }} />
              {formatKhmerDateShort(weddingDate)}
            </div>

            {displayName && (
              <div className="mt-5 py-3.5 px-5 rounded-2xl" style={{ border: `1.5px solid ${t.accent}25`, background: t.accentBg }}>
                <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: t.accent }}>គូរាល់ជូន</p>
                <p className="font-bold text-lg" style={{ color: t.textPri }}>{displayName}</p>
              </div>
            )}

            <Button onClick={openEnvelope} disabled={opening} className="mt-7 w-full text-white rounded-2xl h-12 font-semibold tracking-wide shadow-lg hover:scale-[1.02] transition-transform btn-shine"
              style={{ background: `linear-gradient(135deg, ${t.btnFrom}, ${t.btnTo})`, boxShadow: `0 8px 28px ${t.accent}45` }}>
              {opening ? "✨" : "✉️"} បើកលិខិតអញ្ជើញ
            </Button>

            <div className="mt-5"><ChevronDown className="h-5 w-5 animate-bounce mx-auto" style={{ color: `${t.accent}55` }} /></div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MAIN PAGE ----------
  return (
    <div className="min-h-screen" style={{ background: t.bgMain, animation: "pageIn .5s ease both" }}>
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />

      {/* HERO */}
      <section className="relative pt-16 pb-10 px-4 text-center overflow-hidden fade-up">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatHearts color={t.accent} count={8} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[130px]" style={{ background: `${t.accent}0d` }} />
          <div className="absolute top-24 left-8 w-28 h-28 rounded-full blur-[60px]" style={{ background: `${t.accent}0d` }} />
          <div className="absolute bottom-4 right-8 w-28 h-28 rounded-full blur-[60px]" style={{ background: `${t.accent}0d` }} />
        </div>
        <div className="max-w-lg mx-auto relative">
          <CoupleAvatars size={72} />
          <p className="text-[10px] tracking-[0.45em] uppercase mb-2 font-medium mt-4" style={{ color: t.accent }}>Invitation</p>
          <p className="text-sm mb-7" style={{ color: t.textSec }}>{isBirthday ? "ពិធីរំលឹកថ្ងៃកំណើត" : "ពិធីរៀបអាពាហ៍ពិពាហ៍"}</p>

          {isBirthday ? (
            <div className="flex flex-col items-center mb-6">
              {invitation.groom_photo ? (
                <img src={invitation.groom_photo} alt="" className="rounded-[1.8rem] object-cover shadow-xl" style={{ width: 170, height: 200, border: `2px solid ${t.accent}45` }} />
              ) : (
                <div className="rounded-[1.8rem] flex items-center justify-center" style={{ width: 170, height: 200, border: `2px dashed ${t.accent}35`, fontSize: 64 }}>🎂</div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide mt-4" style={{ color: t.textPri }}>
                {invitation.groom_name_kh || invitation.groom_name || "អ្នកកំណើត"}
              </h1>
            </div>
          ) : (invitation.groom_photo || invitation.bride_photo) ? (
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
                សូមគោរពអញ្ជើញ <b>{displayName}</b>
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
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: t.accent }}>
                <span key={item.v} style={{ display: "inline-block", animation: "cdPop .45s ease" }}>{String(item.v).padStart(2, "0")}</span>
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: t.textMut }}>{item.l}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 space-y-6 pb-24 pt-4">

        {/* Event info */}
        <Reveal>
          <section className="rounded-3xl p-6" style={cardStyle}>
          <SectionHead icon={Calendar} title="ព័ត៌មានពិធីការ" />
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
              <Calendar className="h-4 w-4 shrink-0" style={{ color: t.accent }} />
              <span className="text-sm">{formatKhmerDate(weddingDate)}</span>
            </div>
            {(weddingDate.getHours() !== 0 || weddingDate.getMinutes() !== 0) && !invitation.ceremony_time && (
              <div className="flex items-center justify-center gap-2" style={{ color: t.textSec }}>
                <Clock className="h-4 w-4 shrink-0" style={{ color: t.accent }} />
                <span className="text-sm">ម៉ោង៖ {formatKhmerTime(weddingDate)}</span>
              </div>
            )}
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
        </Reveal>

        {/* Timeline */}
        {timeline.length > 0 && (
          <Reveal delay={60}>
          <section className="rounded-3xl p-6" style={cardStyle}>
            <SectionHead icon={Clock} title="កាលវិភាគពិធី" />
            <div className="relative pl-8">
              <div className="absolute left-[11px] top-1 bottom-1 w-0.5 rounded" style={{ background: `linear-gradient(to bottom, ${t.accent}50, ${t.accent}15)` }} />
              {timeline.map((ev, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  <div className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full border-2 shadow-sm" style={{ borderColor: t.accent, background: isLight ? "#fff" : t.cardFrom, animation: `tlPulse 2.4s ease-in-out ${i * 0.35}s infinite` }} />
                  <p className="text-xs font-extrabold tracking-wide" style={{ color: t.accent }}>{ev.time}</p>
                  <p className="font-semibold text-sm" style={{ color: t.textPri }}>{ev.title}</p>
                  {ev.description && <p className="text-xs mt-0.5" style={{ color: t.textMut }}>{ev.description}</p>}
                </div>
              ))}
            </div>
          </section>
          </Reveal>
        )}

        {/* Dress code */}
        {invitation.dress_code && (
          <Reveal delay={80}>
          <section className="rounded-3xl p-6" style={cardStyle}>
            <SectionHead icon={Shirt} title="ការស្លៀកពាក់" />
            <p className="text-sm text-center" style={{ color: t.textSec }}>{invitation.dress_code}</p>
            {invitation.dress_code_color && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="h-5 w-5 rounded-full border shadow-inner animate-pulse" style={{ background: invitation.dress_code_color, borderColor: `${t.accent}35` }} />
                <span className="text-xs" style={{ color: t.textMut }}>ពណ៌ណែនាំ</span>
              </div>
            )}
          </section>
          </Reveal>
        )}

        {/* Story */}
        {invitation.story && !isBirthday && (
          <Reveal delay={100}>
          <section className="rounded-3xl p-6" style={cardStyle}>
            <SectionHead icon={MessageCircle} title="រឿងស្នេហារបស់យើង" />
            <p className="whitespace-pre-line leading-relaxed text-sm text-center" style={{ color: t.textSec }}>{invitation.story}</p>
          </section>
          </Reveal>
        )}

        {/* Video */}
        {invitation.video_url && (
          <Reveal delay={100}>
          <section className="rounded-3xl p-6" style={cardStyle}>
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
          </Reveal>
        )}

        {/* Gallery */}
        {photos.length > 0 && (
          <Reveal delay={100}>
          <section className="rounded-3xl p-6" style={cardStyle}>
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
          </Reveal>
        )}

        {/* Gift QR */}
        {qrCodes.length > 0 && (
          <Reveal delay={100}>
          <section className="rounded-3xl p-6 text-center" style={cardStyle}>
            <SectionHead icon={Gift} title="ចំណងដៃ" />
            <p className="text-xs mb-4 -mt-2" style={{ color: t.textMut }}>អ្នកអាចផ្ញើការលើកទឹកចិត្តតាមរយៈ QR</p>
            <Button onClick={() => setShowGift(true)} className="btn-shine w-full max-w-xs mx-auto h-12 rounded-2xl text-white shadow-lg font-semibold gap-2"
              style={{ background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})`, boxShadow: `0 6px 20px ${t.accent}40` }}>
              <Gift className="h-4 w-4" /> ផ្ញើចំណងដៃ
            </Button>
          </section>
          </Reveal>
        )}

        {/* RSVP */}
        <Reveal delay={80}>
        <section className="rounded-3xl p-6" style={cardStyle}>
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
              <Button onClick={submitRSVP} disabled={!rsvpStatus} className="w-full text-white rounded-2xl h-12 shadow-lg font-semibold btn-shine"
                style={{ background: `linear-gradient(to right, ${t.btnFrom}, ${t.btnTo})`, boxShadow: `0 6px 20px ${t.accent}40` }}>
                ផ្ញើការឆ្លើយតប
              </Button>
            </div>
          )}
        </section>
        </Reveal>

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
          {musicPlaying && <span className="absolute inset-0 rounded-full animate-ping pointer-events-none" style={{ background: `${t.accent}55`, opacity: 0.5 }} />}
          {musicPlaying ? <Pause className="h-5 w-5 text-white relative" /> : <Play className="h-5 w-5 text-white ml-0.5 relative" />}
        </button>
      )}

      {/* Lightbox with nav */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightboxIdx(null)} style={{ animation: "pageIn .25s ease both" }}>
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
          <img key={lightboxIdx} src={photos[lightboxIdx].url} alt="រូបភាព" className="max-w-[92vw] max-h-[88vh] rounded-xl object-contain shadow-2xl lb-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Gift QR modal */}
      {showGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto" onClick={() => setShowGift(false)} style={{ animation: "pageIn .25s ease both" }}>
          <button onClick={() => setShowGift(false)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25">
            <X className="h-5 w-5 text-white" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl p-6 text-center my-auto lb-img relative" style={cardStyle}>
            <div className="h-11 w-11 rounded-full flex items-center justify-center mx-auto mb-2.5" style={{ border: `1px solid ${t.accent}25`, background: t.accentBg }}>
              <Gift className="h-5 w-5" style={{ color: t.accent }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: t.textPri }}>ស្កេនដើម្បីផ្ញើចំណងដៃ</h3>
            <p className="text-xs mb-4" style={{ color: t.textMut }}>សូមជូនពរតាមរយៈការផ្ទេរប្រាក់ខាងក្រោម</p>
            <div className="space-y-4">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="rounded-2xl p-5 inline-block w-full" style={{ border: `1px solid ${t.accent}20`, background: t.accentBg }}>
                  {qr.qr_image_url && (
                    <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                      <img src={qr.qr_image_url} alt="QR Code" className="w-56 h-56 object-contain" />
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
            <Button onClick={() => setShowGift(false)} variant="outline" size="sm" className="mt-5 rounded-full"
              style={{ borderColor: `${t.accent}40`, color: t.accent, background: "transparent" }}>
              បិទ
            </Button>
          </div>
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
