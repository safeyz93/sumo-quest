"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { HeroMascotCard } from "@/components/sections/hero-mascot-card";
import { useSumoAuth } from "@/components/providers/privy-provider";
import { ConnectButton } from "@/components/quest/connect-button";
import { ButtonLink } from "@/components/ui/button";
import { Sticker } from "@/components/ui/sticker";
import { XLogo } from "@/components/brand/marks";

const stats = [
  { value: "03", label: "lifts to clear" },
  { value: "3+", label: "years wallet age" },
  { value: "X", label: "login method" },
];

export function Hero() {
  const { ready, authenticated, twitter } = useSumoAuth();
  const signedIn = ready && authenticated && twitter !== null;

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b-[3px] border-paper/15"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-44 -top-48 size-[38rem] animate-spin-slow rounded-full border-[3px] border-dashed border-violet/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 size-96 rounded-full bg-violet/10"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <div className="animate-rise">
            <div className="flex flex-wrap items-center gap-2.5">
              <Sticker tone="mint" className="-rotate-2">
                Season 01 · Mawashi Run
              </Sticker>
              <Sticker tone="outline">3+ year wallets only</Sticker>
            </div>

            <h1 className="mt-6 font-display text-[clamp(5.5rem,19vw,15rem)] leading-[0.78] tracking-[-0.02em] text-paper [text-shadow:6px_6px_0_#836FFF]">
              SUMO
              <span className="sr-only">
                {" "}
                — heavyweight quests for wallets older than three years
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg">
              The heavyweight quest board for{" "}
              <span className="font-bold text-mint">old wallets</span>. Connect
              X, prove a wallet older than 3 years, then clear three lifts. Zero
              mercy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {signedIn ? (
                <>
                  <ButtonLink href="#quests" tone="mint" size="lg">
                    Enter the quest board
                    <ArrowRight aria-hidden="true" className="size-5" />
                  </ButtonLink>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">
                    Signed in as{" "}
                    <span className="text-mint">
                      @{twitter?.username || "unknown"}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <ConnectButton size="lg" />
                  <ButtonLink href="#quests" tone="outline" size="lg">
                    See the tasks
                  </ButtonLink>
                </>
              )}
            </div>

            <p className="mt-5 flex items-start gap-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-paper/45">
              <ShieldCheck
                aria-hidden="true"
                className="mt-px size-4 shrink-0 text-mint"
              />
              Privy X login · wallet age checked server-side via Etherscan · no
              seed phrase
            </p>

            <dl className="mt-10 grid max-w-lg grid-cols-3 border-t-[3px] border-paper/15">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={
                    index < stats.length - 1
                      ? "border-r-[3px] border-paper/15 pr-4 pt-4"
                      : "pt-4"
                  }
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="font-display text-3xl leading-none text-paper sm:text-4xl">
                      {stat.value}
                    </span>
                    <span className="mt-2 block font-mono text-[9px] uppercase leading-tight tracking-[0.14em] text-paper/40">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-rise-late">
            <HeroMascotCard />
            <p className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/35">
              <XLogo className="size-3.5" />
              Login method: X only
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
