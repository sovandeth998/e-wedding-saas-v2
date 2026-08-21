"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Limits {
  maxInvitations: number;
  maxGuestsPerInvitation: number;
  currentInvitations: number;
  currentGuests: number;
  canCreateInvitation: boolean;
  canAddGuests: boolean;
  planName: string;
  loading: boolean;
}

const PLAN_LIMITS: Record<string, { maxInvitations: number; maxGuests: number }> = {
  free: { maxInvitations: 1, maxGuests: 20 },
  standard: { maxInvitations: 3, maxGuests: 100 },
  vip: { maxInvitations: 999, maxGuests: 9999 },
};

export function useLimits(): Limits {
  const { user } = useAuth();
  const [limits, setLimits] = useState<Limits>({
    maxInvitations: 1,
    maxGuestsPerInvitation: 20,
    currentInvitations: 0,
    currentGuests: 0,
    canCreateInvitation: false,
    canAddGuests: false,
    planName: "ឥតគិតថ្លៃ",
    loading: true,
  });
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, package:packages(name, name_kh)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      const planSlug = sub?.package?.name || "free";
      const planLimits = PLAN_LIMITS[planSlug] || PLAN_LIMITS.free;

      const { count: inviteCount } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { data: invitations } = await supabase
        .from("invitations")
        .select("id")
        .eq("user_id", user.id);
      const ids = invitations?.map((i) => i.id) || [];

      let totalGuests = 0;
      if (ids.length > 0) {
        const { count } = await supabase
          .from("guests")
          .select("*", { count: "exact", head: true })
          .in("invitation_id", ids);
        totalGuests = count || 0;
      }

      const currentInv = inviteCount || 0;

      setLimits({
        maxInvitations: planLimits.maxInvitations,
        maxGuestsPerInvitation: planLimits.maxGuests,
        currentInvitations: currentInv,
        currentGuests: totalGuests,
        canCreateInvitation: currentInv < planLimits.maxInvitations,
        canAddGuests: totalGuests < planLimits.maxGuests * (ids.length || 1),
        planName: sub?.package?.name_kh || "ឥតគិតថ្លៃ",
        loading: false,
      });
    })();
  }, [user]);

  return limits;
}
