"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, LoadError, Loading } from "@/components/admin/ui";
import { StatisticsDashboard, periodLabel, type Analytics } from "@/components/admin/statistics-dashboard";
import { cn } from "@/lib/utils";

const PERIODS = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" },
  { days: 365, label: "12 mois" },
];



export default function StatisticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<"migration" | "error" | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  // Ordre des catégories = ordre des couleurs de l'anneau (la couleur suit la catégorie).
  useEffect(() => {
    createClient()
      .from("categories")
      .select("name")
      .order("position")
      .then(({ data: rows }) => setCategoryOrder((rows ?? []).map((c) => c.name as string)));
  }, []);

  useEffect(() => {
    let ignore = false;
    createClient()
      .rpc("admin_analytics", { p_days: days })
      .then(({ data: result, error }) => {
        if (ignore) return;
        if (error) {
          // PGRST202 : fonction absente, la migration n'a pas été exécutée.
          setFailure(error.code === "PGRST202" ? "migration" : "error");
        } else {
          setData(result as Analytics);
          setFailure(null);
        }
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [days]);

  function choosePeriod(value: number) {
    if (value === days) return;
    setLoading(true);
    setDays(value);
  }

  return (
    <>
      <PageHeader title="Statistiques" description={data ? periodLabel(data.period) : undefined} />

      {/* Un seul filtre, au-dessus de tout ce qu'il concerne. */}
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Période">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => choosePeriod(p.days)}
            aria-pressed={days === p.days}
            className={cn(
              "h-10 px-4 border text-xs font-sans-wide uppercase transition-colors cursor-pointer",
              days === p.days ? "bg-ink border-ink text-cream" : "border-line text-stone hover:border-ink hover:text-ink"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {failure === "migration" && (
        <LoadError>
          Les statistiques ne sont pas encore activées : exécutez le fichier supabase/migrations/20260928160000_analytics.sql
          dans Supabase → SQL Editor, puis rechargez la page.
        </LoadError>
      )}
      {failure === "error" && <LoadError>Impossible de charger les statistiques. Actualisez la page.</LoadError>}
      {!failure && !data && <Loading />}

      {data && (
        // Pendant un rechargement, l'affichage précédent reste en place, estompé.
        <div className={cn("flex flex-col gap-6 transition-opacity", loading && "opacity-50")}>
          <StatisticsDashboard data={data} categoryOrder={categoryOrder} />
        </div>
      )}
    </>
  );
}

