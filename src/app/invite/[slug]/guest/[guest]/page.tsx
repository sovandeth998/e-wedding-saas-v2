"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InviteGuestRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const slug = params.slug as string;
    const guest = params.guest as string;
    if (slug && guest) {
      router.replace(`/invite/${slug}?to=${encodeURIComponent(guest)}`);
    }
  }, [params.slug, params.guest, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
      <p className="text-amber-800 font-kantumruy">កំពុងផ្ទុក...</p>
    </div>
  );
}
