"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";

export function RsvpForm({ invitationId }: { invitationId: string }) {
  const supabase = createClient();
  const [status, setStatus] = useState<"attending" | "not_attending" | "maybe" | "">("");
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitRsvp = async () => {
    if (!status || loading) return;
    setLoading(true);

    const { data: guest } = await supabase
      .from("guests")
      .insert({
        invitation_id: invitationId,
        name: name.trim() || "ភ្ញៀវសាកល្បង",
        custom_link: `preview/${invitationId}`,
        side: "both",
      })
      .select()
      .single();

    if (guest) {
      await supabase.from("rsvps").insert({
        guest_id: guest.id,
        invitation_id: invitationId,
        status,
        number_of_guests: status === "attending" ? guests : 0,
        message: message.trim() || null,
      });
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="h-12 w-12 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-3">
          <Heart className="h-6 w-6 text-white fill-white" />
        </div>
        <p className="font-semibold text-secondary">អរគុណសម្រាប់ការឆ្លើយតប!</p>
        <p className="text-sm text-muted-foreground mt-1">នេះគ្រាន់តែជាការសាកល្បងប៉ុណ្ណោះ។</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-secondary font-medium">ការឆ្លើយតបរបស់អ្នក</Label>
        <div className="flex gap-2">
          {([
            { value: "attending", label: "✓ នឹងមក" },
            { value: "not_attending", label: "✗ មិនមក" },
            { value: "maybe", label: "? ប្រហែល" },
          ] as const).map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant={status === opt.value ? "default" : "outline"}
              className={`flex-1 ${status === opt.value ? "bg-gold-gradient text-white" : "border-gold-200 text-secondary"}`}
              onClick={() => setStatus(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      {status === "attending" && (
        <div className="space-y-2">
          <Label className="text-secondary font-medium">ចំនួនភ្ញៀវ</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            className="border-gold-200"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-secondary font-medium">ឈ្មោះរបស់អ្នក</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ឈ្មោះរបស់អ្នក"
          className="border-gold-200"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-secondary font-medium">សារ (ជម្រើស)</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="សរសេរសារជូនគូស្នេហ៍..."
          rows={3}
          className="border-gold-200"
        />
      </div>
      <Button
        onClick={submitRsvp}
        disabled={!status || loading}
        className="w-full bg-gold-gradient text-white hover:opacity-90"
      >
        {loading ? "កំពុងផ្ញើ..." : "ផ្ញើ RSVP"}
      </Button>
    </div>
  );
}
