"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, X, Eye } from "lucide-react";

type OrderWithDetails = any;

const statusLabels: Record<string, string> = {
  pending: "រង់ចាំ",
  paid: "បានបង់ប្រាក់",
  failed: "បានបរាជ័យ",
  refunded: "បានសងប្រាក់វិញ",
};

const filterLabels: Record<string, string> = {
  all: "ទាំងអស់",
  pending: "រង់ចាំ",
  paid: "បានបង់ប្រាក់",
  failed: "បរាជ័យ",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "failed">("all");
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, user:users(email, full_name), package:packages(name, name_kh)")
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setLoading(false);
  };

  const approveOrder = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({ status: "paid", approved_at: new Date().toISOString() })
      .eq("id", orderId);

    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const { data: pkg } = await supabase
        .from("packages")
        .select("*")
        .eq("id", order.package_id)
        .single();

      if (pkg) {
        await supabase.from("subscriptions").insert({
          user_id: order.user_id,
          package_id: order.package_id,
          status: "active",
          expires_at: new Date(Date.now() + pkg.duration_days * 86400000).toISOString(),
          payment_id: orderId,
        });
      }
    }

    fetchOrders();
  };

  const rejectOrder = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    fetchOrders();
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">គ្រប់គ្រងការបញ្ជាទិញ</h1>
        <p className="text-muted-foreground">ពិនិត្យ និងអនុម័តការបង់ប្រាក់</p>
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "paid", "failed"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? "bg-gold-gradient text-white" : "border-gold-200 text-secondary"}
          >
            {filterLabels[f]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">មិនមានការបញ្ជាទិញ</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-200/50 bg-gold-50/50">
                    <th className="text-left p-3 text-sm font-medium text-secondary">អ្នកប្រើប្រាស់</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">កញ្ចប់</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">ចំនួន</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">ស្ថានភាព</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">វិធីបង់ប្រាក់</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">ថ្ងៃ</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gold-200/30 last:border-0 hover:bg-gold-50/30">
                      <td className="p-3">
                        <p className="font-medium text-secondary">{order.user?.full_name || "មិនមាន"}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                      </td>
                      <td className="p-3 text-sm text-secondary">{order.package?.name_kh || order.package?.name}</td>
                      <td className="p-3 font-medium text-secondary">${order.amount}</td>
                      <td className="p-3">
                        <Badge className={`${statusColors[order.status]} border-0`}>{statusLabels[order.status] || order.status}</Badge>
                      </td>
                      <td className="p-3 text-sm capitalize text-secondary">{order.payment_method || "មិនមាន"}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("km-KH")}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {order.payment_proof_url && (
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => approveOrder(order.id)}>
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => rejectOrder(order.id)}>
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
