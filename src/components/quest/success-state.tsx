import { Check, ExternalLink } from "lucide-react";
import { LINKS } from "@/config/links";
import { ButtonLink } from "@/components/ui/button";
import { Sticker } from "@/components/ui/sticker";
import type { QuestProgress } from "@/lib/quest-types";

function formatDate(iso: string | null): string {
  if (!iso) return "unknown";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function SummaryRow({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-deep p-4">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-paper/45">
        {label}
      </dt>
      <dd
        className={
          accent
            ? "mt-2 break-all font-mono text-sm text-mint"
            : "mt-2 break-all font-mono text-sm text-paper"
        }
      >
        {value}
      </dd>
      {sub ? (
        <p className="mt-1.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-paper/40">
          {sub}
        </p>
      ) : null}
    </div>
  );
}

export function SuccessState({ progress }: { progress: QuestProgress }) {
  const username = progress.twitter.username
    ? `@${progress.twitter.username}`
    : "your X account";
  const wallet = progress.tasks.wallet.address ?? "—";
  const walletSub =
    progress.tasks.wallet.firstTxAt && progress.tasks.wallet.ageYears !== null
      ? `first tx ${formatDate(
          progress.tasks.wallet.firstTxAt,
        )} · ${progress.tasks.wallet.ageYears} years`
      : undefined;

  return (
    <div className="relative overflow-hidden border-[3px] border-mint bg-deep p-6 shadow-[8px_8px_0_0_#836FFF] sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border-[3px] border-dashed border-mint/20 animate-spin-slow motion-reduce:animate-none"
      />

      <Sticker tone="mint" className="inline-flex -rotate-3 animate-stamp">
        <Check aria-hidden="true" className="size-3" />
        all lifts cleared
      </Sticker>

      <h3 className="mt-6 font-display text-[clamp(3rem,10vw,7rem)] leading-[0.82] text-paper [text-shadow:5px_5px_0_#15f5ba]">
        YOU&apos;RE IN!
      </h3>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-paper/70">
        Three lifts. Zero shortcuts. {username} is on the list — the wallet is
        locked to this account and cannot be changed.
      </p>

      <dl className="mt-8 grid gap-px border-[3px] border-paper/25 bg-paper/20 sm:grid-cols-3">
        <SummaryRow label="X account" value={username} />
        <SummaryRow label="Wallet" value={wallet} sub={walletSub} accent />
        <SummaryRow
          label="Status"
          value={`completed · ${progress.completedCount}/${progress.totalCount}`}
          sub={`min wallet age ${progress.eligibility.minAgeYears} years`}
        />
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <ButtonLink
          href={LINKS.SUMO_TWITTER_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          tone="paper"
          size="md"
        >
          Follow the drop
          <ExternalLink aria-hidden="true" className="size-4" />
        </ButtonLink>
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-paper/35">
          Nothing else to do · keep notifications on
        </p>
      </div>
    </div>
  );
}
