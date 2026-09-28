"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { orderStatusLabels, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 lg:mb-10">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-2 text-xs text-stone hover:text-ink mb-4">
          <ArrowLeft size={14} strokeWidth={1.5} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink">{title}</h1>
          {description && <p className="text-sm text-stone-light mt-2">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-line bg-cream", className)}>
      {title && (
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line bg-sand/40">
          <h2 className="font-sans-wide text-[0.68rem] uppercase text-ink">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = orderStatusLabels[status];
  return (
    <span className={cn("inline-flex font-sans-wide text-[0.6rem] uppercase px-2.5 py-1 whitespace-nowrap", className)}>
      {label}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-stone-light mt-1.5">{hint}</p>}
    </div>
  );
}

export function Loading() {
  return <p className="text-sm text-stone-light">Chargement…</p>;
}

export function LoadError({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#6E2A32] border border-[#6E2A32]/30 p-4">{children}</p>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-stone-light border border-line px-6 py-12 text-center">{children}</p>;
}

// Case à cocher native, alignée sur le style du site. Plus simple qu'un
// composant Radix dans un formulaire qui manipule beaucoup de champs.
export function CheckboxField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-ink cursor-pointer"
      />
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="block text-xs text-stone-light mt-0.5">{hint}</span>}
      </span>
    </label>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  confirmLabel,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md p-6 sm:p-8">
        <DialogTitle className="font-display text-2xl text-ink mb-3 pr-10">{title}</DialogTitle>
        <div className="text-sm text-stone leading-relaxed mb-8">{children}</div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Retour
          </Button>
          <Button type="button" variant="primary" className="bg-[#6E2A32] hover:bg-[#5a2129]" onClick={onConfirm} disabled={pending}>
            {pending ? "Un instant…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
