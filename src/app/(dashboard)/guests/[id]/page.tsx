"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Copy, Upload, Download, Trash2, Users, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Guest } from "@/types/database";

export default function GuestManagerPage() {
  const params = useParams();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestSide, setNewGuestSide] = useState<"groom" | "bride" | "both">("both");
  const [bulkText, setBulkText] = useState("");
  const [invitationSlug, setInvitationSlug] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!params.id) return;
    fetchGuests();
  }, [params.id]);

  const fetchGuests = async () => {
    const { data: invitation } = await supabase
      .from("invitations")
      .select("slug")
      .eq("id", params.id)
      .single();

    if (invitation) setInvitationSlug(invitation.slug);

    const { data } = await supabase
      .from("guests")
      .select("*")
      .eq("invitation_id", params.id)
      .order("created_at", { ascending: false });

    setGuests(data || []);
    setLoading(false);
  };

  const addGuest = async () => {
    if (!newGuestName.trim()) return;

    const slug = invitationSlug || "wedding";
    const guestSlug = `${slug}/guest/${newGuestName.toLowerCase().replace(/\s+/g, "-")}`;

    const { error } = await supabase.from("guests").insert({
      invitation_id: params.id,
      name: newGuestName,
      custom_link: guestSlug,
      side: newGuestSide,
    });

    if (!error) {
      setNewGuestName("");
      setDialogOpen(false);
      fetchGuests();
    }
  };

  const addBulkGuests = async () => {
    const names = bulkText.split("\n").filter((n) => n.trim());
    const slug = invitationSlug || "wedding";

    const guestInserts = names.map((name) => ({
      invitation_id: params.id,
      name: name.trim(),
      custom_link: `${slug}/guest/${name.trim().toLowerCase().replace(/\s+/g, "-")}`,
      side: "both" as const,
    }));

    const { error } = await supabase.from("guests").insert(guestInserts);

    if (!error) {
      setBulkText("");
      setBulkDialogOpen(false);
      fetchGuests();
    }
  };

  const deleteGuest = async (id: string) => {
    await supabase.from("guests").delete().eq("id", id);
    setGuests(guests.filter((g) => g.id !== id));
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${link}`);
    alert("បានចម្លង Link!");
  };

  const exportToCSV = () => {
    const headers = ["ឈ្មោះ", "ភាគី", "Link ផ្ទាល់"];
    const rows = guests.map((g) => [g.name, g.side || "", `${window.location.origin}/invite/${g.custom_link}`]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guests.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/invitations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary">គ្រប់គ្រងភ្ញៀវ</h1>
            <p className="text-muted-foreground">ភ្ញៀវសរុប {guests.length} នាក់</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportToCSV} className="gap-2 border-gold-200 text-secondary hover:bg-gold-50">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-gold-200 text-secondary hover:bg-gold-50">
                <Upload className="h-4 w-4" /> បញ្ចូលច្រើន
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>បញ្ចូលភ្ញៀវច្រើននាក់</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">បិទភ្ជាប់ឈ្មោះភ្ញៀវ ម្នាក់ក្នុងមួយជួរ៖</p>
                <Textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"ឈ្មោះភ្ញៀវ ១\nឈ្មោះភ្ញៀវ ២\nឈ្មោះភ្ញៀវ ៣"} rows={8} className="border-gold-200" />
                <Button onClick={addBulkGuests} className="w-full bg-gold-gradient text-white hover:opacity-90">
                  បញ្ចូលភ្ញៀវ {bulkText.split("\n").filter((n) => n.trim()).length} នាក់
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gold-gradient text-white hover:opacity-90">
                <Plus className="h-4 w-4" /> បន្ថែមភ្ញៀវ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>បន្ថែមភ្ញៀវ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ឈ្មោះភ្ញៀវ</Label>
                  <Input value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} placeholder="បញ្ចូលឈ្មោះភ្ញៀវ" className="border-gold-200" />
                </div>
                <div className="space-y-2">
                  <Label>ភាគី</Label>
                  <div className="flex gap-2">
                    {(["groom", "bride", "both"] as const).map((side) => (
                      <Button key={side} variant={newGuestSide === side ? "default" : "outline"} size="sm" onClick={() => setNewGuestSide(side)} className="capitalize">
                        {side === "groom" ? "កំលោះ" : side === "bride" ? "ក្រមុំ" : "ទាំងពីរ"}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={addGuest} className="w-full bg-gold-gradient text-white hover:opacity-90">បន្ថែមភ្ញៀវ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
      ) : guests.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">មិនទាន់បានបន្ថែមភ្ញៀវទេ</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-gold-gradient text-white hover:opacity-90">
              <UserPlus className="h-4 w-4" /> បន្ថែមភ្ញៀវដំបូង
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-200/50 bg-gold-50/50">
                    <th className="text-left p-3 text-sm font-medium text-secondary">ឈ្មោះ</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">ភាគី</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">Link ផ្ទាល់</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-gold-200/30 last:border-0 hover:bg-gold-50/30">
                      <td className="p-3 font-medium text-secondary">{guest.name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize border-gold-200">{guest.side === "groom" ? "កំលោះ" : guest.side === "bride" ? "ក្រមុំ" : "ទាំងពីរ"}</Badge>
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          /invite/{guest.custom_link}
                        </code>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => copyLink(guest.custom_link)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteGuest(guest.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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
