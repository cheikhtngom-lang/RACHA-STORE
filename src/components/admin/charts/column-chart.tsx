"use client";

import { useId, useState } from "react";
import { INK, useReveal, useWidth, valueTicks } from "./theme";
import type { Point } from "./area-chart";

const HEIGHT = 212;
const M = { top: 16, right: 8, bottom: 30, left: 40 };

// Colonnes (<= 24 px, bout arrondi de 4 px, base droite) qui montent depuis
// l'axe. Survol ou clavier : la colonne visée reste pleine, les autres s'estompent.
export function ColumnChart({
  data,
  name,
  color,
  formatValue,
}: {
  data: Point[];
  name: string;
  color: string;
  formatValue: (n: number) => string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const uid = `c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const progress = useReveal();
  const [active, setActive] = useState<number | null>(null);

  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = HEIGHT - M.top - M.bottom;
  const max = Math.max(0, ...data.map((d) => d.value));
  const { top, ticks } = valueTicks(max, true);
  const band = data.length > 0 ? plotW / data.length : 0;
  const barW = Math.min(24, band * 0.55);
  const y = (v: number) => plotH - (v / top) * plotH;

  function columnPath(i: number, value: number) {
    const h = (plotH - y(value)) * progress;
    if (h <= 0) return "";
    const x0 = band * (i + 0.5) - barW / 2;
    const x1 = x0 + barW;
    const yTop = plotH - h;
    const r = Math.min(4, h, barW / 2);
    return `M${x0},${plotH}V${yTop + r}Q${x0},${yTop} ${x0 + r},${yTop}H${x1 - r}Q${x1},${yTop} ${x1},${yTop + r}V${plotH}Z`;
  }

  const current = active !== null ? data[active] : null;
  const tooltipLeft =
    active !== null ? Math.min(Math.max(M.left + band * (active + 0.5) - 70, 0), Math.max(0, width - 140)) : 0;

  return (
    <div ref={ref} className="relative select-none" style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${name}. Utilisez les flèches pour parcourir.`}
          tabIndex={0}
          className="outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(0)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? 1) - 1));
            if (e.key === "ArrowRight") setActive((a) => Math.min(data.length - 1, (a ?? -1) + 1));
          }}
        >
          <defs>
            <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity={0} />
              <stop offset="0.06" stopColor="#fff" stopOpacity={1} />
              <stop offset="0.94" stopColor="#fff" stopOpacity={1} />
              <stop offset="1" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x={0} y={-2} width={plotW} height={plotH + 4}>
              <rect x={0} y={-2} width={plotW} height={plotH + 4} fill={`url(#${uid}-fade)`} />
            </mask>
          </defs>
          <g transform={`translate(${M.left},${M.top})`}>
            <g mask={`url(#${uid}-mask)`}>
              {ticks.map((t) => (
                <line key={t} x1={0} x2={plotW} y1={y(t)} y2={y(t)} stroke={INK.grid} strokeDasharray="1 5" strokeLinecap="round" />
              ))}
            </g>
            {ticks.map((t) => (
              <text key={t} x={-10} y={y(t)} dy="0.32em" textAnchor="end" fill={INK.muted} fontSize={11} className="tabular-nums">
                {t}
              </text>
            ))}
            {data.map((d, i) => (
              <g key={d.label} onPointerEnter={() => setActive(i)}>
                {/* Zone de survol : toute la hauteur de la colonne, plus large que la barre. */}
                <rect x={band * i} y={0} width={band} height={plotH + 24} fill="transparent" />
                <path
                  d={columnPath(i, d.value)}
                  fill={color}
                  opacity={active === null || active === i ? 1 : 0.35}
                  style={{ transition: "opacity 150ms" }}
                />
                <text x={band * (i + 0.5)} y={plotH + 21} textAnchor="middle" fill={INK.muted} fontSize={11}>
                  {d.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      )}
      {current && (
        <div
          className="pointer-events-none absolute top-0 w-36 border border-line bg-cream/95 px-3 py-2 shadow-sm"
          style={{ left: tooltipLeft }}
          role="status"
        >
          <p className="text-sm font-semibold text-ink">{formatValue(current.value)}</p>
          <p className="text-xs text-stone-light mt-0.5">{current.label}</p>
        </div>
      )}
    </div>
  );
}
