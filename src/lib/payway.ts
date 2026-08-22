import crypto from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const PAYWAY_API_URL =
  process.env.PAYWAY_API_URL ||
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function fulfillOrder(orderId: string): Promise<boolean> {
  const service = getServiceClient();
  const { data: order } = await service
    .from("orders")
    .update({ status: "paid", approved_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("*, package:packages(duration_days)")
    .single();

  if (!order?.package) return false;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + order.package.duration_days);

  await service
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("user_id", order.user_id)
    .eq("status", "active");

  const { error } = await service.from("subscriptions").insert({
    user_id: order.user_id,
    package_id: order.package_id,
    status: "active",
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    payment_id: orderId,
  });
  return !error;
}

export function isPayWayConfigured(): boolean {
  return Boolean(process.env.PAYWAY_MERCHANT_ID && process.env.PAYWAY_API_KEY);
}

export function paywayReqTime(): string {
  return new Date()
    .toISOString()
    .replace(/[-T:]/g, "")
    .slice(0, 14);
}

export function hmacSha512Base64(data: string): string {
  return crypto
    .createHmac("sha512", process.env.PAYWAY_API_KEY as string)
    .update(data)
    .digest("base64");
}

export function generateTranId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EWD${Date.now().toString(36)}${rand}`.slice(0, 20);
}

export interface PayWayQRResult {
  qrString: string;
  qrImage: string;
  abapayDeeplink: string;
}

export async function generatePaywayQR(params: {
  tranId: string;
  amount: number;
  currency?: "USD" | "KHR";
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  itemsName?: string;
  lifetimeMinutes?: number;
}): Promise<PayWayQRResult> {
  const callbackUrl = Buffer.from(
    `${process.env.NEXT_PUBLIC_APP_URL || "https://e-wedding-saas-v2.vercel.app"}/api/payway/callback`
  ).toString("base64");

  const fields: Record<string, string | number> = {
    req_time: paywayReqTime(),
    merchant_id: process.env.PAYWAY_MERCHANT_ID as string,
    tran_id: params.tranId,
    amount: Number(params.amount),
    items: Buffer.from(
      JSON.stringify([{ name: params.itemsName || "Package", quantity: 1, price: params.amount }])
    ).toString("base64"),
    payment_option: "abapay_khqr",
    callback_url: callbackUrl,
    currency: params.currency || "USD",
    lifetime: params.lifetimeMinutes ?? 15,
    qr_image_template: "template3_color",
  };

  if (params.firstName) fields.first_name = params.firstName.slice(0, 20);
  if (params.phone) fields.phone = params.phone.slice(0, 20);

  const hashOrder = [
    "req_time",
    "merchant_id",
    "tran_id",
    "amount",
    "items",
    "first_name",
    "last_name",
    "email",
    "phone",
    "purchase_type",
    "payment_option",
    "callback_url",
    "return_deeplink",
    "currency",
    "custom_fields",
    "return_params",
    "payout",
    "lifetime",
    "qr_image_template",
  ];
  const b4hash = hashOrder.map((k) => (fields[k] !== undefined ? String(fields[k]) : "")).join("");
  const hash = hmacSha512Base64(b4hash);

  const res = await fetch(`${PAYWAY_API_URL}/generate-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...fields, hash }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!data.qrString) {
    throw new Error(
      `PayWay QR failed: ${data.status?.code} ${data.status?.message || "unknown"}`
    );
  }
  return {
    qrString: data.qrString,
    qrImage: data.qrImage,
    abapayDeeplink: data.abapay_deeplink || "",
  };
}

export type PaywayPaymentStatus =
  | "APPROVED"
  | "PENDING"
  | "DECLINED"
  | "CANCELLED"
  | "REFUNDED"
  | "UNKNOWN";

export function buildCheckoutFields(params: {
  tranId: string;
  amount: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  itemsName?: string;
}): { actionUrl: string; fields: Record<string, string> } {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://e-wedding-saas-v2.vercel.app";

  const fields: Record<string, string> = {
    req_time: paywayReqTime(),
    merchant_id: process.env.PAYWAY_MERCHANT_ID as string,
    tran_id: params.tranId,
    amount: String(Number(params.amount)),
    items: Buffer.from(
      JSON.stringify([{ name: params.itemsName || "Package", quantity: 1, price: params.amount }])
    ).toString("base64"),
    payment_option: "cards",
    return_url: Buffer.from(`${appUrl}/api/payway/callback`).toString("base64"),
    cancel_url: Buffer.from(`${appUrl}/billing?payway=cancel`).toString("base64"),
    continue_success_url: Buffer.from(`${appUrl}/billing?payway=success`).toString("base64"),
    currency: "USD",
  };
  if (params.firstName) fields.firstname = params.firstName.slice(0, 100);
  if (params.lastName) fields.lastname = params.lastName.slice(0, 100);
  if (params.phone) fields.phone = params.phone.slice(0, 20);

  const hashOrder = [
    "req_time",
    "merchant_id",
    "tran_id",
    "amount",
    "items",
    "shipping",
    "ctid",
    "pwt",
    "firstname",
    "lastname",
    "email",
    "phone",
    "type",
    "payment_option",
    "return_url",
    "cancel_url",
    "continue_success_url",
    "return_deeplink",
    "currency",
    "custom_fields",
    "return_params",
  ];
  const b4hash = hashOrder.map((k) => fields[k] ?? "").join("");

  return {
    actionUrl: `${PAYWAY_API_URL}/purchase`,
    fields: { ...fields, hash: hmacSha512Base64(b4hash) },
  };
}

export async function checkTransaction(tranId: string): Promise<PaywayPaymentStatus> {
  const reqTime = paywayReqTime();
  const hash = hmacSha512Base64(reqTime + (process.env.PAYWAY_MERCHANT_ID as string) + tranId);

  try {
    const res = await fetch(`${PAYWAY_API_URL}/check-transaction-2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        req_time: reqTime,
        merchant_id: process.env.PAYWAY_MERCHANT_ID,
        tran_id: tranId,
        hash,
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const status = json?.data?.payment_status;
    if (typeof status === "string") return status.toUpperCase() as PaywayPaymentStatus;
    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}
