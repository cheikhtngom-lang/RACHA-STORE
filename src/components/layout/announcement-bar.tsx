"use client";

import { useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import type { Announcement } from "@/lib/announcements";
import { cn } from "@/lib/utils";

// Chaque moitié de la bande doit être plus large que les plus grands écrans
// (environ 8 px par caractère) : les annonces y sont répétées au besoin.
const MIN_CHARS = 340;
// Vitesse constante, quelle que soit la longueur des annonces (environ 45 px/s).
const SECONDS_PER_CHAR = 0.18;
// Espace occupé par un séparateur, en caractères.
const SEPARATOR_CHARS = 6;

// Couleurs fixes (et non cream / ink) : le bandeau reste le même dans
// l'aperçu de l'administration, qui est en thème sombre.
const TEXT = "text-[#faf8f3]";

// Bandeau qui défile en haut de la boutique. S'arrête au survol, au clavier
// et avec le bouton pause ; immobile si le visiteur a demandé moins d'animations.
export function AnnouncementBar({ announcements }: { announcements: Announcement[] }) {
  const [paused, setPaused] = useState(false);
  if (announcements.length === 0) return null;

  const chars = announcements.reduce((n, a) => n + a.message.length + SEPARATOR_CHARS, 0);
  const repeat = Math.max(1, Math.ceil(MIN_CHARS / chars));
  const loop = Array.from({ length: repeat }, () => announcements).flat();
  const duration = `${Math.round(chars * repeat * SECONDS_PER_CHAR)}s`;

  return (
    <div role="region" aria-label="Annonces" className={cn("relative h-9 overflow-hidden bg-ink-dark", TEXT)}>
      <div
        className={cn("marquee flex h-full w-max items-center motion-reduce:px-5 sm:motion-reduce:px-8", paused && "marquee-paused")}
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        {/* Deux copies identiques : la bande recule d'une copie puis recommence, sans à-coup. */}
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 ? true : undefined}>
            {loop.map((a, i) => {
              // Seule la première occurrence de chaque annonce est lue et atteignable au clavier.
              const duplicate = copy === 1 || i >= announcements.length;
              return (
                <li key={`${a.id}-${i}`} className="flex items-center" aria-hidden={duplicate && copy === 0 ? true : undefined}>
                  <AnnouncementText announcement={a} focusable={!duplicate} />
                  <span aria-hidden="true" className="mx-7 h-1 w-1 rounded-full bg-gold" />
                </li>
              );
            })}
          </ul>
        ))}
      </div>

      <div aria-hidden="true" className="motion-reduce:hidden pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-ink-dark to-transparent" />
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Relancer le défilement des annonces" : "Mettre les annonces en pause"}
        aria-pressed={paused}
        className="motion-reduce:hidden absolute inset-y-0 right-0 flex items-center pl-10 pr-3 sm:pr-5 bg-gradient-to-l from-ink-dark from-60% to-transparent text-[#faf8f3]/55 hover:text-[#faf8f3] transition-colors cursor-pointer"
      >
        {paused ? <Play size={12} fill="currentColor" strokeWidth={0} /> : <Pause size={12} fill="currentColor" strokeWidth={0} />}
      </button>
    </div>
  );
}

function AnnouncementText({ announcement, focusable }: { announcement: Announcement; focusable: boolean }) {
  const className = "whitespace-nowrap text-[0.68rem] font-sans-wide uppercase tracking-[0.15em]";
  const url = announcement.link_url;
  if (!url) return <span className={className}>{announcement.message}</span>;

  const linkClass = cn(className, "underline decoration-gold/60 underline-offset-4 hover:text-gold-light transition-colors");
  const tabIndex = focusable ? undefined : -1;
  return url.startsWith("/") ? (
    <Link href={url} className={linkClass} tabIndex={tabIndex}>
      {announcement.message}
    </Link>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass} tabIndex={tabIndex}>
      {announcement.message}
    </a>
  );
}
