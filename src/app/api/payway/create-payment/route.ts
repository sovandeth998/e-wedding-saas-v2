import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildCheckoutFields,
  generatePaywayQR,
  generateTranId,
  isPayWayConfigured,
} from "@/lib/payway";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPayWayConfigured()) {
    return NextResponse.json({ error: "PayWay not configured" }, { status: 501 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packageId, method } = await request.json();
    if (!packageId) {
      return NextResponse.json({ error: "packageId required" }, { status: 400 });
    }

    const { data: pkg, error: pkgError } = await supabase
      .from("packages")
      .select("id, name, name_kh, price")
      .eq("id", packageId)
      .single();
    if (pkgError || !pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    if (Number(pkg.price) <= 0) {
      return NextResponse.json({ error: "Free package" }, { status: 400 });
    }

    const tranId = generateTranId();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: auth.user.id,
        package_id: pkg.id,
        amount: pkg.price,
        currency: "USD",
        payment_method: "payway",
        khqr_reference: tranId,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message || "Failed to create order" },
        { status: 500 }
      );
    }

    const meta = auth.user.user_metadata || {};
    let firstName = String(meta.full_name || "Customer").trim().split(/\s+/)[0] || "Customer";
    firstName = firstName.replace(/[^a-zA-Z\u1780-\u17FF]/g, "") || "Customer";
    const phone = String(meta.phone || "").replace(/[^\d]/g, "").slice(0, 20);

    if (method === "card") {
      const checkout = buildCheckoutFields({
        tranId,
        amount: Number(pkg.price),
        firstName,
        itemsName: `E-Wedding ${pkg.name_kh || pkg.name}`,
      });
      return NextResponse.json({
        orderId: order.id,
        tranId,
        method: "card",
        actionUrl: checkout.actionUrl,
        fields: checkout.fields,
        amount: Number(pkg.price),
      });
    }

    const qr = await generatePaywayQR({
      tranId,
      amount: Number(pkg.price),
      currency: "USD",
      firstName,
      phone: phone || undefined,
      itemsName: `E-Wedding ${pkg.name_kh || pkg.name}`,
      lifetimeMinutes: 15,
    });

    return NextResponse.json({
      orderId: order.id,
      tranId,
      qrImage: qr.qrImage,
      qrString: qr.qrString,
      abapayDeeplink: qr.abapayDeeplink,
      amount: Number(pkg.price),
    });
  } catch (err) {
    console.error("create-payment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment creation failed" },
      { status: 502 }
    );
  }
}
