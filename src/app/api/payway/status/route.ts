import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkTransaction,
  fulfillOrder,
  isPayWayConfigured,
} from "@/lib/payway";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isPayWayConfigured()) {
    return NextResponse.json({ error: "PayWay not configured" }, { status: 501 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, khqr_reference")
    .eq("id", orderId)
    .eq("user_id", auth.user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ status: "APPROVED", paid: true });
  }

  if (order.status !== "pending" || !order.khqr_reference) {
    return NextResponse.json({
      status: order.status.toUpperCase(),
      paid: false,
    });
  }

  const paywayStatus = await checkTransaction(order.khqr_reference);

  if (paywayStatus === "APPROVED") {
    await fulfillOrder(order.id);
    return NextResponse.json({ status: "APPROVED", paid: true });
  }

  return NextResponse.json({ status: paywayStatus, paid: false });
}
