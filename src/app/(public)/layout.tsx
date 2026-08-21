"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gold-200/50 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold" onClick={() => setMobileOpen(false)}>
            <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-secondary">E-Wedding</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              ធៀបគំរូ
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
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">ចូល</Button>
            </Link>
            <Link href="/register" className="hidden md:block">
              <Button size="sm" className="bg-gold-gradient text-white hover:opacity-90">ចុះឈ្មោះ</Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gold-200/50 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link href="/templates" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2">
                ធៀបគំរូ
              </Link>
              <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2">
                តម្លៃ
              </Link>
              <Link href="/how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2">
                របៀបប្រើ
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2">
                ទំនាក់ទំនង
              </Link>
              <div className="flex gap-3 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-gold-200 text-secondary hover:bg-gold-50">ចូល</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full bg-gold-gradient text-white hover:opacity-90">ចុះឈ្មោះ</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-secondary text-white mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="font-bold text-lg">E-Wedding</span>
              </div>
              <p className="text-white/60 text-sm">បង្កើតលិខិតអញ្ជើញដ៏ស្អាតសម្រាប់ថ្ងៃរៀបការរបស់អ្នក</p>
            </div>
            <div>
              <h3 className="font-bold mb-3">ផ្សេងៗ</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/about" className="hover:text-white">អំពីយើង</Link></li>
                <li><Link href="/pricing" className="hover:text-white">តម្លៃ</Link></li>
                <li><Link href="/templates" className="hover:text-white">ធៀបគំរូ</Link></li>
                <li><Link href="/contact" className="hover:text-white">ទំនាក់ទំនង</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">គាំទ្រ</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/how-it-works" className="hover:text-white">របៀបប្រើ</Link></li>
                <li><Link href="/terms" className="hover:text-white">លក្ខន្តិកៈ</Link></li>
                <li><Link href="/privacy" className="hover:text-white">ឯកជនភាព</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">ទំនាក់ទំនង</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Email: mensovandath998@gmail.com</li>
                <li>ABA Bank: 070866998</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-white/40">
            © 2026 E-Wedding. រក្សាសិទ្ធិគ្រប់យ៉ាង។
          </div>
        </div>
      </footer>
    </div>
  );
}
