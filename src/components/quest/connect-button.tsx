"use client";

import { useSumoAuth } from "@/components/providers/privy-provider";
import { XLogo } from "@/components/brand/marks";
import { Button, type ButtonSize } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ConnectButton({
  size = "md",
  className,
  label = "Connect Twitter",
}: {
  size?: ButtonSize;
  className?: string;
  label?: string;
}) {
  const { configured, ready, authenticated, connect } = useSumoAuth();

  if (authenticated) return null;

  const waiting = configured && !ready;

  return (
    <Button
      type="button"
      tone="mint"
      size={size}
      className={className}
      onClick={connect}
      disabled={!configured || waiting}
      aria-busy={waiting || undefined}
      title={
        !configured
          ? "Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local to enable X login"
          : undefined
      }
    >
      {waiting ? (
        <Spinner label="Preparing login" />
      ) : (
        <XLogo className="size-4" />
      )}
      {waiting ? "Loading…" : label}
    </Button>
  );
}
