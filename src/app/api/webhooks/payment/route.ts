import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }
    const body = await request.json();
    const { orderId, status, khqrReference } = body;

    // Update order status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update({
        status,
        khqr_reference: khqrReference,
        approved_at: status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", orderId)
      .select("*, package:packages(duration_days)")
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    // If payment approved, create/extend subscription
    if (status === "paid" && order?.package) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + order.package.duration_days);

      await supabase.from("subscriptions").insert({
        user_id: order.user_id,
        package_id: order.package_id,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_id: orderId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
