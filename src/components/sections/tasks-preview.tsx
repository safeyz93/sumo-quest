import { Lock } from "lucide-react";
import { LINKS } from "@/config/links";
import { ButtonLink } from "@/components/ui/button";
import { Sticker } from "@/components/ui/sticker";

const tasks = [
  {
    number: "01",
    title: "Wallet older than 3 years",
    body: "Submit one EVM wallet. Etherscan checks its first Ethereum transaction; the gate opens only for wallets older than 3 years.",
    meta: "Unlocked at the gate",
  },
  {
    number: "02",
    title: `Follow @${LINKS.SUMO_TWITTER_USERNAME}`,
    body: "Follow the SUMO account on X. We check the follow, not the screenshot.",
    meta: "Requires: wallet gate",
  },
  {
    number: "03",
    title: "Reply to the last post",
    body: "Drop one reply under the latest SUMO post. One reply is enough to clear it.",
    meta: "Requires: wallet gate",
  },
];

export function TasksPreview() {
  return (
    <section
      id="board"
      className="relative overflow-hidden border-b-[3px] border-paper/15 py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-sunburst opacity-40"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Sticker tone="violet">The board</Sticker>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.84]">
              THREE LIFTS.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-paper/60">
            Everything is locked until your wallet clears the age gate. Connect
            once and the board opens in place.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {tasks.map((task) => (
            <article
              key={task.number}
              className="group relative flex flex-col border-[3px] border-paper/25 bg-deep p-6 shadow-hard-violet transition-[transform,border-color] duration-150 hover:-translate-y-1 hover:border-mint"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-4xl leading-none text-paper/25">
                  {task.number}
                </span>
                <Sticker tone="outline">
                  <Lock aria-hidden="true" className="size-3" />
                  locked
                </Sticker>
              </div>
              <h3 className="mt-8 font-display text-2xl leading-tight text-paper">
                {task.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">
                {task.body}
              </p>
              <p className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/40">
                {task.meta}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-paper/40">
            Connect X · prove the wallet · unlock the board
          </p>
          <ButtonLink href="#quests" tone="mint" size="md">
            Go to the quest board
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
