"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, LayoutDashboard, Mail, BarChart3, CreditCard, User, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ទំព័រដើម", icon: LayoutDashboard },
  { href: "/invitations", label: "លិខិតអញ្ជើញរបស់ខ្ញុំ", icon: Mail },
  { href: "/analytics", label: "ស្ថិតិវិភាគទាន", icon: BarChart3 },
  { href: "/billing", label: "ការទូទាត់", icon: CreditCard },
  { href: "/profile", label: "គណនីរបស់ខ្ញុំ", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gold-200/50 px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <div className="h-7 w-7 rounded-full bg-gold-gradient flex items-center justify-center">
            <Heart className="h-3.5 w-3.5 text-white fill-white" />
          </div>
          <span className="text-secondary">E-Wedding</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 lg:top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gold-200/50 flex flex-col transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          <div className="p-4 border-b border-gold-200/50">
            <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
              <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center">
                <Heart className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-secondary">E-Wedding</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-gold-50 text-primary border border-gold-200"
                    : "text-muted-foreground hover:bg-muted hover:text-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gold-200/50">
            <Link href="/profile" className="flex items-center gap-2 text-xs text-muted-foreground mb-2 truncate hover:text-secondary transition-colors">
              <div className="h-6 w-6 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="truncate">{user?.email}</span>
            </Link>
            <Button variant="outline" size="sm" className="w-full gap-2 border-gold-200 text-secondary hover:bg-gold-50" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> ចេញ
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
