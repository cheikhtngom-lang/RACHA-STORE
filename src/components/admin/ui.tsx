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
  eyebrow,
  description,
  action,
  back,
}: {
  title: string;
  eyebrow?: string;
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
          {eyebrow && <p className="eyebrow text-gold-light mb-3">{eyebrow}</p>}
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none">{title}</h1>
          {description && <p className="text-sm text-stone-light mt-3">{description}</p>}
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
    <section className={cn("dash-card overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="flex items-center gap-2.5 font-sans-wide text-[0.68rem] uppercase text-ink">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgb(201_161_94/0.55)]" />
            {title}
          </h2>
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
  return <p className="text-sm text-danger border border-danger/30 bg-danger/5 rounded-[14px] p-4">{children}</p>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="dash-card text-sm text-stone-light px-6 py-12 text-center">{children}</p>;
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md p-6 sm:p-8 rounded-[14px] border border-line">
        <DialogTitle className="font-display text-2xl text-ink mb-3 pr-10">{title}</DialogTitle>
        <div className="text-sm text-stone leading-relaxed mb-8">{children}</div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Retour
          </Button>
          <Button type="button" variant="primary" className="bg-danger hover:bg-danger/85" onClick={onConfirm} disabled={pending}>
            {pending ? "Un instant…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
