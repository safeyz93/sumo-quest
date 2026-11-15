import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Small helper so copy stays consistent when a value can be null. */
export function orDash(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "—";
}
