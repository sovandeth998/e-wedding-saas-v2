import type { Metadata } from "next";
import { Kantumruy_Pro } from "next/font/google";
import "./globals.css";

const kantumruy = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy",
});

export const metadata: Metadata = {
  title: "E-Wedding | បង្កើតលិខិតអញ្ជើញរោងពិធីរៀបការអន្តរបណ្ដាញ",
  description: "បង្កើត និងចែករំលែកលិខិតអញ្ជើញរោងពិធីរៀបការអន្តរបណ្ដាញយ៉ាងស្អាត។ ងាយស្រួល ស្អាត និងថោក។",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <body className={kantumruy.className}>{children}</body>
    </html>
  );
}
