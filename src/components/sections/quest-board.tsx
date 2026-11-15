"use client";

import {
  CalendarClock,
  Check,
  ExternalLink,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { LINKS } from "@/config/links";
import { useSumoAuth } from "@/components/providers/privy-provider";
import { useQuest } from "@/hooks/use-quest";
import { ConnectButton } from "@/components/quest/connect-button";
import {
  GateCheckingCard,
  GateErrorCard,
  SetupRequiredCard,
} from "@/components/quest/gate-panels";
import { ProfileCard } from "@/components/quest/profile-card";
import { SuccessState } from "@/components/quest/success-state";
import { TaskCard } from "@/components/quest/task-card";
import { WalletGateCard } from "@/components/quest/wallet-gate";
import { Button, ButtonLink } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { Sticker } from "@/components/ui/sticker";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function QuestBoard() {
  const auth = useSumoAuth();
  const quest = useQuest();

  const progress = quest.progress;
  const action = quest.action;
  const minAgeYears = progress?.eligibility.minAgeYears ?? 3;

  const followDone = progress?.tasks.follow.status === "completed";
  const replyDone = progress?.tasks.reply.status === "completed";

  const followStatus = followDone
    ? "completed"
    : action === "follow"
      ? "verifying"
      : "pending";
  const replyStatus = replyDone
    ? "completed"
    : action === "reply"
      ? "verifying"
      : "pending";

  const walletAddress = progress?.tasks.wallet.address ?? null;
  const walletFirstTx = formatDate(
    progress?.tasks.wallet.firstTxAt ?? null,
  );
  const walletAge = progress?.tasks.wallet.ageYears ?? null;

  return (
    <section
      id="quests"
      className="relative overflow-hidden border-b-[3px] border-paper/15 py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Sticker tone="violet">The ring · live</Sticker>
            <h2 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.84]">
              YOUR QUESTS
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-paper/55">
            Wallet age is judged on the server via Etherscan. Task checks are
            server-side too — the browser is never the judge.
          </p>
        </div>

        <div className="mt-10">
          {!auth.configured ? (
            <SetupRequiredCard />
          ) : !auth.ready ? (
            <GateCheckingCard
              title="Waking the gatekeeper"
              message="Loading your Privy session."
            />
          ) : !auth.authenticated || !auth.twitter ? (
            <EmptyRingCard />
          ) : (
            <div className="space-y-5">
              <ProfileCard />

              {quest.gate === "loading" && (
                <GateCheckingCard
                  title="Opening the gate"
                  message="Checking your saved wallet state."
                />
              )}

              {quest.gate === "error" && (
                <GateErrorCard
                  message={
                    quest.gateError ??
                    "The gate state could not be loaded. Try again."
                  }
                  onRetry={() => void quest.loadGate()}
                />
              )}

              {(quest.gate === "wallet_required" ||
                quest.gate === "ineligible") && (
                <WalletGateCard
                  mode={
                    quest.gate === "ineligible" ? "ineligible" : "required"
                  }
                  reason={
                    quest.gate === "ineligible" &&
                    (quest.gateReason === "wallet_too_young" ||
                      quest.gateReason === "wallet_no_history")
                      ? quest.gateReason
                      : null
                  }
                  message={
                    quest.gateMessage ??
                    "Submit an EVM wallet older than 3 years to enter."
                  }
                  wallet={quest.walletAttempt}
                  minAgeYears={
                    quest.walletAttempt?.minAgeYears ?? minAgeYears
                  }
                  busy={quest.checkingWallet}
                  error={
                    quest.actionErrorScope === "wallet"
                      ? quest.actionError
                      : null
                  }
                  onSubmit={quest.checkWallet}
                />
              )}

              {quest.gate === "eligible" && progress ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 border-[3px] border-mint bg-mint/10 p-4 shadow-hard-sm">
                    <Sticker tone="mint" className="-rotate-2">
                      <Check aria-hidden="true" className="size-3" />
                      eligible
                    </Sticker>
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-paper/75">
                      {quest.gateMessage ??
                        "Wallet age verified. The gate is open."}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/40">
                      min age: {minAgeYears} yrs
                    </span>
                  </div>

                  <ProgressBar
                    completed={progress.completedCount}
                    total={progress.totalCount}
                    percent={progress.percent}
                  />

                  {quest.actionError &&
                  quest.actionErrorScope !== "wallet" ? (
                    <InlineAlert tone="error" title="Action failed">
                      {quest.actionError}
                    </InlineAlert>
                  ) : null}

                  {quest.notice ? (
                    <InlineAlert tone="success" title="Progress saved">
                      {quest.notice}
                    </InlineAlert>
                  ) : null}

                  {progress.allDone ? (
                    <SuccessState progress={progress} />
                  ) : (
                    <div className="space-y-4">
                      <TaskCard
                        index="01"
                        title={`Wallet older than ${minAgeYears} years`}
                        description="The gate read this wallet's first Ethereum transaction through Etherscan. The wallet is now locked to your account and cannot be changed."
                        status="completed"
                      >
                        {walletAddress ? (
                          <div className="w-full border-[3px] border-mint/40 bg-void p-3">
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-mint">
                              wallet on file
                            </p>
                            <p className="mt-1.5 break-all font-mono text-sm text-paper">
                              {walletAddress}
                            </p>
                            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/45">
                              <CalendarClock
                                aria-hidden="true"
                                className="size-3.5"
                              />
                              first Ethereum tx {walletFirstTx ?? "unknown"}
                              {walletAge !== null
                                ? ` · ${walletAge} years old`
                                : ""}
                            </p>
                          </div>
                        ) : null}
                      </TaskCard>

                      <TaskCard
                        index="02"
                        title={`Follow @${LINKS.SUMO_TWITTER_USERNAME}`}
                        description="Follow SUMO on X. This is checked against the exact X account you logged in with, not a screenshot."
                        status={followStatus}
                      >
                        <ButtonLink
                          href={LINKS.SUMO_TWITTER_PROFILE}
                          target="_blank"
                          rel="noopener noreferrer"
                          tone="paper"
                          size="sm"
                        >
                          Open profile
                          <ExternalLink
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        </ButtonLink>
                        {followDone ? (
                          <p className="flex items-center gap-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mint">
                            <Check aria-hidden="true" className="size-4" />
                            follow verified
                          </p>
                        ) : (
                          <Button
                            type="button"
                            tone="mint"
                            size="sm"
                            onClick={() => void quest.verify("follow")}
                            disabled={action !== null}
                            aria-busy={
                              action === "follow" ? true : undefined
                            }
                          >
                            {action === "follow" ? (
                              <>
                                <Spinner label="Verifying follow" />
                                Verifying
                              </>
                            ) : (
                              <>
                                <ShieldCheck
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                Verify follow
                              </>
                            )}
                          </Button>
                        )}
                      </TaskCard>

                      <TaskCard
                        index="03"
                        title="Reply to the last post"
                        description="Drop one reply under the latest SUMO post. One reply is enough — the check runs against your logged-in X account."
                        status={replyStatus}
                      >
                        <ButtonLink
                          href={LINKS.SUMO_LAST_POST}
                          target="_blank"
                          rel="noopener noreferrer"
                          tone="paper"
                          size="sm"
                        >
                          Open last post
                          <ExternalLink
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        </ButtonLink>
                        {replyDone ? (
                          <p className="flex items-center gap-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mint">
                            <Check aria-hidden="true" className="size-4" />
                            reply verified
                          </p>
                        ) : (
                          <Button
                            type="button"
                            tone="mint"
                            size="sm"
                            onClick={() => void quest.verify("reply")}
                            disabled={action !== null}
                            aria-busy={
                              action === "reply" ? true : undefined
                            }
                          >
                            {action === "reply" ? (
                              <>
                                <Spinner label="Verifying reply" />
                                Verifying
                              </>
                            ) : (
                              <>
                                <ShieldCheck
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                Verify reply
                              </>
                            )}
                          </Button>
                        )}
                      </TaskCard>

                      <p className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-paper/30">
                        <span
                          aria-hidden="true"
                          className="size-1.5 bg-violet"
                        />
                        verification mode: {progress.verifyMode}
                        {progress.verifyMode === "mock"
                          ? " — follow/reply checks pass after a 2s mock delay (MVP)"
                          : " — live X API checks"}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyRingCard() {
  return (
    <div className="relative overflow-hidden border-[3px] border-paper/25 bg-deep p-6 shadow-hard sm:p-10">
      <Lock
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-56 text-paper/[0.04]"
        strokeWidth={1}
      />

      <Sticker tone="outline">No X linked</Sticker>
      <h3 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.85]">
        THE RING IS EMPTY.
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/60">
        Connect X to start. After that, prove one EVM wallet older than 3 years
        to open the board. No email, no password, no seed phrase.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ConnectButton size="md" />
        <ButtonLink
          href={LINKS.SUMO_TWITTER_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          tone="outline"
          size="md"
        >
          Check the profile
          <ExternalLink aria-hidden="true" className="size-4" />
        </ButtonLink>
        <Button
          type="button"
          tone="outline"
          size="md"
          onClick={() => window.location.reload()}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Refresh
        </Button>
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-paper/35">
        One account per human · one wallet per account
      </p>
    </div>
  );
}
