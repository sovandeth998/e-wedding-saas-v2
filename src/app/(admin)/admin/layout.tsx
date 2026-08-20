"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, LayoutDashboard, Users, CreditCard, Palette, BarChart3, LogOut, Menu, X, Settings } from "lucide-react";

const navItems = [
  { href: "/admin", label: "ស្ថិតិ", icon: BarChart3 },
  { href: "/admin/users", label: "អ្នកប្រើប្រាស់", icon: Users },
  { href: "/admin/orders", label: "ការបញ្ជាទិញ", icon: CreditCard },
  { href: "/admin/templates", label: "ពុម្ព", icon: Palette },
  { href: "/admin/settings", label: "ការកំណត់", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user || loading) return;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setIsAdmin(false);
        return;
      }

      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    })();
  }, [user, loading]);

  useEffect(() => {
    if (!loading && isAdmin === false) {
      router.push("/dashboard");
    }
  }, [isAdmin, loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading || isAdmin === null) {
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
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <div className="h-7 w-7 rounded-full bg-gold-gradient flex items-center justify-center">
            <Heart className="h-3.5 w-3.5 text-white fill-white" />
          </div>
          <span className="text-secondary">Admin</span>
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
            <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
              <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center">
                <Heart className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-secondary">Admin Panel</span>
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
                    ? "bg-gold-50 text-primary font-medium border border-gold-200"
                    : "text-muted-foreground hover:bg-muted hover:text-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gold-200/50 space-y-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="w-full gap-2 border-gold-200 text-secondary hover:bg-gold-50">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
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
