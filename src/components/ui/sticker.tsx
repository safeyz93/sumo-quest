import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type StickerTone = "mint" | "violet" | "paper" | "alert" | "outline";

const tones: Record<StickerTone, string> = {
  mint: "border-mint bg-mint/10 text-mint",
  violet: "border-violet bg-violet/15 text-paper",
  paper: "border-paper bg-paper text-void",
  alert: "border-alert bg-alert/10 text-alert",
  outline: "border-paper/40 bg-transparent text-paper/70",
};

type StickerProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StickerTone;
};

/** Small mono caps label used as tape / stamp / badge. */
export function Sticker({
  tone = "mint",
  className,
  children,
  ...props
}: StickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.18em]",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
