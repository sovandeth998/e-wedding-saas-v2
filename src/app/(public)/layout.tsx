import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gold-200/50 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-secondary">E-Wedding</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              ពុម្ព
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              តម្លៃ
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              របៀបប្រើ
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              ទំនាក់ទំនង
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">ចូល</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gold-gradient text-white hover:opacity-90">ចុះឈ្មោះ</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gold-200/50 bg-secondary text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-4">
                <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="text-white">E-Wedding</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                បង្កើតលិខិតអញ្ជើញរោងពិធីរៀបការអន្តរបណ្ដាញយ៉ាងស្អាត និងងាយស្រួល។
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gold-300 mb-4">ផលិតផល</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/templates" className="hover:text-gold-300 transition-colors">ពុម្ពលិខិត</Link></li>
                <li><Link href="/pricing" className="hover:text-gold-300 transition-colors">តម្លៃសេវា</Link></li>
                <li><Link href="/how-it-works" className="hover:text-gold-300 transition-colors">របៀបប្រើប្រាស់</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gold-300 mb-4">ជំនួយ</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/contact" className="hover:text-gold-300 transition-colors">ទំនាក់ទំនង</Link></li>
                <li><a href="#" className="hover:text-gold-300 transition-colors">សំណួរញឹកញាប់</a></li>
                <li><a href="#" className="hover:text-gold-300 transition-colors">Telegram Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gold-300 mb-4">ច្បាប់</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gold-300 transition-colors">គោលការណ៍ឯកជនភាព</a></li>
                <li><a href="#" className="hover:text-gold-300 transition-colors">លក្ខន្តិកៈសេវា</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} E-Wedding។ រក្សាសិទ្ធិគ្រប់យ៉ាង។ បង្កើតដោយស្រលាញ់នៅកម្ពុជា។ 🇰🇭</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
