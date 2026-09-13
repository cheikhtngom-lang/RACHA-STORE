import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex flex-col items-center leading-none select-none",
        className
      )}
      aria-label="Racha Store — Accueil"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-current mb-1">
        <svg viewBox="0 0 24 24" className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5" fill="currentColor">
          <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
        </svg>
        <span className="font-display text-lg">R</span>
      </span>
      <span
        className={cn(
          "font-display text-[1.05rem] tracking-[0.18em]",
          light ? "text-cream" : "text-ink"
        )}
      >
        RACHA
      </span>
      <span className="font-sans-wide text-[0.5rem] tracking-[0.4em] -mt-0.5 opacity-80">
        STORE
      </span>
    </Link>
  );
}
