import { cn } from "@/lib/utils";

/** Mint square rotated 45° — used as the marquee separator. */
function Diamond({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-3 inline-block size-1.5 shrink-0 rotate-45 bg-mint", className)}
    />
  );
}

function Row({ items, copy }: { items: string[]; copy: number }) {
  return (
    <div aria-hidden={copy > 0} className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <span key={`${copy}-${index}`} className="flex items-center">
          <span className="whitespace-nowrap px-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-paper/70 sm:text-[11px]">
            {item}
          </span>
          <Diamond />
        </span>
      ))}
    </div>
  );
}

/**
 * Infinite ticker. Decorative only — it is aria-hidden and pauses on hover.
 * Duplicated content + translateX(-50%) makes the loop seamless.
 */
export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden border-y-[3px] border-paper/15 bg-void py-2.5",
        className,
      )}
    >
      <div className="marquee-mask flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        <Row items={items} copy={0} />
        <Row items={items} copy={1} />
      </div>
    </div>
  );
}
