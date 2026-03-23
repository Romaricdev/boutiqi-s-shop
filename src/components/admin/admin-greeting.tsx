"use client";

import { useEffect, useState } from "react";

function phrase(hour: number) {
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function AdminGreeting({ name = "Admin" }: { name?: string }) {
  const [g, setG] = useState("Bonjour");

  useEffect(() => {
    setG(phrase(new Date().getHours()));
  }, []);

  return (
    <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight tracking-tight text-neutral-950">
      {g}, {name}
    </h1>
  );
}
