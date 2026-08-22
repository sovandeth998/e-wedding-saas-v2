import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkTransaction, fulfillOrder, isPayWayConfigured } from "@/lib/payway";

export const dynamic = "force-dynamic";

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleCallback(payload: Record<string, string>) {
  const tranId = payload.tran_id || "";
  const status = payload.status;

  if (!tranId || !isPayWayConfigured()) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { data: order } = await service
    .from("orders")
    .select("id, status")
    .eq("khqr_reference", tranId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (status === "0" && order.status === "pending") {
    const verified = await checkTransaction(tranId);
    if (verified === "APPROVED") {
      await fulfillOrder(order.id);
    }
  }

  return new NextResponse("OK", { status: 200 });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return await handleCallback(await request.json());
    }
    const formData = await request.formData();
    const obj: Record<string, string> = {};
    formData.forEach((value, key) => {
      obj[key] = String(value);
    });
    return await handleCallback(obj);
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function GET() {
  return new NextResponse("OK", { status: 200 });
}
