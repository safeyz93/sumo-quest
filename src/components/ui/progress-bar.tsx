import { cn } from "@/lib/utils";

export function ProgressBar({
  completed,
  total = 3,
  percent,
  className,
}: {
  completed: number;
  total?: number;
  percent: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-[3px] border-paper/25 bg-deep p-4 shadow-hard-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
        <span className="text-paper/55">Quest progress</span>
        <span className="text-paper">
          {completed} / {total} cleared
          <span className="mx-2 text-mint">·</span>
          {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Quest progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        className="mt-3 flex gap-1.5"
      >
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "h-4 flex-1 border-2 border-void transition-colors duration-300",
              index < completed ? "bg-mint" : "bg-paper/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}
