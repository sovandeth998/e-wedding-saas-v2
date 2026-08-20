"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Clock } from "lucide-react";
import { PACKAGES } from "@/lib/constants";

export default function BillingPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    supabase
      .from("subscriptions")
      .select("*, package:packages(name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
      .then(({ data }) => {
        if (data?.package) {
          setCurrentPlan(data.package.name);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const plans = [
    { key: "free" as const, ...PACKAGES.free, current: currentPlan === "free" },
    { key: "standard" as const, ...PACKAGES.standard, current: currentPlan === "standard" },
    { key: "vip" as const, ...PACKAGES.vip, current: currentPlan === "vip" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">ការទូទាត់ និងកញ្ចប់</h1>
        <p className="text-muted-foreground">គ្រប់គ្រងការជាវ និងការបង់ប្រាក់របស់អ្នក</p>
      </div>

      <Card className="bg-gradient-to-r from-gold-50 to-gold-100 border-0 shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gold-gradient flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">កញ្ចប់បច្ចុប្បន្ន</p>
              <p className="text-xl font-bold text-secondary capitalize">
                {currentPlan === "free" ? "ឥតគិតថ្លៃ" : currentPlan === "standard" ? "ស្តង់ដារ" : "VIP"}
              </p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white border-0">សកម្ម</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.key} className={`border-0 shadow-md ${plan.current ? "ring-2 ring-primary" : ""} hover:shadow-lg transition-all`}>
            <CardHeader>
              <CardTitle className="text-center text-secondary">
                {plan.nameKh}
                {plan.current && (
                  <Badge className="ml-2 bg-gold-gradient text-white border-0" variant="default">បច្ចុប្បន្ន</Badge>
                )}
              </CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold text-secondary">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground"> / កញ្ចប់</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-secondary">{plan.features.templates}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-secondary">{plan.features.guests} ភ្ញៀវ</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-secondary">{plan.features.photos}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-secondary">{plan.features.linkDuration}</span>
                </li>
              </ul>
              <Button
                className={`w-full mt-4 ${plan.current ? "" : "bg-gold-gradient text-white hover:opacity-90"}`}
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current}
              >
                {plan.current ? "កញ្ចប់បច្ចុប្បន្ន" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
