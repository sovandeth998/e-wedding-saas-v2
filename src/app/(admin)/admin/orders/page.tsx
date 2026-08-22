"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

type OrderRow = {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_proof_url: string | null;
  khqr_reference: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  user: { email: string } | null;
  package: { name: string; name_kh: string } | null;
};

type FilterStatus = "all" | "pending" | "paid" | "failed";

const statusLabels: Record<string, string> = {
  pending: "រង់ចាំ",
  paid: "បានបង់ប្រាក់",
  failed: "បានបរាជ័យ",
  refunded: "បានសងប្រាក់វិញ",
};

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

const paymentMethodLabels: Record<string, string> = {
  khqr: "KHQR",
  receipt_upload: "បង្កាន់ដៃ",
  payway: "PayWay",
};

const filterLabels: Record<string, string> = {
  all: "ទាំងអស់",
  pending: "រង់ចាំ",
  paid: "បានបង់ប្រាក់",
  failed: "បរាជ័យ",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, user:user_id(email), package:package_id(name, name_kh)")
      .order("created_at", { ascending: false });

    setOrders((data as OrderRow[]) || []);
    setLoading(false);
  };

  const approveOrder = async (order: OrderRow) => {
    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "paid", approved_at: new Date().toISOString() })
      .eq("id", order.id);

    if (orderError) return;

    const { data: pkg } = await supabase
      .from("packages")
      .select("duration_days")
      .eq("id", order.package_id)
      .single();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (pkg?.duration_days || 30));

    await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", order.user_id)
      .eq("status", "active");

    await supabase.from("subscriptions").insert({
      user_id: order.user_id,
      package_id: order.package_id,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      payment_id: order.id,
    });

    toast.success("បានយល់ស្រាល!");
    fetchOrders();
  };

  const rejectOrder = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    toast.success("បានបដិសេធ!");
    fetchOrders();
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">គ្រប់គ្រងការបញ្ជាទិញ</h1>
        <p className="text-muted-foreground">ពិនិត្យ និងអនុម័តការបង់ប្រាក់</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gold-200 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ការបញ្ជាទិញសរុប</p>
              <p className="text-xl font-bold text-secondary">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold-200 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">រង់ចាំអនុម័ត</p>
              <p className="text-xl font-bold text-secondary">{pendingOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold-200 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">បានបង់ប្រាក់</p>
              <p className="text-xl font-bold text-secondary">{paidOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold-200 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ប្រាក់ចំណូលសរុប</p>
              <p className="text-xl font-bold text-secondary">${totalRevenue}</p>
            </div>
          </CardContent>
        </Card>
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
        <Card className="border-gold-200 shadow-md">
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">មិនមានការបញ្ជាទិញ</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gold-200 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-200/50 bg-gold-50/50">
                    <th className="text-left p-3 text-sm font-medium text-secondary">អតិថជន</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">កញ្ចប់</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">ចំនួន</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">វិធីបង់ប្រាក់</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">បង្កាន់ដៃ</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">ស្ថានភាព</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">កាលបរិច្ឆេទ</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gold-200/30 last:border-0 hover:bg-gold-50/30">
                      <td className="p-3">
                        <p className="font-medium text-secondary">{order.user?.email || "មិនមាន"}</p>
                      </td>
                      <td className="p-3 text-sm text-secondary">{order.package?.name_kh || order.package?.name || "មិនមាន"}</td>
                      <td className="p-3 font-medium text-secondary">${order.amount}</td>
                      <td className="p-3 text-sm text-secondary">{paymentMethodLabels[order.payment_method] || order.payment_method || "មិនមាន"}</td>
                      <td className="p-3">
                        {order.payment_proof_url ? (
                          <a href={order.payment_proof_url} target="_blank" rel="noreferrer">
                            <img src={order.payment_proof_url} alt="បង្កាន់ដៃ" className="h-12 w-12 object-cover rounded border border-gold-200 hover:ring-2 hover:ring-primary transition-all" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={`${statusBadgeStyles[order.status] || ""} border-0`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("km-KH")}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveOrder(order)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                អនុម័ត
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => rejectOrder(order.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                បដិសេធ
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
