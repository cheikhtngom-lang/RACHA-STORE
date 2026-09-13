import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  cta,
  light,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  cta?: { label: string; href: string };
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        align === "left" && "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn(align === "center" && "max-w-xl")}>
        {eyebrow && (
          <p className={cn("eyebrow mb-3", light ? "text-gold-light" : "text-gold")}>{eyebrow}</p>
        )}
        <h2 className={cn("font-display text-3xl sm:text-4xl", light ? "text-cream" : "text-ink")}>
          {title}
        </h2>
        {description && (
          <p className={cn("mt-3 text-sm leading-relaxed max-w-md", light ? "text-cream/70" : "text-stone")}>
            {description}
          </p>
        )}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className={cn(
            "group inline-flex items-center gap-2 font-sans-wide text-[0.7rem] uppercase shrink-0",
            light ? "text-cream" : "text-ink"
          )}
        >
          {cta.label}
          <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
