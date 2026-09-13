"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  className,
  children,
  showClose = true,
}: {
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink-dark/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-cream shadow-2xl outline-none max-h-[90vh] overflow-y-auto",
          "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 duration-300",
          className
        )}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-5 top-5 h-9 w-9 flex items-center justify-center hover:text-gold transition-colors cursor-pointer">
            <X size={20} strokeWidth={1.5} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogClose = DialogPrimitive.Close;
