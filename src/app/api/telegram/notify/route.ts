import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string, message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("Telegram bot token not configured");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

export async function POST(request: Request) {
  try {
    const { type, coupleId, data } = await request.json();

    const messages: Record<string, string> = {
      rsvp: `🎉 <b>New RSVP!</b>\n\nGuest: ${data.guestName}\nStatus: ${data.status}\nNumber of guests: ${data.numberOfGuests}\n${data.message ? `Message: ${data.message}` : ""}`,

      wish: `💌 <b>New Wish!</b>\n\nFrom: ${data.senderName}\nMessage: ${data.content}`,

      payment: `💳 <b>Payment ${data.status}!</b>\n\nPackage: ${data.packageName}\nAmount: $${data.amount}\nUser: ${data.userEmail}`,
    };

    const message = messages[type];
    if (!message) {
      return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
    }

    // In production, fetch the couple's telegram chat_id from database
    // For now, use the configured chat_id
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (chatId) {
      await sendTelegramMessage(chatId, message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
