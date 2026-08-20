"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subscription } from "@/types/database";

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*, package:packages(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setSubscription(data as Subscription | null);
      setLoading(false);
    })();
  }, [userId]);

  return { subscription, loading };
}
