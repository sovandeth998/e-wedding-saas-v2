import { NextResponse } from "next/server";
import QRCode from "qrcode";

function generateKHQRPayload(amount: number, orderId: string, description: string): string {
  const merchantAccountInfo = "0016kh.nicepay.com.kh0105E-WED020800000000";
  const merchantCategoryCode = "0000";
  const transactionCurrency = "116";
  const tipOrConvenienceIndicator = "00";
  const countryCode = "KH";
  const merchantName = "E-WEDDING";
  const merchantCity = "Phnom Penh";
  const postalCode = "12000";
  const additionalDataField = `05${String(description.length).padStart(2, "0")}${description}`;
  const referenceNumber = `55${String(orderId.length).padStart(2, "0")}${orderId}`;
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const unreservedTemplate = "6304";

  const tlvSegments: string[] = [];

  tlvSegments.push(`00${String("0001".length).padStart(2, "0")}${"0001"}`);
  tlvSegments.push(`01${String(merchantAccountInfo.length).padStart(2, "0")}${merchantAccountInfo}`);
  tlvSegments.push(`51${String("KH".length).padStart(2, "0")}${"KH"}`);
  tlvSegments.push(`52${String(merchantCategoryCode).padStart(2, "0")}${merchantCategoryCode}`);
  tlvSegments.push(`53${String(transactionCurrency.length).padStart(2, "0")}${transactionCurrency}`);
  tlvSegments.push(`54${String(amount.toFixed(2).length).padStart(2, "0")}${amount.toFixed(2)}`);
  tlvSegments.push(`58${String(countryCode).padStart(2, "0")}${countryCode}`);
  tlvSegments.push(`59${String(merchantName.length).padStart(2, "0")}${merchantName}`);
  tlvSegments.push(`60${String(merchantCity.length).padStart(2, "0")}${merchantCity}`);
  tlvSegments.push(`61${String(postalCode.length).padStart(2, "0")}${postalCode}`);
  tlvSegments.push(additionalDataField);
  tlvSegments.push(referenceNumber);
  tlvSegments.push(`62${String(timestamp.length).padStart(2, "0")}${timestamp}`);

  const payload = tlvSegments.join("");
  const crc = computeCRC16(payload + "6304");
  return payload + unreservedTemplate + crc.toUpperCase();
}

function computeCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).padStart(4, "0");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, description } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "amount and orderId are required" },
        { status: 400 }
      );
    }

    const payload = generateKHQRPayload(
      Number(amount),
      orderId,
      description || "E-Wedding Subscription"
    );

    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      qrDataUrl,
      payload,
      orderId,
      amount: Number(amount),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
