"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Wrench, CheckCircle, AlertCircle } from "lucide-react";

export default function FixTemplatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const supabase = createClient();

  const fixTemplateId = async () => {
    setLoading(true);
    setResult("");

    try {
      // Step 1: Try to alter column via raw SQL using the SQL endpoint
      const res = await fetch("/api/admin/fix-template-id", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        // Step 2: Update all invitations to have template_id
        const { data: invs } = await supabase
          .from("invitations")
          .select("id, template_id");

        let fixed = 0;
        if (invs) {
          for (const inv of invs) {
            if (!inv.template_id) {
              await supabase
                .from("invitations")
                .update({ template_id: "1" })
                .eq("id", inv.id);
              fixed++;
            }
          }
        }

        setResult(`✅ ជោគជ័យ! បានជួសជុល ${fixed} លិខិតអញ្ជើញ។ ${data.results?.join(", ") || ""}`);
        toast.success("បានជួសជុល template_id ជោគជ័យ!");
      } else {
        // Fallback: just try updating all invitations
        const { data: invs } = await supabase
          .from("invitations")
          .select("id");

        if (invs) {
          for (const inv of invs) {
            await supabase
              .from("invitations")
              .update({ template_id: "1" })
              .eq("id", inv.id);
          }
        }

        setResult(`⚠️ បានព្យាយាមជួសជុល។ ប្រសិនបើនៅតែមិនដំណើរការ សូម run SQL ក្នុង Supabase Dashboard៖\n\nALTER TABLE invitations ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT '1';`);
        toast.success("បានព្យាយាមជួសជុល!");
      }
    } catch (err: any) {
      setResult(`❌ កំហុស: ${err.message}`);
      toast.error("បរាជ័យ!");
    }

    setLoading(false);
  };

  const testTemplateChange = async () => {
    setLoading(true);
    try {
      const { data: invs } = await supabase
        .from("invitations")
        .select("id")
        .limit(1);

      if (invs && invs.length > 0) {
        const { error } = await supabase
          .from("invitations")
          .update({ template_id: "2" })
          .eq("id", invs[0].id);

        if (error) {
          setResult(`❌ កំហុស update: ${error.message}\n\nSQL ដែលត្រូវ run:\nALTER TABLE invitations ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT '1';`);
        } else {
          // Revert
          await supabase
            .from("invitations")
            .update({ template_id: "1" })
            .eq("id", invs[0].id);
          setResult(`✅ Test ជោគជ័យ! template_id អាច update បាន។`);
        }
      } else {
        setResult("⚠️ មិនមាន invitations ក្នុង DB។");
      }
    } catch (err: any) {
      setResult(`❌ កំហុស: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-bold text-secondary flex items-center gap-2">
            <Wrench className="h-5 w-5" /> ជួសជុល template_id
          </h1>
          <p className="text-sm text-muted-foreground">
            ប្រសិនបើការប្ដូរគំរូមិនដំណើរការ ចុចប៊ូតុងខាងក្រោមដើម្បីជួសជុល។
          </p>
          <div className="flex gap-3">
            <Button onClick={fixTemplateId} disabled={loading} className="bg-gold-gradient text-white">
              {loading ? "កំពុងជួសជុល..." : "ជួសជុល DB"}
            </Button>
            <Button onClick={testTemplateChange} disabled={loading} variant="outline" className="border-gold-200">
              {loading ? "កំពុងសាកល្បង..." : "Test Update"}
            </Button>
          </div>
          {result && (
            <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap ${result.startsWith("✅") ? "bg-green-50 text-green-700" : result.startsWith("❌") ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
