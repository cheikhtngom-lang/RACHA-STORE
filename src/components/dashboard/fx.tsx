"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Effets des tableaux de bord (administration, Mon compte), inspirés de
// reactbits.dev. Les styles sont dans globals.css (.dash-card, .fx-*).

// Suit le pointeur pour le halo et le filet lumineux de .fx-spotlight.
function trackPointer(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

export function SpotlightCard({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn("dash-card fx-spotlight block", className);
  return href ? (
    <Link href={href} onPointerMove={trackPointer} className={cn(classes, "group outline-none")}>
      {children}
    </Link>
  ) : (
    <div onPointerMove={trackPointer} className={classes}>
      {children}
    </div>
  );
}

// Nombre qui défile de 0 à sa valeur au premier affichage (CountUp). Le
// lecteur d'écran n'entend que la valeur finale.
export function CountUp({
  value,
  format = (n: number) => String(Math.round(n)),
  duration = 1100,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let frame = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(frame);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Départ rapide, arrivée douce.
      setShown(t === 1 ? value : value * (1 - Math.pow(2, -10 * t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <>
      <span aria-hidden="true" className="tabular-nums">
        {format(shown)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

// Fond du haut de page : aurore qui dérive et trame de points.
export function AuroraBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden [mask-image:linear-gradient(#000_40%,transparent)]",
        className
      )}
    >
      <div className="fx-aurora" />
      <div className="fx-dots absolute inset-0" />
    </div>
  );
}

// Pastille d'icône des cartes.
export function IconBadge({ icon: Icon, tone = "gold" }: { icon: React.ElementType; tone?: "gold" | "muted" }) {
  return (
    <span
      className={cn(
        "h-10 w-10 shrink-0 rounded-[10px] flex items-center justify-center border",
        tone === "gold"
          ? "border-gold/30 bg-gold/10 text-gold-light shadow-[0_0_24px_-6px_rgb(201_161_94/0.45)]"
          : "border-line bg-sand text-stone"
      )}
    >
      <Icon size={18} strokeWidth={1.5} />
    </span>
  );
}
