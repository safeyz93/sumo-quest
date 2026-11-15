"use client";

import { ArrowUpRight, LogOut } from "lucide-react";
import Image from "next/image";
import { LINKS } from "@/config/links";
import { useSumoAuth } from "@/components/providers/privy-provider";
import { ConnectButton } from "@/components/quest/connect-button";
import { Avatar } from "@/components/ui/avatar";

const navLink =
  "font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-paper/60 transition-colors hover:text-mint focus-visible:text-mint";

export function Navbar() {
  const { ready, authenticated, twitter, disconnect } = useSumoAuth();
  const isSignedIn = ready && authenticated && twitter !== null;

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-paper/15 bg-void/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          aria-label="SUMO home"
          className="group flex items-center gap-2.5"
        >
          <Image
            src="/sumo-logo.png"
            alt=""
            width={559}
            height={433}
            priority
            className="h-10 w-auto shrink-0 drop-shadow-[3px_3px_0_#836FFF] transition-transform duration-150 group-hover:-rotate-6"
          />
          <span className="font-display text-2xl leading-none tracking-wide">
            SUMO
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <a href="#quests" className={navLink}>
            The board
          </a>
          <a
            href={LINKS.SUMO_TWITTER_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className={`${navLink} inline-flex items-center gap-1`}
          >
            X profile
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {isSignedIn && twitter ? (
            <>
              <a
                href="#quests"
                title={twitter.username ? `@${twitter.username}` : "Your quests"}
                aria-label={
                  twitter.username
                    ? `Your quests as @${twitter.username}`
                    : "Your quests"
                }
                className="flex size-11 items-center justify-center rounded-[10%] border-2 border-paper/25 bg-deep transition-colors hover:border-mint"
              >
                <Avatar
                  src={twitter.avatarUrl}
                  name={twitter.name}
                  size={28}
                />
              </a>
              <button
                type="button"
                onClick={() => void disconnect()}
                title="Disconnect X account"
                aria-label="Disconnect X account"
                className="grid size-9 place-items-center border-2 border-paper/30 text-paper/60 transition-colors hover:border-alert hover:text-alert focus-visible:border-alert"
              >
                <LogOut aria-hidden="true" className="size-4" />
              </button>
            </>
          ) : (
            <ConnectButton size="sm" />
          )}
        </div>
      </div>
    </header>
  );
}
