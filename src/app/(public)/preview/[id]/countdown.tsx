"use client";

import { useState, useEffect } from "react";

interface Props {
  weddingDate: string;
}

export default function Countdown({ weddingDate }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  const units = [
    { label: "ថ្ងៃ", value: timeLeft.days },
    { label: "ម៉ោង", value: timeLeft.hours },
    { label: "នាទី", value: timeLeft.minutes },
    { label: "វិនាទី", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {units.map((u) => (
        <div key={u.label} className="bg-gold-gradient text-white rounded-xl px-4 py-3 text-center min-w-[60px]">
          <p className="text-2xl font-bold">{u.value}</p>
          <p className="text-xs opacity-80">{u.label}</p>
        </div>
      ))}
    </div>
  );
}
