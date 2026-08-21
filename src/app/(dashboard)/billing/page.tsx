"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Clock, Upload, QrCode, ArrowRight, Timer } from "lucide-react";
import { PACKAGES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type PaymentMethod = "khqr" | "receipt";

export default function BillingPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [bankSettings, setBankSettings] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(300);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*, package:packages(name)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (data?.package) {
        setCurrentPlan(data.package.name);
      }
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!upgradeOpen || paymentMethod !== "khqr" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [upgradeOpen, paymentMethod, countdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const plans = [
    { key: "free" as const, ...PACKAGES.free, current: currentPlan === "free" },
    { key: "standard" as const, ...PACKAGES.standard, current: currentPlan === "standard" },
    { key: "vip" as const, ...PACKAGES.vip, current: currentPlan === "vip" },
  ];

  const handleUpgradeClick = (plan: (typeof plans)[number]) => {
    if (plan.current || plan.key === "free") return;
    setSelectedPlan(plan.key);
    setSelectedPrice(plan.price);
    setPaymentMethod(null);
    setCountdown(300);
    setReceiptFile(null);
    setReceiptPreview(null);
    setSubmitSuccess(false);
    setUpgradeOpen(true);
  };

  const handleSelectKHQR = async () => {
    setPaymentMethod("khqr");
    setCountdown(300);
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", ["owner_bank_name", "owner_account_name", "owner_account_number", "owner_khqr_image"]);
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      setBankSettings(map);
    }
  };

  const handleSelectReceipt = () => {
    setPaymentMethod("receipt");
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!user || !selectedPlan) return;
    setSubmitting(true);

    try {
      let receiptUrl: string | null = null;
      if (paymentMethod === "receipt" && receiptFile) {
        const fileName = `receipts/${user.id}/${Date.now()}-${receiptFile.name}`;
        const { data: uploadData } = await supabase.storage
          .from("uploads")
          .upload(fileName, receiptFile);
        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(uploadData.path);
          receiptUrl = urlData.publicUrl;
        }
      }

      const { data: pkg } = await supabase
        .from("packages")
        .select("id")
        .eq("name", selectedPlan)
        .single();

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        package_id: pkg?.id,
        amount: selectedPrice,
        payment_method: paymentMethod === "khqr" ? "khqr" : "receipt_upload",
        payment_proof_url: receiptUrl,
        status: "pending",
      });

      if (!error) {
        setSubmitSuccess(true);
      }
    } catch {
      console.error("Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

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
                onClick={() => handleUpgradeClick(plan)}
              >
                {plan.current ? "កញ្ចប់បច្ចុប្បន្ន" : "ជាវឥឡូវនេះ"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md border-gold-200 bg-white">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gold-gradient flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-secondary">ការបញ្ជាទិញជោគជ័យ!</DialogTitle>
              <p className="text-sm text-muted-foreground">
                ការបញ្ជាទិញរបស់អ្នកកំពុងរង់ចាំការផ្ទៀងផ្ទាត់។ យើងនឹងទាក់ទងអ្នកឆាប់ៗនេះ។
              </p>
              <Button
                className="bg-gold-gradient text-white"
                onClick={() => setUpgradeOpen(false)}
              >
                បិទ
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-secondary">
                  ជាវកញ្ចប់ {selectedPlan === "standard" ? "ស្តង់ដារ" : "VIP"} - ${selectedPrice}
                </DialogTitle>
                <DialogDescription>
                  ជ្រើសរើសវិធីបង់ប្រាក់ដែលអ្នកចង់បាន
                </DialogDescription>
              </DialogHeader>

              {!paymentMethod && (
                <div className="space-y-3 py-2">
                  <button
                    onClick={handleSelectKHQR}
                    className="w-full p-4 rounded-lg border-2 border-gold-200 bg-gold-50 hover:bg-gold-100 transition-all flex items-center gap-4 text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
                      <QrCode className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">KHQR បង់ប្រាក់</p>
                      <p className="text-xs text-muted-foreground">ប្រើ QR ដើម្បីបង់ប្រាក់</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                  <button
                    onClick={handleSelectReceipt}
                    className="w-full p-4 rounded-lg border-2 border-gold-200 bg-gold-50 hover:bg-gold-100 transition-all flex items-center gap-4 text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">ផ្ញើរូបភាពបង្កាន់ដៃ (Receipt Upload)</p>
                      <p className="text-xs text-muted-foreground">ផ្ញើរូបភាពបង្កាន់ដៃបង់ប្រាក់</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                </div>
              )}

              {paymentMethod === "khqr" && (
                <div className="space-y-4 py-2">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      ផ្ញើប្រាក់ទៅគណនីខាងក្រោម
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Timer className="h-4 w-4 text-orange-500" />
                      <span className={`font-mono font-bold text-lg ${countdown < 60 ? "text-red-500" : "text-secondary"}`}>
                        {formatCountdown(countdown)}
                      </span>
                    </div>
                    {bankSettings.owner_khqr_image ? (
                      <div className="flex justify-center mb-3">
                        <img src={bankSettings.owner_khqr_image} alt="KHQR" className="w-[220px] h-[220px] object-contain rounded-xl border border-gold-200" />
                      </div>
                    ) : null}
                    <div className="p-6 bg-gold-50 rounded-xl border border-gold-200 text-left space-y-3 mx-auto max-w-sm">
                      <div className="text-center mb-3">
                        <p className="text-lg font-bold text-primary">{bankSettings.owner_bank_name || "ABA Bank"}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                          <span className="text-xs text-muted-foreground">ឈ្មោះគណនី</span>
                          <span className="font-bold text-secondary">{bankSettings.owner_account_name || "MENSOANDETH"}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                          <span className="text-xs text-muted-foreground">លេខគណនី</span>
                          <span className="font-bold text-secondary font-mono">{bankSettings.owner_account_number || "070866998"}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-primary/5 rounded-lg border border-primary/20">
                          <span className="text-xs text-muted-foreground">ចំនួនបង់</span>
                          <span className="font-bold text-primary text-lg">${selectedPrice}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">ផ្ញើរួច → បញ្ជាក់ការបង់ប្រាក់ខាងក្រោម</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPaymentMethod(null)}
                    >
                      ត្រលប់ក្រោយ
                    </Button>
                    <Button
                      className="flex-1 bg-gold-gradient text-white"
                      onClick={handleSubmitPayment}
                      disabled={submitting || countdown === 0}
                    >
                      {submitting ? "កំពុងដាក់ស្នើ..." : "បញ្ជាក់ការបង់ប្រាក់"}
                    </Button>
                  </div>
                </div>
              )}

              {paymentMethod === "receipt" && (
                <div className="space-y-4 py-2">
                  <p className="text-sm text-muted-foreground text-center">
                    ផ្ញើរូបភាពបង្កាន់ដៃបង់ប្រាក់
                  </p>
                  <div className="space-y-2">
                    <label className="block">
                      <span className="sr-only">ផ្ញើរូបភាពបង្កាន់ដៃ</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptChange}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold-gradient file:text-white hover:file:opacity-90 cursor-pointer"
                      />
                    </label>
                    {receiptPreview && (
                      <div className="mt-2 flex justify-center">
                        <img
                          src={receiptPreview}
                          alt="បង្កាន់ដៃ"
                          className="max-h-48 rounded-lg border border-gold-200"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPaymentMethod(null)}
                    >
                      ត្រលប់ក្រោយ
                    </Button>
                    <Button
                      className="flex-1 bg-gold-gradient text-white"
                      onClick={handleSubmitPayment}
                      disabled={submitting || !receiptFile}
                    >
                      {submitting ? "កំពុងដាក់ស្នើ..." : "ដាក់ស្នើ"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
