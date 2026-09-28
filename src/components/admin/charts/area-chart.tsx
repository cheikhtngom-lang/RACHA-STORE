"use client";

import { useId, useState } from "react";
import { area, curveMonotoneX, line } from "d3-shape";
import { INK, useReveal, useWidth, valueTicks } from "./theme";

export type Point = { label: string; value: number };

const HEIGHT = 232; // tracé + bande des dates : rien n'est rogné
const M = { top: 16, right: 16, bottom: 30, left: 56 };

// Aire sur une période (style Bklit) : dégradé 0,4 → 0, courbe monotone,
// grille pointillée aux bords fondus, ligne de repère et infobulle au survol
// ou au clavier (flèches gauche/droite).
export function AreaChart({
  data,
  name,
  color,
  formatValue,
  formatAxis,
  integer = false,
}: {
  data: Point[];
  name: string;
  color: string;
  formatValue: (n: number) => string;
  formatAxis: (n: number) => string;
  integer?: boolean;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  // Identifiant sans « : » ni « « » », utilisable dans url(#…).
  const uid = `a${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const progress = useReveal();
  const [active, setActive] = useState<number | null>(null);

  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = HEIGHT - M.top - M.bottom;
  const max = Math.max(0, ...data.map((d) => d.value));
  const { top, ticks } = valueTicks(max, integer);
  const x = (i: number) => (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v: number) => plotH - (v / top) * plotH;

  const areaPath = area<Point>().x((_, i) => x(i)).y0(plotH).y1((d) => y(d.value)).curve(curveMonotoneX)(data) ?? "";
  const linePath = line<Point>().x((_, i) => x(i)).y((d) => y(d.value)).curve(curveMonotoneX)(data) ?? "";

  // Une date tous les ~70 px (six au plus) ; la dernière toujours, sans chevaucher la précédente.
  const maxLabels = Math.max(2, Math.min(6, Math.floor(plotW / 70)));
  const every = Math.max(1, Math.ceil(data.length / maxLabels));
  const labelIndexes = data
    .map((_, i) => i)
    .filter((i) => i % every === 0 && (data.length - 1 - i >= every * 0.6 || i === data.length - 1));
  if (data.length > 1 && !labelIndexes.includes(data.length - 1)) labelIndexes.push(data.length - 1);

  function pointerToIndex(clientX: number, rect: DOMRect) {
    const px = clientX - rect.left - M.left;
    const i = data.length <= 1 ? 0 : Math.round((px / Math.max(1, plotW)) * (data.length - 1));
    return Math.min(data.length - 1, Math.max(0, i));
  }

  const current = active !== null ? data[active] : null;
  const tooltipLeft = active !== null ? Math.min(Math.max(M.left + x(active) - 80, 0), Math.max(0, width - 160)) : 0;

  return (
    <div ref={ref} className="relative select-none" style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${name} : ${data.length} valeurs. Utilisez les flèches pour parcourir.`}
          tabIndex={0}
          className="outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          onPointerMove={(e) => setActive(pointerToIndex(e.clientX, e.currentTarget.getBoundingClientRect()))}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(data.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? data.length) - 1));
            if (e.key === "ArrowRight") setActive((a) => Math.min(data.length - 1, (a ?? -1) + 1));
          }}
        >
          <defs>
            <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity={0} />
              <stop offset="0.08" stopColor="#fff" stopOpacity={1} />
              <stop offset="0.92" stopColor="#fff" stopOpacity={1} />
              <stop offset="1" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x={0} y={-2} width={plotW} height={plotH + 4}>
              <rect x={0} y={-2} width={plotW} height={plotH + 4} fill={`url(#${uid}-fade)`} />
            </mask>
            <clipPath id={`${uid}-clip`}>
              <rect x={-4} y={-8} width={(plotW + 8) * progress} height={plotH + 16} />
            </clipPath>
          </defs>

          <g transform={`translate(${M.left},${M.top})`}>
            <g mask={`url(#${uid}-mask)`}>
              {ticks.map((t) => (
                <line key={t} x1={0} x2={plotW} y1={y(t)} y2={y(t)} stroke={INK.grid} strokeDasharray="1 5" strokeLinecap="round" />
              ))}
            </g>
            {ticks.map((t) => (
              <text key={t} x={-12} y={y(t)} dy="0.32em" textAnchor="end" fill={INK.muted} fontSize={11} className="tabular-nums">
                {formatAxis(t)}
              </text>
            ))}

            <g clipPath={`url(#${uid}-clip)`}>
              <path d={areaPath} fill={`url(#${uid}-fill)`} />
              <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </g>

            {labelIndexes.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={plotH + 21}
                textAnchor={i === 0 && data.length > 1 ? "start" : i === data.length - 1 && data.length > 1 ? "end" : "middle"}
                fill={INK.muted}
                fontSize={11}
              >
                {data[i].label}
              </text>
            ))}

            {active !== null && current && (
              <g pointerEvents="none">
                <line x1={x(active)} x2={x(active)} y1={0} y2={plotH} stroke={INK.muted} strokeWidth={1} />
                <circle cx={x(active)} cy={y(current.value)} r={4.5} fill={color} stroke={INK.surface} strokeWidth={2} />
              </g>
            )}
          </g>
        </svg>
      )}

      {current && (
        <div
          className="pointer-events-none absolute top-0 w-40 border border-line bg-cream/95 px-3 py-2 shadow-sm"
          style={{ left: tooltipLeft }}
          role="status"
        >
          <p className="text-sm font-semibold text-ink">{formatValue(current.value)}</p>
          <p className="flex items-center gap-2 text-xs text-stone-light mt-0.5">
            <span className="inline-block h-0.5 w-3" style={{ background: color }} />
            {current.label}
          </p>
        </div>
      )}
    </div>
  );
}
