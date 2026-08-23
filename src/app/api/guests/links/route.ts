import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json({ error: "invitationId required" }, { status: 400 });
    }

    const { data: invitation } = await supabase
      .from("invitations")
      .select("slug")
      .eq("id", invitationId)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const { data: guests } = await supabase
      .from("guests")
      .select("name, custom_link, share_code")
      .eq("invitation_id", invitationId)
      .order("name");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const links = (guests || []).map((guest) => ({
      name: guest.name,
      link: guest.share_code
        ? `${baseUrl}/g/${guest.share_code}`
        : `${baseUrl}/invite/${guest.custom_link}`,
    }));

    return NextResponse.json({ links, count: links.length });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
