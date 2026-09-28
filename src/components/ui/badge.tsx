import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "gold" | "outline" | "sale";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-sans-wide text-[0.6rem] uppercase px-2.5 py-1",
        variant === "default" && "bg-ink text-cream",
        variant === "gold" && "bg-gold text-ink-dark",
        variant === "outline" && "border border-ink/30 text-ink",
        variant === "sale" && "bg-danger text-cream",
        className
      )}
    >
      {children}
    </span>
  );
}
