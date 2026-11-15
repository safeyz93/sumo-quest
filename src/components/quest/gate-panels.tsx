"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GateCheckingCard({
  title = "Opening the gate",
  message = "Loading your session and wallet state.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div
      aria-live="polite"
      className="border-[3px] border-paper/25 bg-deep p-6 shadow-hard-sm sm:p-8"
    >
      <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-paper/70">
        <Spinner className="size-5 text-mint" label="Loading gate state" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-paper/55">{message}</p>
      <div aria-hidden="true" className="mt-6 space-y-2.5">
        <div className="h-3 w-2/3 animate-pulse bg-paper/10 motion-reduce:animate-none" />
        <div className="h-3 w-1/2 animate-pulse bg-paper/10 motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export function GateErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="border-[3px] border-alert bg-deep p-6 shadow-hard-alert sm:p-8"
    >
      <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-alert">
        <AlertTriangle aria-hidden="true" className="size-4" />
        Gate jammed
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/70">
        {message}
      </p>
      <div className="mt-6">
        <Button type="button" tone="paper" size="md" onClick={onRetry}>
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}

export function SetupRequiredCard() {
  return (
    <div className="border-[3px] border-violet bg-deep p-6 shadow-hard-violet sm:p-8">
      <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-violet">
        Setup required
      </div>
      <h3 className="mt-4 font-display text-3xl leading-none text-paper">
        PRIVY IS NOT CONFIGURED.
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/70">
        Add{" "}
        <code className="border-2 border-paper/20 px-1.5 py-0.5 font-mono text-[11px] text-mint">
          NEXT_PUBLIC_PRIVY_APP_ID
        </code>{" "}
        to <code className="font-mono text-[11px] text-mint">.env.local</code>,
        restart the dev server, then connect X. The full step-by-step setup is
        in the README.
      </p>
    </div>
  );
}
