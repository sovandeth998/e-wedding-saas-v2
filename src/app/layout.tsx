import type { Metadata } from "next";
import { Kantumruy_Pro } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const kantumruy = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://e-wedding-saas-v2.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "💌 E-Wedding | លិខិតអញ្ជើញរៀបការ & ខួបកំណើតអនឡាញ",
  description:
    "បង្កើតលិខិតអញ្ជើញដ៏ស្រស់ស្អាត ជាមួយរូបភាព តន្ត្រី ការគណនាថ្ងៃពិធី និងប្រព័ន្ធបញ្ជាក់ការចូលរួម (RSVP) — ចែករំលែកទៅភ្ញៀវគ្រប់ទីកន្លែងតាម Telegram យ៉ាងងាយស្រួល",
  openGraph: {
    title: "💌 E-Wedding | លិខិតអញ្ជើញរៀបការ & ខួបកំណើតអនឡាញ",
    description:
      "បង្កើតលិខិតអញ្ជើញដ៏ស្រស់ស្អាត ជាមួយរូបភាព តន្ត្រី ការគណនាថ្ងៃពិធី និងប្រព័ន្ធបញ្ជាក់ការចូលរួម (RSVP) — ចែករំលែកទៅភ្ញៀវគ្រប់ទីកន្លែងតាម Telegram យ៉ាងងាយស្រួល",
    type: "website",
    url: BASE_URL,
    siteName: "E-Wedding",
    locale: "km_KH",
  },
  twitter: {
    card: "summary",
    title: "💌 E-Wedding | លិខិតអញ្ជើញរៀបការ & ខួបកំណើតអនឡាញ",
    description:
      "បង្កើតលិខិតអញ្ជើញដ៏ស្រស់ស្អាត ជាមួយរូបភាព តន្ត្រី ការគណនាថ្ងៃពិធី និងប្រព័ន្ធបញ្ជាក់ការចូលរួម (RSVP)",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <body className={kantumruy.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
