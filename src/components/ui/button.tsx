import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type ButtonTone =
  | "mint"
  | "paper"
  | "outline"
  | "violet"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 border-[3px] font-extrabold uppercase leading-none tracking-[0.05em] transition-[transform,box-shadow,background-color,color] duration-100 ease-out focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mint disabled:pointer-events-none disabled:opacity-50 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

const tones: Record<ButtonTone, string> = {
  mint: "border-void bg-mint text-void shadow-hard-violet hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg",
  paper:
    "border-void bg-paper text-void shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg-mint",
  outline:
    "border-paper bg-transparent text-paper shadow-hard-violet hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-paper/5 hover:shadow-hard-lg",
  violet:
    "border-void bg-violet text-void shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg",
  danger:
    "border-void bg-alert text-void shadow-hard-violet hover:-translate-x-0.5 hover:-translate-y-0.5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-[11px]",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base sm:px-8 sm:text-lg",
};

type StyleOptions = {
  tone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
};

export function buttonStyles({
  tone = "mint",
  size = "md",
  className,
}: StyleOptions = {}) {
  return cn(base, tones[tone], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleOptions;

export function Button({
  tone = "mint",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ tone, size, className })}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  StyleOptions;

export function ButtonLink({
  tone = "outline",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonStyles({ tone, size, className })} {...props} />
  );
}
