import Image from "next/image";

export function HeroMascotCard() {
  return (
    <div className="relative mx-auto w-full max-w-md px-1">
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-full border-[3px] border-dashed border-mint/20"
      />

      <div className="relative -rotate-2 border-[3px] border-paper bg-deep p-4 shadow-hard-lg transition-transform duration-300 ease-out hover:rotate-0 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b-[3px] border-paper/20 pb-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-paper/60">
            SUMO-01 / gatekeeper
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-mint">
            <span
              aria-hidden="true"
              className="size-1.5 animate-pulse-dot bg-mint"
            />
            live
          </span>
        </div>

        <div className="animate-float-slow py-3">
          <Image
            src="/sumo-chibi.png"
            alt="SUMO-01, the chibi sumo gatekeeper sticker"
            width={507}
            height={503}
            priority
            className="mx-auto h-auto w-full max-w-[19rem] select-none"
            sizes="(min-width: 1024px) 304px, 80vw"
          />
        </div>

        <div className="flex items-end justify-between gap-3 border-t-[3px] border-paper/20 pt-4">
          <div>
            <p className="font-display text-2xl leading-none">MAWASHI PASS</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-paper/45">
              Access: wallet age 3+ years
            </p>
          </div>
          <span className="shrink-0 rotate-3 border-[3px] border-mint px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-mint">
            Gate / 01
          </span>
        </div>
      </div>

      <span className="absolute -left-5 top-12 hidden -rotate-6 border-[3px] border-void bg-mint px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-void shadow-hard-violet sm:block">
        Etherscan-checked
      </span>
      <span className="absolute -right-3 bottom-20 hidden rotate-6 border-[3px] border-void bg-alert px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-void shadow-hard-paper sm:block">
        Too young? No entry.
      </span>
      <span
        aria-hidden="true"
        className="vertical-jp absolute -right-1 top-1/2 hidden text-lg text-paper/30 lg:block"
      >
        相撲
      </span>
    </div>
  );
}
