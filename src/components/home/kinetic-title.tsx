"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Les trois offres mises en avant sur l'accueil. Chaque ligne passe en or à
// tour de rôle et sa phrase s'affiche en dessous.
const LINES = [
  {
    label: "Friperie",
    caption: "Vêtements de seconde main en pièce unique : robes, chemises, vestes et pantalons.",
  },
  {
    label: "Fins de série",
    caption: "Les derniers articles d'une série, vendus à prix réduit jusqu'à épuisement du stock.",
  },
  {
    label: "Tenues africaines",
    caption: "Boubous, ensembles et robes en wax, bazin riche et tissus africains.",
  },
];

const ROTATE_MS = 3000;
// Entrée : décalage entre deux lettres d'une ligne, puis entre deux lignes.
const LETTER_DELAY_MS = 30;
const LINE_DELAY_MS = 120;

// Chaque mot est un masque : ses lettres montent depuis le bas (.hero-letter
// dans globals.css). Les espaces restent du texte, le titre peut donc passer
// à la ligne entre deux mots sur téléphone.
function AnimatedLine({ text, lineIndex }: { text: string; lineIndex: number }) {
  let letterIndex = 0;
  return text.split(" ").map((word, w) => (
    <span key={w}>
      {w > 0 && " "}
      <span className="inline-block overflow-hidden align-bottom pt-[0.12em]">
        {Array.from(word).map((letter, l) => (
          <span
            key={l}
            className="hero-letter"
            style={{ animationDelay: `${lineIndex * LINE_DELAY_MS + letterIndex++ * LETTER_DELAY_MS}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  ));
}

// `children` (boutons) est dans la zone qui met la rotation en pause : un
// visiteur au clavier l'arrête en atteignant les boutons.
export function KineticTitle({ children }: { children?: ReactNode }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % LINES.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 className="font-sans font-semibold uppercase tracking-[-0.01em] leading-[1.02] text-[2.6rem] sm:text-6xl lg:text-[clamp(3.25rem,4.4vw,5rem)]">
        <span className="sr-only">Friperie, fins de série et tenues africaines</span>
        {LINES.map((line, i) => (
          <span
            key={line.label}
            aria-hidden
            className={cn("block transition-colors duration-500 ease-out", i === active ? "text-gold-light" : "text-cream/50 lg:text-cream/40")}
          >
            <AnimatedLine text={line.label} lineIndex={i} />
          </span>
        ))}
      </h1>

      {/* Les trois phrases occupent la même case : la hauteur ne bouge pas
          quand l'une remplace l'autre. Toutes restent lisibles par un lecteur d'écran. */}
      <div className="mt-7 grid max-w-md">
        {LINES.map((line, i) => (
          <p
            key={line.label}
            className={cn(
              "[grid-area:1/1] text-cream/85 text-sm sm:text-base leading-relaxed transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
              i === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1.5 motion-reduce:translate-y-0"
            )}
          >
            {line.caption}
          </p>
        ))}
      </div>

      {children}
    </div>
  );
}
