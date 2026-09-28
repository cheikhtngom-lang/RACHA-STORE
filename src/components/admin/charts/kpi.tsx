"use client";

import { useId, useState } from "react";
import { area, curveMonotoneX, line } from "d3-shape";
import { ArrowDownRight, ArrowUpRight, Table2, ChartLine } from "lucide-react";
import { INK, formatPercent } from "./theme";
import { cn } from "@/lib/utils";

// Évolution par rapport à la période précédente. Sans valeur précédente, pas
// de pourcentage (une hausse « infinie » ne veut rien dire).
export function Delta({ current, previous, higherIsBetter }: { current: number; previous: number; higherIsBetter: boolean }) {
  if (previous === 0) {
    return <p className="text-xs text-stone-light">{current > 0 ? "Pas de période précédente à comparer" : "Aucune donnée"}</p>;
  }
  const change = (current - previous) / previous;
  const up = change > 0;
  const good = change === 0 ? null : up === higherIsBetter;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p className="flex items-center gap-1 text-xs" style={{ color: good === null ? INK.muted : good ? INK.good : INK.bad }}>
      {change !== 0 && <Icon size={13} strokeWidth={2} aria-hidden="true" />}
      <span>
        {change > 0 ? "+" : ""}
        {formatPercent(change)}
      </span>
      <span className="text-stone-light">vs période précédente</span>
    </p>
  );
}

// Tendance miniature : la série dans la teinte discrète, le dernier point en couleur.
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const uid = `s${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (values.length < 2) return null;
  const w = 120;
  const h = 32;
  const max = Math.max(1, ...values);
  const x = (i: number) => (i / (values.length - 1)) * w;
  const y = (v: number) => h - 3 - (v / max) * (h - 6);
  const linePath = line<number>().x((_, i) => x(i)).y(y).curve(curveMonotoneX)(values) ?? "";
  const areaPath = area<number>().x((_, i) => x(i)).y0(h).y1(y).curve(curveMonotoneX)(values) ?? "";
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${uid})`} />
      <path d={linePath} fill="none" stroke={INK.muted} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={3} fill={color} stroke={INK.surface} strokeWidth={1.5} />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  current,
  previous,
  higherIsBetter = true,
  trend,
  trendColor,
  note,
}: {
  label: string;
  value: string;
  current?: number;
  previous?: number;
  higherIsBetter?: boolean;
  trend?: number[];
  trendColor?: string;
  note?: string;
}) {
  return (
    <div className="min-w-0 border border-line bg-cream p-4 sm:p-5 flex flex-col gap-3">
      <p className="font-sans-wide text-[0.62rem] uppercase text-stone-light">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl sm:text-[1.7rem] font-semibold text-ink leading-none">{value}</p>
        {trend && trendColor && <Sparkline values={trend} color={trendColor} />}
      </div>
      {current !== undefined && previous !== undefined ? (
        <Delta current={current} previous={previous} higherIsBetter={higherIsBetter} />
      ) : (
        note && <p className="text-xs text-stone-light">{note}</p>
      )}
    </div>
  );
}

export type TableView = { columns: string[]; rows: (string | number)[][] };

// Cadre commun des graphiques. « Tableau » affiche les mêmes valeurs en
// tableau : aucune donnée n'est lisible uniquement au survol ou par la couleur.
export function ChartCard({
  title,
  description,
  table,
  children,
  className,
}: {
  title: string;
  description?: string;
  table?: TableView;
  children: React.ReactNode;
  className?: string;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className={cn("min-w-0 border border-line bg-cream flex flex-col", className)}>
      <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5">
        <div className="min-w-0">
          <h2 className="font-sans-wide text-[0.68rem] uppercase text-ink">{title}</h2>
          {description && <p className="text-xs text-stone-light mt-1">{description}</p>}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs text-stone hover:text-ink cursor-pointer"
            aria-pressed={showTable}
          >
            {showTable ? <ChartLine size={14} strokeWidth={1.5} /> : <Table2 size={14} strokeWidth={1.5} />}
            {showTable ? "Graphique" : "Tableau"}
          </button>
        )}
      </div>
      <div className="p-5 sm:p-6 pt-4 sm:pt-5 flex-1">
        {showTable && table ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  {table.columns.map((c, i) => (
                    <th key={c} className={cn("py-2 font-sans-wide text-[0.6rem] uppercase text-stone-light font-normal", i === 0 ? "text-left" : "text-right")}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={r} className="border-b border-line/60 last:border-0">
                    {row.map((cell, i) => (
                      <td key={i} className={cn("py-2 text-ink", i === 0 ? "text-left" : "text-right tabular-nums")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
