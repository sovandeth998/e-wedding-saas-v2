"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvitations: 0,
    publishedInvitations: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [users, invitations, published, orders, pending, revenue] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("invitations").select("id", { count: "exact", head: true }),
      supabase.from("invitations").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("amount").eq("status", "paid"),
    ]);

    const totalRev = (revenue.data || []).reduce((sum, o) => sum + (o.amount || 0), 0);

    setStats({
      totalUsers: users.count || 0,
      totalInvitations: invitations.count || 0,
      publishedInvitations: published.count || 0,
      totalOrders: orders.count || 0,
      pendingOrders: pending.count || 0,
      totalRevenue: totalRev,
    });
    setLoading(false);
  };

  const statCards = [
    { title: "អ្នកប្រើប្រាស់សរុប", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "លិខិតអញ្ជើញសរុប", value: stats.totalInvitations, icon: Mail, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "បានផ្សាយ", value: stats.publishedInvitations, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { title: "ចំណូលសរុប", value: `$${stats.totalRevenue}`, icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-50" },
    { title: "ការបញ្ជាទិញសរុប", value: stats.totalOrders, icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "ការបញ្ជាទិញរង់ចាំ", value: stats.pendingOrders, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">ស្ថិតិវេទិកា</h1>
        <p className="text-muted-foreground">ទិដ្ឋភាពរួមនៃវេទិការបស់អ្នក</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-secondary">{loading ? "..." : stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-secondary">សកម្មភាពថ្មីៗ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            សកម្មភាពនឹងបង្ហាញនៅទីនេះនៅពេលអ្នកប្រើប្រាស់ប្រើប្រាស់វេទិកា។
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
