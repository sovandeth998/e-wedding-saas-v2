import { NextResponse } from "next/server";
import { getAnonClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = getAnonClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }
    const body = await request.json();
    const { invitation_id, guest_id, guest_name } = body;
    if (!invitation_id) {
      return NextResponse.json({ error: "invitation_id required" }, { status: 400 });
    }
    const ua = request.headers.get("user-agent") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "unknown";

    const encoder = new TextEncoder();
    const data = encoder.encode(ip + invitation_id);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const ip_hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const { error } = await supabase.from("page_views").insert({
      invitation_id,
      guest_id: guest_id || null,
      guest_name: guest_name || null,
      user_agent: ua.slice(0, 255),
      ip_hash,
    });

    if (error) {
      console.error("Page view insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
