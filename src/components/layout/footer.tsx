import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-[3px] border-paper/15 bg-deep">
      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/sumo-logo.png"
                alt=""
                width={559}
                height={433}
                className="h-10 w-auto shrink-0 drop-shadow-[3px_3px_0_#836FFF]"
              />
              <span className="font-display text-2xl leading-none">SUMO</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/55">
              Heavyweight quests for wallets older than 3 years. Three tasks,
              one wallet, zero mercy.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-paper/35">
              Season 01 · Mawashi Run
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t-[3px] border-paper/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-paper/35">
            © {new Date().getFullYear()} SUMO · Not affiliated with X Corp. ·
            No financial advice.
          </p>
          <p className="max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-paper/35">
            Wallet age is checked server-side via Etherscan. Follow/reply
            verification runs in mock mode in this MVP.
          </p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[2vw] select-none whitespace-nowrap text-center font-display text-[clamp(5rem,20vw,17rem)] leading-[0.7] text-paper/[0.04]"
      >
        SUMO
      </p>
    </footer>
  );
}
