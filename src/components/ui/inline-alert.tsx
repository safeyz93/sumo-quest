import { AlertTriangle, Check, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InlineAlertTone = "error" | "success" | "info";

const tones: Record<
  InlineAlertTone,
  { box: string; icon: typeof AlertTriangle; iconClass: string }
> = {
  error: {
    box: "border-alert bg-alert/10 text-paper shadow-hard-alert",
    icon: AlertTriangle,
    iconClass: "text-alert",
  },
  success: {
    box: "border-mint bg-mint/10 text-paper shadow-hard",
    icon: Check,
    iconClass: "text-mint",
  },
  info: {
    box: "border-violet bg-violet/10 text-paper shadow-hard-violet",
    icon: Info,
    iconClass: "text-violet",
  },
};

export function InlineAlert({
  tone,
  title,
  children,
  className,
}: {
  tone: InlineAlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const config = tones[tone];
  const Icon = config.icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-3 border-[3px] p-4",
        config.box,
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-5 shrink-0", config.iconClass)}
      />
      <div className="min-w-0 text-sm leading-relaxed">
        {title ? (
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">
            {title}
          </p>
        ) : null}
        <div className={cn(title && "mt-1", "text-paper/80")}>{children}</div>
      </div>
    </div>
  );
}
