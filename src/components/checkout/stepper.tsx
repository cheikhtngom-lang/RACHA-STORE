import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const step = i + 1;
        const state = step < current ? "done" : step === current ? "active" : "upcoming";
        return (
          <div key={label} className="flex items-center flex-1 last:flex-initial">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors",
                  state === "done" && "bg-ink text-cream",
                  state === "active" && "bg-gold text-ink-dark",
                  state === "upcoming" && "border border-line text-stone-light"
                )}
              >
                {state === "done" ? <Check size={14} /> : step}
              </div>
              <span
                className={cn(
                  "font-sans-wide text-[0.68rem] uppercase hidden sm:inline",
                  state === "upcoming" ? "text-stone-light" : "text-ink"
                )}
              >
                {label}
              </span>
            </div>
            {step < steps.length && (
              <div className={cn("h-px flex-1 mx-4", state === "done" ? "bg-ink" : "bg-line")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
