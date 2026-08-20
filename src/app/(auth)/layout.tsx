import { Heart } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-gradient px-4">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-accent blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-secondary">E-Wedding</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">បង្កើតលិខិតអញ្ជើញដ៏ស្អាត</p>
        </div>
        {children}
      </div>
    </div>
  );
}
