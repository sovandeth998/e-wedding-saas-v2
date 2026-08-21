import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string, message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("Telegram bot token not configured");
    return { ok: false, error: "Telegram bot token not configured" };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram API error:", data.description);
      return { ok: false, error: data.description };
    }
    return { ok: true };
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return { ok: false, error: "Network error" };
  }
}

function formatRsvpMessage(data: Record<string, string>) {
  return [
    `🎊 <b>មានការឆ្លើយតប RSVP ថ្មី!</b>`,
    ``,
    `👤 <b>ភ្ញៀវ:</b> ${data.guestName || "មិនស្គាល់"}`,
    `📋 <b>ស្ថានភាព:</b> ${data.status === "attending" ? "✅ នឹងចូលរួម" : data.status === "not_attending" ? "❌ មិនចូលរួម" : "⏳ កំពុងពិចារណា"}`,
    `👥 <b>ចំនួនភ្ញៀវ:</b> ${data.numberOfGuests || "1"} នាក់`,
    data.message ? `💬 <b>សារ:</b> ${data.message}` : "",
    ``,
    `📅 ${new Date().toLocaleDateString("km-KH")} ${new Date().toLocaleTimeString("km-KH")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatWishMessage(data: Record<string, string>) {
  return [
    `💌 <b>មានព័ត៌មានជូនពរថ្មី!</b>`,
    ``,
    `👤 <b>ពី:</b> ${data.senderName || "អ្នកស្គាល់"}`,
    `📝 <b>សារជូនពរ:</b>`,
    `"${data.content || "ជូនពររៀងអស់រដូវស្លឹកឈើជ្រុះ"}"`,
    ``,
    `📅 ${new Date().toLocaleDateString("km-KH")} ${new Date().toLocaleTimeString("km-KH")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatPaymentMessage(data: Record<string, string>) {
  return [
    `💳 <b>ព័ត៌មានការទូទាត់</b>`,
    ``,
    `📦 <b>កញ្ចប់:</b> ${data.packageName || "មិនស្គាល់"}`,
    `💰 <b>ចំនួន:</b> $${data.amount || "0"}`,
    `📋 <b>ស្ថានភាព:</b> ${data.status === "paid" ? "✅ បានបង់ប្រាក់" : data.status === "pending" ? "⏳ កំពុងរង់ចាំ" : "❌ បានបរាជ័យ"}`,
    `👤 <b>អ្នកប្រើប្រាស់:</b> ${data.userEmail || "មិនស្គាល់"}`,
    ``,
    `📅 ${new Date().toLocaleDateString("km-KH")} ${new Date().toLocaleTimeString("km-KH")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatGuestLinkMessage(data: Record<string, string>) {
  return [
    `💌 <b>សូមស្វាគមន៍មកកាន់ពិធីរៀបអាពាហ៍ពិពាហ៍!</b>`,
    ``,
    `សួស្តី <b>${data.guestName || "ភ្ញៀវជាទីស្រឡាញ់"}</b> 👋`,
    ``,
    `យើងខ្ញុំទាំងពីរសូមគោរពអញ្ជើញលោកអ្នកមកចូលរួមក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។`,
    ``,
    `🏠 <b>ព័ត៌មានពិធី:</b>`,
    `👫 ${data.coupleName || ""}`,
    `📅 ${data.weddingDate || ""}`,
    `📍 ${data.venueName || ""}`,
    ``,
    `🔗 <b>សូមចុចលើតំណភ្ជាប់ខាងក្រោមដើម្បីមើលលិខិតអញ្ជើញ៖</b>`,
    `${data.inviteLink || ""}`,
    ``,
    `សូមបំពេញព័ត៌មាន RSVP ដើម្បីបញ្ជាក់ការចូលរួម។ យើងខ្ញុំរង់ចាំជួបលោកអ្នក! 🙏💕`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatWeddingReminderMessage(data: Record<string, string>) {
  return [
    `🔔 <b>រំលឹកពិធីអាពាហ៍ពិពាហ៍!</b>`,
    ``,
    `សួស្តី <b>${data.guestName || "ភ្ញៀវជាទីស្រឡាញ់"}</b> 👋`,
    ``,
    `យើងខ្ញុំសូមរំលឹកថា ពិធីរៀបអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំនឹងចាប់ផ្ដើមនៅថ្ងៃទី <b>${data.weddingDate || ""}</b>។`,
    ``,
    `⏰ <b>ម៉ោងចូលរួម៖</b> ${data.ceremonyTime || ""}`,
    `📍 <b>ទីតាំង៖</b> ${data.venueName || ""}`,
    `🏠 <b>អាសយដ្ឋាន៖</b> ${data.venueAddress || ""}`,
    ``,
    `👥 <b>ភ្ញៀវ៖</b> ${data.coupleName || ""}`,
    ``,
    `🔗 <b>តំណភ្ជាប់៖</b> ${data.inviteLink || ""}`,
    ``,
    `យើងខ្ញុំសង្ឃឹមថានឹងបានជួបលោកអ្នក! 🙏💕`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, coupleId, chatId, data = {} } = body;

    if (!type) {
      return NextResponse.json({ error: "ប្រភេទជូនដំណឹងមិនអាចរកឃើញ" }, { status: 400 });
    }

    const messageFormatters: Record<string, (d: Record<string, string>) => string> = {
      rsvp: formatRsvpMessage,
      wish: formatWishMessage,
      payment: formatPaymentMessage,
      guest_link: formatGuestLinkMessage,
      wedding_reminder: formatWeddingReminderMessage,
    };

    const formatter = messageFormatters[type];
    if (!formatter) {
      return NextResponse.json(
        {
          error: "ប្រភេទជូនដំណឹងមិនត្រឹមត្រូវ",
          supportedTypes: Object.keys(messageFormatters),
        },
        { status: 400 }
      );
    }

    const message = formatter(data);

    if (type === "guest_link") {
      if (!chatId) {
        return NextResponse.json(
          { error: "សូមបញ្ចូល chatId របស់ភ្ញៀវដើម្បីផ្ញើសារជូនដំណឹង" },
          { status: 400 }
        );
      }
      const result = await sendTelegramMessage(chatId, message);
      if (!result.ok) {
        return NextResponse.json({ error: "បរាជ័យក្នុងការផ្ញើសារ", details: result.error }, { status: 500 });
      }
      return NextResponse.json({ success: true, type, chatId });
    }

    if (type === "wedding_reminder") {
      const targetChatIds: string[] = data.chatIds
        ? data.chatIds.split(",").map((id: string) => id.trim())
        : [];
      if (data.chatId) {
        targetChatIds.push(data.chatId);
      }

      if (targetChatIds.length === 0) {
        const globalChatId = process.env.TELEGRAM_CHAT_ID;
        if (globalChatId) {
          const result = await sendTelegramMessage(globalChatId, message);
          return NextResponse.json({ success: true, type, sentTo: "global_chat" });
        }
        return NextResponse.json(
          { error: "មិនមាន chatId ណាមួយសម្រាប់ផ្ញើរំលឹក" },
          { status: 400 }
        );
      }

      const results = await Promise.allSettled(
        targetChatIds.map((id) => sendTelegramMessage(id, message))
      );
      const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
      const failed = results.length - succeeded;

      return NextResponse.json({ success: true, type, sent: succeeded, failed, total: results.length });
    }

    if (chatId) {
      const result = await sendTelegramMessage(chatId, message);
      if (!result.ok) {
        return NextResponse.json({ error: "បរាជ័យក្នុងការផ្ញើសារ", details: result.error }, { status: 500 });
      }
      return NextResponse.json({ success: true, type, chatId });
    }

    const defaultChatId = process.env.TELEGRAM_CHAT_ID;
    if (defaultChatId) {
      const result = await sendTelegramMessage(defaultChatId, message);
      if (!result.ok) {
        return NextResponse.json({ error: "បរាជ័យក្នុងការផ្ញើសារ", details: result.error }, { status: 500 });
      }
      return NextResponse.json({ success: true, type, sentTo: "default_chat" });
    }

    return NextResponse.json(
      { error: "មិនមាន Telegram chatId សម្រាប់ផ្ញើសារ" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Telegram notify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
