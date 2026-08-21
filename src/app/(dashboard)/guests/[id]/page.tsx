"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Copy,
  Users,
  UserPlus,
  Download,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  ArrowLeft,
  ExternalLink,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Guest, Invitation, RSVP } from "@/types/database";

interface GuestWithRsvp extends Guest {
  rsvp?: RSVP;
}

export default function GuestManagerPage() {
  const params = useParams();
  const [guests, setGuests] = useState<GuestWithRsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [invitationSlug, setInvitationSlug] = useState("");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState<string | null>(null);
  const supabase = createClient();

  const fetchGuests = useCallback(async () => {
    if (!params.id) return;

    const { data: inv } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", params.id)
      .single();

    if (inv) {
      setInvitation(inv);
      setInvitationSlug(inv.slug);
    }

    const { data } = await supabase
      .from("guests")
      .select("*")
      .eq("invitation_id", params.id)
      .order("created_at", { ascending: false });

    const guestIds = (data || []).map((g: any) => g.id);
    let rsvpMap = new Map<string, any>();

    if (guestIds.length > 0) {
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("*")
        .in("guest_id", guestIds);

      (rsvps || []).forEach((r: any) => rsvpMap.set(r.guest_id, r));
    }

    const guestsWithRsvp = (data || []).map((g: any) => ({
      ...g,
      rsvp: rsvpMap.get(g.id) || null,
    }));

    setGuests(guestsWithRsvp as GuestWithRsvp[]);
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const getGuestSlug = (name: string) => {
    const slug = invitationSlug || "wedding";
    return `${slug}/guest/${name.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const addGuest = async () => {
    if (!newGuestName.trim()) return;

    const timestamp = Date.now().toString(36);
    const guestSlug = `${invitationSlug || "wedding"}/guest/${newGuestName.trim().toLowerCase().replace(/\s+/g, "-")}-${timestamp}${Math.random().toString(36).slice(2, 6)}`;

    const { error } = await supabase.from("guests").insert({
      invitation_id: params.id,
      name: newGuestName,
      custom_link: guestSlug,
    });

    if (!error) {
      setNewGuestName("");
      setDialogOpen(false);
      toast.success("បានបន្ថែមភ្ញៀវដោយជោគជ័យ!");
      fetchGuests();
    } else {
      toast.error("បរាជ័យក្នុងការបន្ថែមភ្ញៀវ");
    }
  };

  const addBulkGuests = async () => {
    const names = bulkText.split("\n").filter((n) => n.trim());

    let successCount = 0;
    let failCount = 0;

    for (const name of names) {
      const trimmed = name.trim();
      const timestamp = Date.now().toString(36);
      const guestSlug = `${invitationSlug || "wedding"}/guest/${trimmed.toLowerCase().replace(/\s+/g, "-")}-${timestamp}${Math.random().toString(36).slice(2, 6)}`;

      const { error } = await supabase.from("guests").insert({
        invitation_id: params.id,
        name: trimmed,
        custom_link: guestSlug,
      });

      if (error) failCount++;
      else successCount++;
    }

    if (successCount > 0) {
      toast.success(`បានបញ្ចូលភ្ញៀវ ${successCount} នាក់ដោយជោគជ័យ!`);
      fetchGuests();
    }
    if (failCount > 0) {
      toast.error(`បរាជ័យ ${failCount} នាក់`);
    }

    setBulkText("");
    setBulkDialogOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headerKeywords = ["ឈ្មោះ", "name", "ឈ្មោះភ្ញៀវ", "Name", "Guest", "ភ្ញៀវ"];
    const firstRow = (rows[0] || []).map((c: any) => String(c || "").trim().toLowerCase());
    const isHeader = firstRow.some((cell) => headerKeywords.some((k) => cell.includes(k.toLowerCase())));
    const dataRows = isHeader ? rows.slice(1) : rows;

    const names = dataRows
      .map((row) => String(row[0] || "").trim())
      .filter((n) => n.length > 0);

    const uniqueNames = Array.from(new Set(names));

    let successCount = 0;
    let failCount = 0;

    for (const name of uniqueNames) {
      const timestamp = Date.now().toString(36);
      const slugified = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u1780-\u17FF\u17E0-\u17E9-]/g, "")
        .slice(0, 40);
      const guestSlug = `${invitationSlug || "wedding"}/guest/${slugified}-${timestamp}${Math.random().toString(36).slice(2, 6)}`;

      const { error } = await supabase.from("guests").insert({
        invitation_id: params.id,
        name,
        custom_link: guestSlug,
      });

      if (error) failCount++;
      else successCount++;
    }

    if (successCount > 0) {
      toast.success(`បានបញ្ចូលភ្ញៀវ ${successCount} នាក់ដោយជោគជ័យ!`);
      fetchGuests();
    }
    if (failCount > 0) {
      toast.error(`បរាជ័យ ${failCount} នាក់`);
    }

    e.target.value = "";
  };

  const deleteGuest = async (id: string) => {
    await supabase.from("guests").delete().eq("id", id);
    setGuests(guests.filter((g) => g.id !== id));
  };

  const copyLink = async (link: string, id: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/invite/${link}`
    );
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllLinks = async () => {
    const links = guests
      .map((g) => `${window.location.origin}/invite/${g.custom_link}`)
      .join("\n");
    await navigator.clipboard.writeText(links);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const headers = ["ឈ្មោះ", "ស្ថានភាព", "ភ្ញៀវ", "សារ"];
    const rows = guests.map((g) => [
      g.name,
      !g.rsvp
        ? "រង់ចាំ"
        : g.rsvp.status === "attending"
          ? "ចូលរួម"
          : g.rsvp.status === "not_attending"
            ? "មិនចូលរួម"
            : "ពិចារណា",
      g.rsvp?.number_of_guests || 1,
      g.rsvp?.message || "",
    ]);

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ភ្ញៀវ");
    XLSX.writeFile(wb, `guests-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const sendTelegramToGuest = async (guest: GuestWithRsvp) => {
    setSendingTelegram(guest.id);

    const slug = invitationSlug || "wedding";
    const inviteLink = `${window.location.origin}/invite/${slug}/guest/${guest.name.toLowerCase().replace(/\s+/g, "-")}`;

    try {
      const res = await fetch("/api/telegram/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "guest_link",
          data: {
            guestName: guest.name,
            coupleName: invitation
              ? `${invitation.groom_name_kh || invitation.groom_name} & ${invitation.bride_name_kh || invitation.bride_name}`
              : "",
            weddingDate: invitation?.wedding_date
              ? new Date(invitation.wedding_date).toLocaleDateString("km-KH")
              : "",
            venueName: invitation?.venue_name || "",
            inviteLink,
          },
        }),
      });

      if (res.ok) {
        alert(`បានផ្ញើសារ Telegram ទៅ ${guest.name} ដោយជោគជ័យ!`);
      } else {
        const err = await res.json();
        alert(err.error || "បរាជ័យក្នុងការផ្ញើសារ");
      }
    } catch {
      alert("បរាជ័យក្នុងការផ្ញើសារ Telegram");
    }

    setSendingTelegram(null);
  };

  const stats = {
    total: guests.length,
    attending: guests.filter((g) => g.rsvp?.status === "attending").length,
    notAttending: guests.filter((g) => g.rsvp?.status === "not_attending").length,
    pending: guests.filter((g) => !g.rsvp || g.rsvp.status === "pending").length,
    maybe: guests.filter((g) => g.rsvp?.status === "maybe").length,
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
            <h1 className="text-2xl font-bold text-secondary">
              គ្រប់គ្រងភ្ញៀវ
            </h1>
            <p className="text-muted-foreground">
              ភ្ញៀវសរុប {guests.length} នាក់
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={exportExcel}
            className="gap-2 border-gold-200 text-secondary hover:bg-gold-50"
          >
            <Download className="h-4 w-4" /> ទាញយក Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gold-200 text-secondary hover:bg-gold-50"
            asChild
          >
            <a href="/sample-guests.xlsx" download className="cursor-pointer">
              <Download className="h-4 w-4" /> ទាញយកគំរូ Excel
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gold-200 text-secondary hover:bg-gold-50"
            asChild
          >
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" /> បញ្ចូល Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </Button>
          <Button
            variant="outline"
            onClick={copyAllLinks}
            className="gap-2 border-gold-200 text-secondary hover:bg-gold-50"
          >
            {allCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {allCopied ? "បានចម្លង!" : "ចម្លង Link ទាំងអស់"}
          </Button>
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-gold-200 text-secondary hover:bg-gold-50"
              >
                <Upload className="h-4 w-4" /> បញ្ចូលច្រើន
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>បញ្ចូលភ្ញៀវច្រើននាក់</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  បិទភ្ជាប់ឈ្មោះភ្ញៀវ ម្នាក់ក្នុងមួយជួរ៖
                </p>
                <Textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"ឈ្មោះភ្ញៀវ ១\nឈ្មោះភ្ញៀវ ២\nឈ្មោះភ្ញៀវ ៣"}
                  rows={8}
                  className="border-gold-200"
                />
                <Button
                  onClick={addBulkGuests}
                  className="w-full bg-gold-gradient text-white hover:opacity-90"
                  disabled={!bulkText.trim()}
                >
                  បញ្ចូលភ្ញៀវ{" "}
                  {bulkText.split("\n").filter((n) => n.trim()).length} នាក់
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gold-gradient text-white hover:opacity-90">
                <UserPlus className="h-4 w-4" /> បន្ថែមភ្ញៀវ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>បន្ថែមភ្ញៀវ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ឈ្មោះភ្ញៀវ</Label>
                  <Input
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGuest()}
                    placeholder="បញ្ចូលឈ្មោះភ្ញៀវ"
                    className="border-gold-200"
                  />
                </div>
                {newGuestName.trim() && (
                  <div className="text-sm text-muted-foreground bg-gold-50 p-3 rounded-lg">
                    <span className="font-medium">តំណភ្ជាប់៖</span>{" "}
                    /invite/{getGuestSlug(newGuestName)}
                  </div>
                )}
                <Button
                  onClick={addGuest}
                  className="w-full bg-gold-gradient text-white hover:opacity-90"
                  disabled={!newGuestName.trim()}
                >
                  បន្ថែមភ្ញៀវ
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-gold-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-gold-500" />
            <p className="text-2xl font-bold text-secondary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">សរុប</p>
          </CardContent>
        </Card>
        <Card className="border-gold-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {stats.attending}
            </p>
            <p className="text-xs text-muted-foreground">ចូលរួម</p>
          </CardContent>
        </Card>
        <Card className="border-gold-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-500">
              {stats.notAttending}
            </p>
            <p className="text-xs text-muted-foreground">មិនចូលរួម</p>
          </CardContent>
        </Card>
        <Card className="border-gold-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">រង់ចាំ</p>
          </CardContent>
        </Card>
        <Card className="border-gold-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-blue-500">{stats.maybe}</p>
            <p className="text-xs text-muted-foreground">ពិចារណា</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          កំពុងផ្ទុក...
        </div>
      ) : guests.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              មិនទាន់បានបន្ថែមភ្ញៀវទេ
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 bg-gold-gradient text-white hover:opacity-90"
            >
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
                    <th className="text-left p-3 text-sm font-medium text-secondary">
                      ឈ្មោះ
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">
                      ស្ថានភាព
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">
                      Link ផ្ទាល់
                    </th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">
                      សកម្មភាព
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => {
                    const rsvpStatus = guest.rsvp?.status;
                    const statusLabel = !rsvpStatus
                      ? "រង់ចាំ"
                      : rsvpStatus === "attending"
                        ? "ចូលរួម"
                        : rsvpStatus === "not_attending"
                          ? "មិនចូលរួម"
                          : "ពិចារណា";
                    const statusColor = !rsvpStatus
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : rsvpStatus === "attending"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : rsvpStatus === "not_attending"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-blue-100 text-blue-700 border-blue-200";

                    return (
                      <tr
                        key={guest.id}
                        className="border-b border-gold-200/30 last:border-0 hover:bg-gold-50/30"
                      >
                        <td className="p-3 font-medium text-secondary">
                          {guest.name}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-3">
                          <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate inline-block">
                            /invite/{guest.custom_link}
                          </code>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                copyLink(guest.custom_link, guest.id)
                              }
                              title="ចម្លង Link"
                            >
                              {copiedId === guest.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="បើក Link"
                            >
                              <a
                                href={`/invite/${guest.custom_link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => sendTelegramToGuest(guest)}
                              disabled={sendingTelegram === guest.id}
                              title="ផ្ញើ Telegram"
                            >
                              <Send
                                className={`h-4 w-4 ${sendingTelegram === guest.id ? "animate-pulse text-gold-500" : ""}`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteGuest(guest.id)}
                              title="លុប"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
