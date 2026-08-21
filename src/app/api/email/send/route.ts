import { NextResponse } from "next/server";

const emailTemplates: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  rsvp_confirmation: (data) => ({
    subject: `បញ្ជាក់ RSVP - ${data.coupleName || "ពិធីអាពាហ៍ពិពាហ៍"}`,
    html: `
<!DOCTYPE html>
<html lang="km">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fdf8ef;font-family:'Noto Sans Khmer',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<div style="background:linear-gradient(135deg,#d4911a,#e2a832);padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">💌 បញ្ជាក់ RSVP</h1>
</div>
<div style="padding:30px;">
<p style="color:#333;font-size:16px;line-height:1.8;">សួស្តី <strong>${data.guestName || "ភ្ញៀវជាទីស្រឡាញ់"}</strong>,</p>
<p style="color:#555;font-size:15px;line-height:1.8;">យើងខ្ញុំទាំងពីរសូមថ្លែងអំណរគុណដល់លោកអ្នកដែលបានឆ្លើយតប RSVP។ ព័ត៌មានរបស់លោកអ្នកត្រូវបានកត់ត្រារួចហើយ។</p>
<div style="background-color:#fdf8ef;border-radius:8px;padding:20px;margin:20px 0;">
<p style="margin:5px 0;color:#333;"><strong>👥 ស្ថានភាព៖</strong> ${data.status === "attending" ? "✅ នឹងចូលរួម" : data.status === "not_attending" ? "❌ មិនចូលរួម" : "⏳ កំពុងពិចារណា"}</p>
<p style="margin:5px 0;color:#333;"><strong>👤 ភ្ញៀវ៖</strong> ${data.guestName || ""}</p>
<p style="margin:5px 0;color:#333;"><strong>👥 ចំនួនភ្ញៀវ៖</strong> ${data.numberOfGuests || "1"} នាក់</p>
${data.ceremonyTime ? `<p style="margin:5px 0;color:#333;"><strong>⏰ ម៉ោង៖</strong> ${data.ceremonyTime}</p>` : ""}
${data.venueName ? `<p style="margin:5px 0;color:#333;"><strong>📍 ទីតាំង៖</strong> ${data.venueName}</p>` : ""}
</div>
<p style="color:#555;font-size:15px;line-height:1.8;">សូមទាក់ទងមកយើងខ្ញុំប្រសិនបើលោកអ្នកមានសំណួរណាមួយ។</p>
<p style="color:#d4911a;font-size:15px;font-weight:bold;">យើងខ្ញុំរង់ចាំជួបលោកអ្នក! 🙏💕</p>
</div>
<div style="background-color:#f5f5f5;padding:20px;text-align:center;">
<p style="color:#999;font-size:12px;margin:0;">${
      data.coupleName || "ពិធីអាពាហ៍ពិពាហ៍"
    } | ប្រព័ន្ធគ្រប់គ្រងលិខិតអញ្ជើញ</p>
</div>
</div>
</body>
</html>`,
  }),

  rsvp_notification: (data) => ({
    subject: `មាន RSVP ថ្មី! - ${data.coupleName || "ពិធីអាពាហ៍ពិពាហ៍"}`,
    html: `
<!DOCTYPE html>
<html lang="km">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fdf8ef;font-family:'Noto Sans Khmer',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<div style="background:linear-gradient(135deg,#d4911a,#e2a832);padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">🎉 មាន RSVP ថ្មី!</h1>
</div>
<div style="padding:30px;">
<p style="color:#333;font-size:16px;line-height:1.8;">សួស្តី,</p>
<p style="color:#555;font-size:15px;line-height:1.8;">ភ្ញៀវម្នាក់បានឆ្លើយតប RSVP សម្រាប់ពិធីអាពាហ៍ពិពាហ៍របស់លោកអ្នក។ សូមពិនិត្យព័ត៌មានលម្អិតខាងក្រោម។</p>
<div style="background-color:#fdf8ef;border-radius:8px;padding:20px;margin:20px 0;">
<p style="margin:5px 0;color:#333;"><strong>👤 ឈ្មោះភ្ញៀវ៖</strong> ${data.guestName || ""}</p>
<p style="margin:5px 0;color:#333;"><strong>📋 ស្ថានភាព៖</strong> ${data.status === "attending" ? "✅ នឹងចូលរួម" : data.status === "not_attending" ? "❌ មិនចូលរួម" : "⏳ កំពុងពិចារណា"}</p>
<p style="margin:5px 0;color:#333;"><strong>👥 ចំនួនភ្ញៀវ៖</strong> ${data.numberOfGuests || "1"} នាក់</p>
${
  data.message
    ? `<p style="margin:5px 0;color:#333;"><strong>💬 សារ៖</strong> ${data.message}</p>`
    : ""
}
</div>
<p style="color:#555;font-size:15px;line-height:1.8;">អ្នកអាចចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងដើម្បីមើលបញ្ជី RSVP ទាំងអស់។</p>
<p style="color:#d4911a;font-size:15px;font-weight:bold;">អរគុណដែលប្រើប្រាស់សេវាកម្មរបស់យើង! 🙏💕</p>
</div>
<div style="background-color:#f5f5f5;padding:20px;text-align:center;">
<p style="color:#999;font-size:12px;margin:0;">${
      data.coupleName || "ពិធីអាពាហ៍ពិពាហ៍"
    } | ប្រព័ន្ធគ្រប់គ្រងលិខិតអញ្ជើញ</p>
</div>
</div>
</body>
</html>`,
  }),

  wedding_reminder: (data) => ({
    subject: `រំលឹកពិធីអាពាហ៍ពិពាហ៍ - ${data.coupleName || ""}`,
    html: `
<!DOCTYPE html>
<html lang="km">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fdf8ef;font-family:'Noto Sans Khmer',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<div style="background:linear-gradient(135deg,#d4911a,#e2a832);padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">🔔 រំលឹកពិធីអាពាហ៍ពិពាហ៍</h1>
</div>
<div style="padding:30px;">
<p style="color:#333;font-size:16px;line-height:1.8;">សួស្តី <strong>${data.guestName || "ភ្ញៀវជាទីស្រឡាញ់"}</strong>,</p>
<p style="color:#555;font-size:15px;line-height:1.8;">យើងខ្ញុំសូមរំលឹកថា ពិធីរៀបអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំនឹងចាប់ផ្ដើមនៅថ្ងៃខាងក្រោម។</p>
<div style="background-color:#fdf8ef;border-radius:8px;padding:20px;margin:20px 0;">
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>📅 កាលបរិច្ឆេទ៖</strong> ${data.weddingDate || ""}</p>
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>⏰ ម៉ោងចូលរួម៖</strong> ${data.ceremonyTime || ""}</p>
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>📍 ទីតាំង៖</strong> ${data.venueName || ""}</p>
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>🏠 អាសយដ្ឋាន៖</strong> ${data.venueAddress || ""}</p>
</div>
<p style="color:#555;font-size:15px;line-height:1.8;">សូមបំពេញព័ត៌មាន RSVP ដើម្បីបញ្ជាក់ការចូលរួម។</p>
${
  data.inviteLink
    ? `<div style="text-align:center;margin:25px 0;"><a href="${data.inviteLink}" style="background:linear-gradient(135deg,#d4911a,#e2a832);color:#ffffff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">🔗 មើលលិខិតអញ្ជើញ</a></div>`
    : ""
}
<p style="color:#d4911a;font-size:15px;font-weight:bold;">យើងខ្ញុំសង្ឃឹមថានឹងបានជួបលោកអ្នក! 🙏💕</p>
</div>
<div style="background-color:#f5f5f5;padding:20px;text-align:center;">
<p style="color:#999;font-size:12px;margin:0;">${
      data.coupleName || "ពិធីអាពាហ៍ពិពាហ៍"
    } | ប្រព័ន្ធគ្រប់គ្រងលិខិតអញ្ជើញ</p>
</div>
</div>
</body>
</html>`,
  }),

  payment_confirmation: (data) => ({
    subject: `បញ្ជាក់ការទូទាត់ - ${data.packageName || "កញ្ចប់"}`,
    html: `
<!DOCTYPE html>
<html lang="km">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fdf8ef;font-family:'Noto Sans Khmer',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<div style="background:linear-gradient(135deg,#d4911a,#e2a832);padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">💳 បញ្ជាក់ការទូទាត់</h1>
</div>
<div style="padding:30px;">
<p style="color:#333;font-size:16px;line-height:1.8;">សួស្តី <strong>${data.userEmail || "អតិថិជន"}</strong>,</p>
<p style="color:#555;font-size:15px;line-height:1.8;">ការទូទាត់របស់លោកអ្នកត្រូវបានទទួល។ សូមអរគុណដែលប្រើប្រាស់សេវាកម្មរបស់យើង។</p>
<div style="background-color:#fdf8ef;border-radius:8px;padding:20px;margin:20px 0;">
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>📦 កញ្ចប់៖</strong> ${data.packageName || ""}</p>
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>💰 ចំនួនទឹកប្រាក់៖</strong> $${data.amount || "0"}</p>
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>📋 ស្ថានភាព៖</strong> ✅ បានបង់ប្រាក់រួច</p>
${data.transactionId ? `<p style="margin:8px 0;color:#333;font-size:15px;"><strong>🔑 លេខសម្គាល់៖</strong> ${data.transactionId}</p>` : ""}
<p style="margin:8px 0;color:#333;font-size:15px;"><strong>📅 កាលបរិច្ឆេទ៖</strong> ${new Date().toLocaleDateString("km-KH")}</p>
</div>
<p style="color:#555;font-size:15px;line-height:1.8;">ប្រសិនបើលោកអ្នកមានសំណួរណាមួយទាក់ទងនឹងការទូទាត់ សូមទាក់ទងមកយើងខ្ញុំ។</p>
</div>
<div style="background-color:#f5f5f5;padding:20px;text-align:center;">
<p style="color:#999;font-size:12px;margin:0;">ប្រព័ន្ធគ្រប់គ្រងលិខិតអញ្ជើញ | E-Wedding SaaS</p>
</div>
</div>
</body>
</html>`,
  }),

  welcome: (data) => ({
    subject: `សូមស្វាគមន៍មកកាន់ E-Wedding SaaS - ${data.userName || ""}`,
    html: `
<!DOCTYPE html>
<html lang="km">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fdf8ef;font-family:'Noto Sans Khmer',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<div style="background:linear-gradient(135deg,#d4911a,#e2a832);padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">🎉 សូមស្វាគមន៍!</h1>
</div>
<div style="padding:30px;">
<p style="color:#333;font-size:16px;line-height:1.8;">សួស្តី <strong>${data.userName || "អ្នកប្រើប្រាស់ថ្មី"}</strong>,</p>
<p style="color:#555;font-size:15px;line-height:1.8;">យើងខ្ញុំរីករាយដែលលោកអ្នកបានចុះឈ្មោះជាមួយ E-Wedding SaaS។ ឥឡូវនេះលោកអ្នកអាចបង្កើតលិខិតអញ្ជើញអាពាហ៍ពិពាហ៍ដ៏ស្រស់ស្អាតបានហើយ!</p>
<div style="background-color:#fdf8ef;border-radius:8px;padding:20px;margin:20px 0;">
<h3 style="color:#d4911a;margin:0 0 10px 0;">✨ លក្ខណៈពិសេស៖</h3>
<ul style="color:#555;font-size:14px;line-height:2;padding-left:20px;margin:0;">
<li>🎨 ស្បែកជើងអាពាហ៍ពិពាហ៍ដ៏ស្រស់ស្អាត</li>
<li>👤 គ្រប់គ្រងភ្ញៀវយ៉ាងងាយស្រួល</li>
<li>💌 ប្រព័ន្ធ RSVP អនឡាញ</li>
<li>📸 វិចិត្រសាលរូបភាព</li>
<li>🔗 តំណភ្ជាប់ផ្ទាល់ខ្លួន</li>
<li>📊 ស្ថិតិនិងរបាយការណ៍</li>
</ul>
</div>
<div style="text-align:center;margin:25px 0;">
<a href="${data.dashboardUrl || "#"}" style="background:linear-gradient(135deg,#d4911a,#e2a832);color:#ffffff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">🚀 ចាប់ផ្ដើមឥឡូវនេះ</a>
</div>
<p style="color:#555;font-size:15px;line-height:1.8;">ប្រសិនបើលោកអ្នកមានសំណួរណាមួយ សូមទាក់ទងមកយើងខ្ញុំ។</p>
</div>
<div style="background-color:#f5f5f5;padding:20px;text-align:center;">
<p style="color:#999;font-size:12px;margin:0;">E-Wedding SaaS | ប្រព័ន្ធគ្រប់គ្រងលិខិតអញ្ជើញ</p>
</div>
</div>
</body>
</html>`,
  }),
};

