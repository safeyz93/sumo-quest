"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { useSumoAuth } from "@/components/providers/privy-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ProfileCard() {
  const { twitter, disconnect } = useSumoAuth();
  const [leaving, setLeaving] = useState(false);

  if (!twitter) return null;

  async function handleDisconnect() {
    if (leaving) return;
    setLeaving(true);
    try {
      await disconnect();
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border-[3px] border-paper/25 bg-deep p-4 shadow-hard-sm sm:p-5">
      <Avatar src={twitter.avatarUrl} name={twitter.name} size={56} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl leading-none text-paper">
          {twitter.name}
        </p>
        <p className="mt-1.5 truncate font-mono text-[11px] uppercase tracking-[0.1em] text-paper/50">
          @{twitter.username || "unknown"}
          <span className="mx-2 text-mint">·</span>
          signed in via Privy
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-mint sm:inline-flex">
          <span aria-hidden="true" className="size-1.5 animate-pulse-dot bg-mint" />
          connected
        </span>
        <Button
          type="button"
          tone="outline"
          size="sm"
          onClick={() => void handleDisconnect()}
          disabled={leaving}
        >
          {leaving ? (
            <Spinner label="Disconnecting" />
          ) : (
            <LogOut aria-hidden="true" className="size-4" />
          )}
          {leaving ? "Leaving…" : "Disconnect"}
        </Button>
      </div>
    </div>
  );
}
