import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardTone = "dark" | "paper" | "mint" | "alert";

const tones: Record<CardTone, string> = {
  dark: "border-paper/25 bg-deep text-paper shadow-hard",
  paper: "border-void bg-paper text-void shadow-hard-ink",
  mint: "border-mint bg-deep text-paper shadow-hard-violet",
  alert: "border-alert bg-deep text-paper shadow-hard-alert",
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

export function Card({ tone = "dark", className, ...props }: CardProps) {
  return (
    <div
      className={cn("border-[3px] p-5 sm:p-6", tones[tone], className)}
      {...props}
    />
  );
}
