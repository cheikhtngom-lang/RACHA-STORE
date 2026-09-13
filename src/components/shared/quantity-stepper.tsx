import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center border border-line h-11 w-32 justify-between", className)}>
      <button
        type="button"
        aria-label="Diminuer la quantité"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-full w-9 flex items-center justify-center text-ink hover:text-gold disabled:opacity-30 cursor-pointer"
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className="text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Augmenter la quantité"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-full w-9 flex items-center justify-center text-ink hover:text-gold disabled:opacity-30 cursor-pointer"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
