"use client";

import { Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { isEvmAddress } from "@/lib/evm";
import { cn } from "@/lib/utils";

export function WalletForm({
  onSubmit,
  busy,
  disabled,
  serverError,
  minAgeYears = 3,
}: {
  onSubmit: (address: string) => Promise<boolean>;
  busy: boolean;
  disabled: boolean;
  serverError?: string | null;
  minAgeYears?: number;
}) {
  const [value, setValue] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError ?? serverError ?? null;
  const isDisabled = busy || disabled;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDisabled) return;

    const address = value.trim();
    if (!isEvmAddress(address)) {
      setLocalError(
        "That is not a valid EVM address. Expected 0x followed by 40 hex characters.",
      );
      return;
    }

    setLocalError(null);
    const ok = await onSubmit(address);
    if (ok) setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <label
        htmlFor="wallet-address"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-paper/60"
      >
        EVM wallet address
      </label>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Wallet
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/30"
          />
          <input
            id="wallet-address"
            name="wallet-address"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="0x0000000000000000000000000000000000000000"
            value={value}
            disabled={isDisabled}
            onChange={(event) => {
              setValue(event.target.value);
              if (localError) setLocalError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "wallet-error" : "wallet-help"}
            className={cn(
              "w-full border-[3px] bg-void py-3 pl-10 pr-3 font-mono text-sm text-paper placeholder:text-paper/20 focus:outline-none",
              error
                ? "border-alert"
                : "border-paper/30 focus:border-mint focus-visible:outline-mint",
              isDisabled && "cursor-not-allowed opacity-60",
            )}
          />
        </div>

        <Button
          type="submit"
          tone="mint"
          size="md"
          disabled={isDisabled || value.trim().length === 0}
          aria-busy={busy || undefined}
        >
          {busy ? (
            <>
              <Spinner label="Checking wallet age" />
              Checking…
            </>
          ) : (
            "Check wallet age"
          )}
        </Button>
      </div>

      <p
        id="wallet-help"
        className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-paper/40"
      >
        First Ethereum activity must be older than {minAgeYears} years · one
        wallet per account
      </p>

      {error ? (
        <p
          id="wallet-error"
          role="alert"
          className="mt-2 text-xs font-bold leading-relaxed text-alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
