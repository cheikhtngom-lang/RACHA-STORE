"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, OrderStatusBadge, Loading, LoadError, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { formatDateTime } from "@/lib/admin/utils";
import { formatPrice, cn } from "@/lib/utils";

const PAGE_SIZE = 30;

const filters: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payées" },
  { value: "shipped", label: "Expédiées" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
];

type OrderRow = {
  id: string;
  order_number: string;
  status: OrderStatus;
  first_name: string;
  last_name: string;
  city: string;
  total: number;
  created_at: string;
};

function OrdersPage() {
  const searchParams = useSearchParams();
  const param = searchParams.get("statut");
  const status = ORDER_STATUSES.find((s) => s === param) ?? "all";
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <PageHeader title="Commandes" />

      <div className="flex gap-6 border-b border-line overflow-x-auto mb-6">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/commandes" : `/admin/commandes?statut=${f.value}`}
            scroll={false}
            className={cn(
              "font-sans-wide text-[0.68rem] uppercase pb-3 -mb-px border-b-2 whitespace-nowrap transition-colors",
              status === f.value ? "border-gold text-ink" : "border-transparent text-stone-light hover:text-ink"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-light" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="N° de commande, nom, téléphone, e-mail"
          className="pl-11"
          aria-label="Rechercher une commande"
        />
      </div>

      <OrdersResults key={`${status}|${search}`} status={status} search={search} />
    </>
  );
}

function OrdersResults({ status, search }: { status: OrderStatus | "all"; search: string }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [result, setResult] = useState<{ rows: OrderRow[]; hasMore: boolean } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let ignore = false;
    // Une ligne de plus que la page, pour savoir s'il en reste.
    let request = createClient()
      .from("orders")
      .select("id, order_number, status, first_name, last_name, city, total, created_at")
      .order("created_at", { ascending: false })
      .range(0, limit);
    if (status !== "all") request = request.eq("status", status);
    // Chaque mot doit apparaître dans l'un des champs. Les guillemets protègent
    // les virgules et parenthèses, qui ont un sens dans la syntaxe de filtre.
    for (const word of search.split(/\s+/).filter(Boolean)) {
      const value = `"%${word.replace(/["\\]/g, "")}%"`;
      request = request.or(
        ["order_number", "first_name", "last_name", "phone", "email"].map((col) => `${col}.ilike.${value}`).join(",")
      );
    }
    request.then(({ data, error }) => {
      if (ignore) return;
      if (error) {
        setFailed(true);
        return;
      }
      const rows = (data ?? []) as OrderRow[];
      setResult({ rows: rows.slice(0, limit), hasMore: rows.length > limit });
    });
    return () => {
      ignore = true;
    };
  }, [status, search, limit]);

  if (failed) return <LoadError>Impossible de charger les commandes. Actualisez la page.</LoadError>;
  if (!result) return <Loading />;
  if (result.rows.length === 0) {
    return <EmptyState>{search ? "Aucune commande ne correspond à cette recherche." : "Aucune commande pour le moment."}</EmptyState>;
  }

  return (
    <>
      <ul className="border border-line divide-y divide-line">
        {result.rows.map((o) => (
          <li key={o.id}>
            <Link href={`/admin/commandes/${o.id}`} className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-sand/50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">
                  {o.first_name} {o.last_name}
                </p>
                <p className="text-xs text-stone-light mt-1">
                  {o.order_number} · {formatDateTime(o.created_at)} · {o.city}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-sm tabular-nums">{formatPrice(o.total)}</span>
                <OrderStatusBadge status={o.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {result.hasMore && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            Afficher plus
          </Button>
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersPage />
    </Suspense>
  );
}
