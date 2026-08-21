import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, serviceKey || anonKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitation_id = searchParams.get("invitation_id");
    if (!invitation_id) {
      return NextResponse.json({ error: "invitation_id required" }, { status: 400 });
    }

    const wishesQuery = serviceKey
      ? supabase.from("wishes").select("id, sender_name, content, is_approved, created_at").eq("invitation_id", invitation_id).order("created_at", { ascending: false })
      : supabase.from("wishes").select("id, sender_name, content, is_approved, created_at").eq("invitation_id", invitation_id).eq("is_approved", true).order("created_at", { ascending: false });

    const [viewsRes, rsvpsRes, wishesRes, guestsRes, dailyViewsRes] = await Promise.all([
      supabase.from("page_views").select("id, guest_name, viewed_at, ip_hash").eq("invitation_id", invitation_id).order("viewed_at", { ascending: false }),
      supabase.from("rsvps").select("id, status, number_of_guests, created_at, guest:guests(name)").eq("invitation_id", invitation_id),
      wishesQuery,
      supabase.from("guests").select("id, name, side").eq("invitation_id", invitation_id),
      supabase.from("page_views").select("viewed_at, ip_hash").eq("invitation_id", invitation_id).order("viewed_at", { ascending: true }),
    ]);

    const views = viewsRes.data || [];
    const rsvps = rsvpsRes.data || [];
    const wishes = wishesRes.data || [];
    const guests = guestsRes.data || [];
    const dailyViews = dailyViewsRes.data || [];

    if (viewsRes.error) console.error("page_views error:", viewsRes.error.message);
    if (rsvpsRes.error) console.error("rsvps error:", rsvpsRes.error.message);
    if (wishesRes.error) console.error("wishes error:", wishesRes.error.message);
    if (guestsRes.error) console.error("guests error:", guestsRes.error.message);

    const uniqueIps = new Set(views.map((v: any) => v.ip_hash));
    const attending = rsvps.filter((r: any) => r.status === "attending");
    const notAttending = rsvps.filter((r: any) => r.status === "not_attending");
    const totalGuestsComing = attending.reduce((sum: number, r: any) => sum + (r.number_of_guests || 1), 0);

    const dailyMap: Record<string, number> = {};
    dailyViews.forEach((v: any) => {
      const day = new Date(v.viewed_at).toISOString().split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, views: count })).slice(-30);

    const rsvpDailyMap: Record<string, { attending: number; not_attending: number }> = {};
    rsvps.forEach((r: any) => {
      const day = new Date(r.created_at).toISOString().split("T")[0];
      if (!rsvpDailyMap[day]) rsvpDailyMap[day] = { attending: 0, not_attending: 0 };
      if (r.status === "attending") rsvpDailyMap[day].attending++;
      else if (r.status === "not_attending") rsvpDailyMap[day].not_attending++;
    });
    const rsvpDailyData = Object.entries(rsvpDailyMap).map(([date, v]) => ({ date, ...v })).slice(-30);

    return NextResponse.json({
      overview: {
        total_views: views.length,
        unique_views: uniqueIps.size,
        total_guests: guests.length,
        total_rsvps: rsvps.length,
        attending: attending.length,
        not_attending: notAttending.length,
        total_guests_coming: totalGuestsComing,
        total_wishes: wishes.length,
        approved_wishes: wishes.filter((w: any) => w.is_approved).length,
      },
      daily_views: dailyData,
      rsvp_daily: rsvpDailyData,
      recent_rsvps: rsvps.slice(0, 10),
      recent_wishes: wishes.slice(0, 10),
      recent_views: views.slice(0, 10),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
