"use client";

import { useEffect, useState } from "react";

type Status = "online" | "offline" | "checking";

export function YoruStatusPill() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: { ok?: boolean }) => {
        if (!cancelled) setStatus(data.ok ? "online" : "offline");
      })
      .catch(() => {
        if (!cancelled) setStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dot =
    status === "online"
      ? "bg-emerald-500"
      : status === "offline"
        ? "bg-muted-foreground"
        : "bg-amber-500 animate-pulse";
  const label =
    status === "online" ? "Yoru online" : status === "offline" ? "Yoru offline" : "Yoru …";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}
