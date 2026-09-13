import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Price({
  amount,
  compareAt,
  size = "md",
  className,
}: {
  amount: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "tabular-nums",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-2xl font-display"
        )}
      >
        {formatPrice(amount)}
      </span>
      {compareAt && compareAt > amount && (
        <span className="text-stone-light line-through text-xs tabular-nums">
          {formatPrice(compareAt)}
        </span>
      )}
    </div>
  );
}
