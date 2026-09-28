"use client";

import { useState } from "react";
import { arc, pie } from "d3-shape";
import { INK, formatPercent, useReveal } from "./theme";

export type RingSegment = { key: string; label: string; value: number; color: string };

const SIZE = 184;
const THICKNESS = 16;

// Anneau (style Bklit) : épaisseur constante, bouts arrondis, 2 px d'écart
// entre les parts. Survoler une part ou une ligne de la légende estompe le
// reste ; le centre affiche alors cette part. Au plus 5 parts + « Autres ».
export function RingChart({
  segments,
  totalLabel,
  formatValue,
}: {
  segments: RingSegment[];
  totalLabel: string;
  formatValue: (n: number) => string;
}) {
  const progress = useReveal();
  const [active, setActive] = useState<string | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const outer = SIZE / 2;

  const arcs = pie<RingSegment>()
    .value((s) => s.value)
    .sort(null)
    .startAngle(0)
    .endAngle(Math.PI * 2 * progress)
    .padAngle(segments.length > 1 ? 2 / (outer - THICKNESS / 2) : 0)(segments.filter((s) => s.value > 0));
  const shape = arc<(typeof arcs)[number]>()
    .innerRadius(outer - THICKNESS)
    .outerRadius(outer)
    .cornerRadius(THICKNESS / 2);

  const focused = segments.find((s) => s.key === active);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
      <div className="relative shrink-0 self-center" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} role="img" aria-label={`${totalLabel} : ${formatValue(total)}`}>
          <g transform={`translate(${outer},${outer})`}>
            {total === 0 ? (
              <circle r={outer - THICKNESS / 2} fill="none" stroke={INK.grid} strokeWidth={THICKNESS} opacity={0.4} />
            ) : (
              arcs.map((a) => (
                <path
                  key={a.data.key}
                  d={shape(a) ?? ""}
                  fill={a.data.color}
                  opacity={active === null || active === a.data.key ? 1 : 0.3}
                  style={{ transition: "opacity 150ms" }}
                  onPointerEnter={() => setActive(a.data.key)}
                  onPointerLeave={() => setActive(null)}
                />
              ))
            )}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <p className="text-[0.95rem] font-semibold text-ink leading-tight">{formatValue(focused ? focused.value : total)}</p>
          <p className="text-xs text-stone-light mt-1 leading-snug">
            {focused ? `${focused.label} · ${formatPercent(total > 0 ? focused.value / total : 0)}` : totalLabel}
          </p>
        </div>
      </div>

      <ul className="flex-1 min-w-0 flex flex-col gap-1" onMouseLeave={() => setActive(null)}>
        {segments.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              onMouseEnter={() => setActive(s.key)}
              onFocus={() => setActive(s.key)}
              onBlur={() => setActive(null)}
              className="w-full flex items-center gap-3 py-1.5 text-left text-sm transition-opacity duration-150 cursor-default"
              style={{ opacity: active === null || active === s.key ? 1 : 0.4 }}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: s.color }} />
              <span className="flex-1 min-w-0 truncate text-ink">{s.label}</span>
              <span className="text-stone-light tabular-nums">{formatPercent(total > 0 ? s.value / total : 0)}</span>
              <span className="w-24 text-right text-ink tabular-nums">{formatValue(s.value)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
