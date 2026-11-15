"use client";

import { Check, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Sticker } from "@/components/ui/sticker";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type TaskCardStatus =
  | "pending"
  | "verifying"
  | "completed"
  | "locked";

const frame: Record<TaskCardStatus, string> = {
  pending: "border-paper/25 bg-deep shadow-hard-sm",
  verifying: "border-violet bg-deep shadow-hard-violet",
  completed: "border-mint bg-deep shadow-hard-violet",
  locked: "border-paper/15 bg-deep/50",
};

export function TaskCard({
  index,
  title,
  description,
  status,
  children,
}: {
  index: string;
  title: string;
  description: string;
  status: TaskCardStatus;
  children?: ReactNode;
}) {
  const dim = status === "locked";

  return (
    <article
      className={cn(
        "relative border-[3px] p-5 transition-colors sm:p-6",
        frame[status],
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={cn(
            "font-display text-4xl leading-none",
            status === "completed"
              ? "text-mint"
              : dim
                ? "text-paper/20"
                : "text-paper/30",
          )}
        >
          {index}
        </span>
        <TaskStatus status={status} />
      </div>

      <h3
        className={cn(
          "mt-5 font-display text-2xl leading-tight sm:text-3xl",
          dim ? "text-paper/50" : "text-paper",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 max-w-xl text-sm leading-relaxed",
          dim ? "text-paper/40" : "text-paper/65",
        )}
      >
        {description}
      </p>

      {children ? (
        <div className="mt-5 flex flex-wrap items-start gap-2.5">
          {children}
        </div>
      ) : null}
    </article>
  );
}

function TaskStatus({ status }: { status: TaskCardStatus }) {
  if (status === "completed") {
    return (
      <Sticker tone="mint">
        <Check aria-hidden="true" className="size-3" />
        completed
      </Sticker>
    );
  }
  if (status === "verifying") {
    return (
      <Sticker tone="violet">
        <Spinner className="size-3" label="Verifying" />
        verifying
      </Sticker>
    );
  }
  if (status === "locked") {
    return (
      <Sticker tone="outline">
        <Lock aria-hidden="true" className="size-3" />
        locked
      </Sticker>
    );
  }
  return (
    <Sticker tone="outline" className="border-paper/50 text-paper">
      pending
    </Sticker>
  );
}