async function sendEmail(to: string, subject: string, html: string) {
  console.log("========================================");
  console.log("📧 EMAIL WOULD BE SENT");
  console.log("========================================");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("HTML Length:", html.length, "characters");
  console.log("Time:", new Date().toISOString());
  console.log("========================================");
  console.log("📝 To integrate with SendGrid, add:");
  console.log("   - npm install @sendgrid/mail");
  console.log("   - Set SENDGRID_API_KEY in .env.local");
  console.log("   - Uncomment SendGrid code below");
  console.log("========================================");

  // const sgMail = require("@sendgrid/mail");
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: "noreply@e-wedding.kh", subject, html });

  // const { Resend } = require("resend");
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.sendEmail({ from: "noreply@e-wedding.kh", to, subject, html });

  return { success: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, type, data = {} } = body;

    if (!to) {
      return NextResponse.json({ error: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "សូមបញ្ចូលប្រភេទអ៊ីមែល" }, { status: 400 });
    }

    const template = emailTemplates[type];
    if (!template) {
      return NextResponse.json(
        {
          error: "ប្រភេទអ៊ីមែលមិនត្រឹមត្រូវ",
          supportedTypes: Object.keys(emailTemplates),
        },
        { status: 400 }
      );
    }

    const { subject, html } = template(data);
    const result = await sendEmail(to, subject, html);

    return NextResponse.json({ success: true, type, to });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
