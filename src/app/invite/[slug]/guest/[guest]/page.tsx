"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function InviteGuestRedirect() {
  const params = useParams();

  useEffect(() => {
    const slug = params.slug as string;
    const guest = params.guest as string;
    if (slug && guest) {
      window.location.replace(`/invite/${slug}?to=${guest}`);
    }
  }, [params.slug, params.guest]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
      <p className="text-amber-800">កំពុងផ្ទុក...</p>
    </div>
  );
}
