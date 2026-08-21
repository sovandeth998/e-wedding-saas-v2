import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Calendar, Clock, MapPin, Eye } from "lucide-react";
import { RsvpForm } from "./rsvp-form";
import Countdown from "./countdown";

const templateStyles: Record<string, { header: string; label: string }> = {
  modern: {
    header: "bg-gradient-to-br from-gold-400 via-gold-300 to-gold-500",
    label: "សម័យទំនើប",
  },
  classic: {
    header: "bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700",
    label: "ប្រពៃណី",
  },
  luxury: {
    header: "bg-gold-gradient",
    label: "ប្រណិត",
  },
};

export default async function PreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!invitation) notFound();

  const { data: template } = invitation.template_id
    ? await supabase
        .from("templates")
        .select("name, category")
        .eq("id", invitation.template_id)
        .single()
    : { data: null };

  const style = templateStyles[template?.category as string] || templateStyles.luxury;

  const groomName = invitation.groom_name_kh || invitation.groom_name;
  const brideName = invitation.bride_name_kh || invitation.bride_name;
  const message = invitation.quote || invitation.story;

  const weddingDate = new Date(invitation.wedding_date);
  const formattedDate = weddingDate.toLocaleDateString("km-KH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-cream-gradient flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-gold-200 shadow-xl">
        <div className={`${style.header} p-8 text-center text-white rounded-t-xl`}>
          <Heart className="h-8 w-8 mx-auto mb-2 fill-white" />
          <p className="text-xs uppercase tracking-widest opacity-80 mb-3">
            លិខិតអញ្ជើញរោងពិធីរៀបការ
          </p>
          <h1 className="text-3xl font-bold">
            {groomName} &amp; {brideName}
          </h1>
          <p className="mt-2 opacity-90">សូមអញ្ជើញចូលរួមក្នុងថ្ងៃរៀបការរបស់យើង</p>
        </div>
        <CardContent className="p-6 space-y-4 text-center">
          <div>
            <p className="text-muted-foreground text-sm">ថ្ងៃរៀបការ</p>
            <p className="font-bold text-secondary flex items-center justify-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-primary" />
              {formattedDate}
            </p>
            <div className="mt-4">
              <Countdown weddingDate={invitation.wedding_date} />
            </div>
            {invitation.ceremony_time && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                <Clock className="h-3.5 w-3.5" />
                ពិធីជប់លៀងម៉ោង {invitation.ceremony_time}
              </p>
            )}
            {invitation.reception_time && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                ស្វាគមន៍ម៉ោង {invitation.reception_time}
              </p>
            )}
          </div>
          {(invitation.venue_name || invitation.venue_address) && (
            <div>
              <p className="text-muted-foreground text-sm">ទីកន្លែង</p>
              <p className="font-bold text-secondary flex items-center justify-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-primary" />
                {invitation.venue_name}
              </p>
              {invitation.venue_address && (
                <p className="text-sm text-muted-foreground mt-1">
                  {invitation.venue_address}
                </p>
              )}
            </div>
          )}
          {message && (
            <div>
              <p className="text-muted-foreground text-sm">សារ</p>
              <p className="text-secondary whitespace-pre-line leading-relaxed mt-1">
                {message}
              </p>
            </div>
          )}
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
            <p className="text-sm text-primary font-medium flex items-center justify-center gap-1.5">
              <Eye className="h-4 w-4" /> នេះគឺជាលក្ខណៈ Preview
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ភ្ញៀវនឹងឃើញទំព័រនេះនៅពេលចុច Link
            </p>
          </div>
          <div className="border-t border-gold-200/50 pt-4 text-left">
            <h2 className="text-lg font-bold text-secondary mb-4 text-center">
              សាកល្បង RSVP
            </h2>
            <RsvpForm invitationId={invitation.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
