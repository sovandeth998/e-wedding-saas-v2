import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/admin";
import { generateShareCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }
    const { invitationId, names, slug } = await request.json();

    if (!invitationId || !names || !Array.isArray(names)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const guestInserts = names
      .filter((name: string) => name.trim())
      .map((name: string) => ({
        invitation_id: invitationId,
        name: name.trim(),
        custom_link: `${slug}/guest/${name.trim().toLowerCase().replace(/\s+/g, "-")}`,
        share_code: generateShareCode(),
        side: "both",
      }));

    const { data, error } = await supabase
      .from("guests")
      .insert(guestInserts)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      guests: data,
      count: data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
