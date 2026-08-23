import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ShortGuestLinkPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = await createClient();
  const { data: guest } = await supabase
    .from("guests")
    .select("custom_link")
    .eq("share_code", params.code)
    .maybeSingle();

  if (!guest?.custom_link) redirect("/");

  const parts = guest.custom_link.split("/");
  const slug = parts[0];
  const guestPart = parts[2] || "";

  redirect(`/invite/${slug}?to=${encodeURIComponent(guestPart)}`);
}
