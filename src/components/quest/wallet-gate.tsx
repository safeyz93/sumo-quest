"use client";

import { AlertTriangle, CalendarClock, Link2 } from "lucide-react";
import { WalletForm } from "@/components/quest/wallet-form";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Sticker } from "@/components/ui/sticker";
import type { WalletEligibility } from "@/lib/quest-types";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null): string {
  if (!iso) return "no activity";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function WalletGateCard({
  mode,
  reason,
  message,
  wallet,
  minAgeYears,
  busy,
  error,
  onSubmit,
}: {
  mode: "required" | "ineligible";
  reason?: "wallet_too_young" | "wallet_no_history" | null;
  message: string;
  wallet: WalletEligibility | null;
  minAgeYears: number;
  busy: boolean;
  error: string | null;
  onSubmit: (address: string) => Promise<boolean>;
}) {
  const ineligible = mode === "ineligible";
  const heading = !ineligible
    ? "PROVE YOUR WALLET."
    : reason === "wallet_no_history"
      ? "NO WALLET HISTORY."
      : "WALLET TOO YOUNG.";

  return (
    <div
      className={cn(
        "relative overflow-hidden border-[3px] p-6 sm:p-8",
        ineligible
          ? "border-alert bg-deep shadow-hard-alert"
          : "border-paper/25 bg-deep shadow-hard",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Sticker tone={ineligible ? "alert" : "mint"}>
          {ineligible ? (
            <AlertTriangle aria-hidden="true" className="size-3" />
          ) : (
            <Link2 aria-hidden="true" className="size-3" />
          )}
          {ineligible ? "not eligible" : "wallet gate"}
        </Sticker>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/35">
          checked via Etherscan · Ethereum
        </span>
      </div>

      <h3 className="mt-5 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[0.9]">
        {heading}
      </h3>

      <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/70">
        {message}
      </p>

      {wallet ? (
        <dl className="mt-5 grid gap-px border-[3px] border-paper/20 bg-paper/20 sm:grid-cols-2">
          <div className="bg-deep p-4">
            <dt className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-paper/45">
              <CalendarClock aria-hidden="true" className="size-3.5" />
              First Ethereum activity
            </dt>
            <dd className="mt-1.5 font-mono text-sm text-paper">
              {formatDate(wallet.firstTxAt)}
            </dd>
          </div>
          <div className="bg-deep p-4">
            <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-paper/45">
              Wallet age
            </dt>
            <dd className="mt-1.5 font-mono text-sm text-paper">
              {wallet.ageYears !== null
                ? `${wallet.ageYears} years`
                : "no history"}
              <span className="text-paper/40">
                {" "}
                / min {minAgeYears} years
              </span>
            </dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <InlineAlert tone="error" className="mt-5" title="Wallet check failed">
          {error}
        </InlineAlert>
      ) : null}

      <div className="mt-6">
        <WalletForm
          onSubmit={onSubmit}
          busy={busy}
          disabled={busy}
          minAgeYears={minAgeYears}
        />
      </div>

      <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-paper/30">
        Server-side check · wallet is locked to this account once it passes
      </p>
    </div>
  );
}
