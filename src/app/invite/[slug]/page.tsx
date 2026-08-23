import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import InviteClient from "./invite-client";

type Props = { params: { slug: string } };

async function getInvitation(slug: string) {
  const supabase = await createClient();
  const { data: inv } = await supabase
    .from("invitations")
    .select("id, slug, type, groom_name, groom_name_kh, groom_photo, bride_name, bride_name_kh, bride_photo, wedding_date, venue_name, status")
    .eq("slug", slug)
    .maybeSingle();
  return inv;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const inv = await getInvitation(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e-wedding-saas-v2.vercel.app";

  if (!inv) {
    return {
      title: "លិខិតអញ្ជើញរៀបអាពាហ៍ពិពាហ៍",
      description: "សូមគោរពអញ្ជើញចូលរួមពិធីរៀបអាពាហ៍ពិពាហ៍",
    };
  }

  const isBirthday = inv.type === "birthday";
  const groom = inv.groom_name_kh || inv.groom_name;
  const bride = inv.bride_name_kh || inv.bride_name;
  const dateStr = inv.wedding_date
    ? new Date(inv.wedding_date).toLocaleDateString("km-KH", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const title = isBirthday
    ? `🎂 ${groom || "អ្នកកំណើត"} | លិខិតអញ្ជើញខួបកំណើត`
    : `💌 ${groom} ❤ ${bride}`;
  const description = isBirthday
    ? `${dateStr}${inv.venue_name ? ` • ${inv.venue_name}` : ""}\nសូមគោរពអញ្ជើញចូលរួមពិធីខួបកំណើត`
    : `${dateStr}${inv.venue_name ? ` • ${inv.venue_name}` : ""}\nសូមគោរពអញ្ជើញចូលរួមពិធីរៀបអាពាហ៍ពិពាហ៍`;

  const photo =
    (await (async () => {
      const supabase = await createClient();
      const { data: p } = await supabase
        .from("gallery_photos")
        .select("url")
        .eq("invitation_id", inv.id)
        .order("order_index")
        .limit(1)
        .maybeSingle();
      return p?.url || null;
    })()) ||
    inv.groom_photo ||
    inv.bride_photo ||
    null;

  const images = photo ? [{ url: photo.startsWith("http") ? photo : `${baseUrl}${photo}`, alt: title }] : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/invite/${inv.slug}`,
      siteName: "E-Wedding",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

export default async function InvitePage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
        <p className="text-amber-800">កំពុងផ្ទុក...</p>
      </div>
    }>
      <InviteClient />
    </Suspense>
  );
}
