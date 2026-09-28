"use client";

import { useState } from "react";
import { useReveal } from "./theme";

export type BarItem = { key: string; label: string; value: number; detail?: string };

// Classement en barres horizontales : une seule série, donc une seule couleur
// pour toutes les barres (la longueur porte la valeur, pas la teinte). La valeur
// est écrite en clair ; survoler une ligne estompe les autres.
export function BarList({
  items,
  color,
  formatValue,
}: {
  items: BarItem[];
  color: string;
  formatValue: (n: number) => string;
}) {
  const progress = useReveal();
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(0, ...items.map((i) => i.value));

  return (
    <ul className="flex flex-col gap-3.5" onMouseLeave={() => setActive(null)}>
      {items.map((item) => (
        <li
          key={item.key}
          onMouseEnter={() => setActive(item.key)}
          className="transition-opacity duration-150"
          style={{ opacity: active === null || active === item.key ? 1 : 0.4 }}
        >
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-ink truncate">{item.label}</span>
            <span className="shrink-0 text-ink tabular-nums">{formatValue(item.value)}</span>
          </div>
          {item.detail && <p className="text-xs text-stone-light mt-0.5">{item.detail}</p>}
          <div className="mt-1.5 h-2">
            <div
              className="h-2 rounded-r-[4px]"
              style={{
                width: `${max > 0 ? Math.max(1.5, (item.value / max) * 100) * progress : 0}%`,
                background: color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
