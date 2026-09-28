"use client";

import { arc } from "d3-shape";
import { formatPercent, useReveal } from "./theme";

const WIDTH = 220;
const THICKNESS = 16;

// Jauge demi-cercle pour un taux (0 à 100 %). La piste est la même teinte en
// plus clair, pour que l'état se lise sur toute la longueur.
export function Gauge({ ratio, color, label, detail }: { ratio: number; color: string; label: string; detail?: string }) {
  const progress = useReveal();
  const r = WIDTH / 2;
  const clamped = Math.min(1, Math.max(0, ratio));
  const shape = arc().innerRadius(r - THICKNESS).outerRadius(r).cornerRadius(THICKNESS / 2);
  const start = -Math.PI / 2;
  const track = shape({ startAngle: start, endAngle: Math.PI / 2, innerRadius: r - THICKNESS, outerRadius: r }) ?? "";
  const value =
    clamped > 0
      ? (shape({ startAngle: start, endAngle: start + Math.PI * clamped * progress, innerRadius: r - THICKNESS, outerRadius: r }) ?? "")
      : "";

  return (
    <div className="flex flex-col items-center text-center">
      <svg width={WIDTH} height={r + 4} role="img" aria-label={`${label} : ${formatPercent(clamped)}`}>
        <g transform={`translate(${r},${r})`}>
          <path d={track} fill={color} opacity={0.15} />
          {value && <path d={value} fill={color} />}
        </g>
      </svg>
      <p className="-mt-12 text-3xl font-semibold text-ink">{formatPercent(clamped)}</p>
      <p className="text-sm text-ink mt-3">{label}</p>
      {detail && <p className="text-xs text-stone-light mt-1">{detail}</p>}
    </div>
  );
}
