"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { StatsSkeleton } from "@/components/skeleton-loader";

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface UserRow {
  id: string;
  created_at: string;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvitations: 0,
    publishedInvitations: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState<{ name: string; amount: number }[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ name: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [users, usersAll, invitations, published, orders, pending, revenue] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id, created_at"),
      supabase.from("invitations").select("id", { count: "exact", head: true }),
      supabase.from("invitations").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("amount, status, created_at, id").eq("status", "approved"),
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

    const monthNames = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

    const revenueByMonth: Record<string, number> = {};
    (revenue.data || []).forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + (o.amount || 0);
    });
    setRevenueData(
      Object.entries(revenueByMonth).map(([name, amount]) => ({ name, amount }))
    );

    const usersByMonth: Record<string, number> = {};
    (usersAll.data || []).forEach((u) => {
      const d = new Date(u.created_at);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      usersByMonth[key] = (usersByMonth[key] || 0) + 1;
    });
    setUserGrowth(
      Object.entries(usersByMonth).map(([name, count]) => ({ name, count }))
    );

    const { data: recentOrdersData } = await supabase
      .from("orders")
      .select("id, amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentOrders(recentOrdersData || []);

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

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "រង់ចាំ", color: "bg-yellow-100 text-yellow-700" },
    approved: { label: "បានយល់ស្រាល", color: "bg-green-100 text-green-700" },
    rejected: { label: "បដិសេធ", color: "bg-red-100 text-red-700" },
    paid: { label: "បានបង់ប្រាក់", color: "bg-blue-100 text-blue-700" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">ស្ថិតិវេទិកា</h1>
        <p className="text-muted-foreground">ទិដ្ឋភាពរួមនៃវេទិការបស់អ្នក</p>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-secondary">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-secondary">ចំណូលតាមខែ</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="url(#goldGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4a017" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">មិនទាន់មានចំណូល</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-secondary">កំណើនអ្នកប្រើប្រាស់</CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#b8860b" strokeWidth={2} dot={{ fill: "#b8860b" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">មិនទាន់មានអ្នកប្រើប្រាស់</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-secondary">ការបញ្ជាទិញថ្មីៗ</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-200">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">ID</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">ចំណូល</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">ស្ថានភាព</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">កាលបរិច្ឆេទ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gold-100 last:border-0">
                      <td className="py-3 px-2 font-mono text-xs text-secondary">{order.id.slice(0, 8)}...</td>
                      <td className="py-3 px-2 font-bold text-secondary">${order.amount}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[order.status]?.color || "bg-gray-100"}`}>
                          {statusMap[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("km")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">មិនទាន់មានការបញ្ជាទិញ</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
