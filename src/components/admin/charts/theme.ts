"use client";

import { useEffect, useRef, useState } from "react";

// Palette des graphiques, validée sur la surface sombre des cartes (#151b17,
// .theme-dashboard) par le script de contrôle dataviz : luminosité,
// saturation, séparation pour les daltonismes (ordre cyclique, car le dernier
// segment d'un anneau touche le premier) et contraste >= 3:1. Mêmes teintes
// que l'ancienne palette sur fond crème, éclaircies. L'ordre fait partie de
// la validation : ne pas le changer.
export const SERIES = ["#10a58a", "#c0801c", "#5b8fd0", "#d0606f", "#9a82d6"] as const;
// « Autres » et « Produits supprimés » : neutre, jamais une couleur de série.
export const OTHER = "#7d7a70";

// Une couleur par grandeur, la même sur toute la page.
export const MEASURE = {
  revenue: SERIES[0],
  orders: SERIES[1],
  visits: SERIES[2],
} as const;

export const INK = {
  primary: "#f1ece0",
  muted: "#9a958a",
  grid: "#3a443e",
  surface: "#151b17",
  good: "#4cc393",
  bad: "#e8828f",
} as const;

const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("fr-FR");
const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

export const formatCompact = (n: number) => compact.format(n);
export const formatInt = (n: number) => integer.format(n);
export const formatPercent = (ratio: number) => percent.format(ratio);

// Largeur disponible, suivie au redimensionnement : les graphiques sont en SVG
// dessinés au pixel près, sans étirement.
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

// Apparition des tracés (0 → 1 en 0,7 s), une seule fois au premier affichage.
// Désactivée si le visiteur a demandé moins d'animations.
export function useReveal() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return progress;
}

// Graduations de l'axe des valeurs. Une série toute à zéro, ou de petits
// nombres entiers, donne un axe 0 → 4 en entiers plutôt que 0 → 1 par 0,1.
export function valueTicks(max: number, integerOnly: boolean) {
  const top = integerOnly ? Math.max(4, max) : max > 0 ? max : 4;
  const step = niceStep(top / 4);
  const niceTop = Math.ceil(top / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceTop + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { top: niceTop, ticks: integerOnly || max === 0 ? ticks.filter(Number.isInteger) : ticks };
}

function niceStep(raw: number) {
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit = raw / power;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10;
  return Math.max(nice * power, 1e-9);
}
