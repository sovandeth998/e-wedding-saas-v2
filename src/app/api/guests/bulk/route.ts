import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
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
