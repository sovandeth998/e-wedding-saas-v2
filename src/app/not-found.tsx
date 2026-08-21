import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gold-50 via-white to-gold-50 px-4">
      <div className="text-center max-w-md mx-auto space-y-6 py-16">
        <div className="flex justify-center mb-2">
          <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg">
            <Heart className="h-7 w-7 text-white" />
          </div>
        </div>

        <h1 className="text-8xl md:text-9xl font-extrabold bg-gold-gradient bg-clip-text text-transparent leading-none select-none">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-secondary">ទំព័រនេះរកមិនឃើញ</h2>
          <p className="text-muted-foreground">
            សូមអភ័យទោស! ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ទីរួចហើយ។
          </p>
        </div>

        <Link href="/">
          <Button className="gap-2 bg-gold-gradient text-white hover:opacity-90 px-8 py-6 text-base shadow-lg">
            <Home className="h-5 w-5" />
            ត្រឡប់ទំព័រដើម
          </Button>
        </Link>
      </div>
    </div>
  );
}
