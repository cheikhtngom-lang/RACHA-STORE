"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string;
};

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
  children,
  footer,
  widthClassName = "w-full sm:w-[440px]",
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-dark/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className={cn(
            "fixed top-0 z-50 h-full bg-cream shadow-2xl flex flex-col outline-none",
            side === "right" ? "right-0" : "left-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            side === "right"
              ? "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
              : "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
            "duration-400",
            widthClassName
          )}
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-line shrink-0">
            <Dialog.Title className="font-display text-2xl text-ink">{title}</Dialog.Title>
            <Dialog.Close className="h-9 w-9 flex items-center justify-center hover:text-gold transition-colors cursor-pointer">
              <X size={20} strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-line shrink-0">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
