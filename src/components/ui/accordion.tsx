"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b border-line", className)} {...props} />;
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex w-full items-center justify-between py-5 text-left font-sans tracking-[0.08em] text-[0.7rem] uppercase text-ink cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
        <Plus size={16} strokeWidth={1.5} className="shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45 text-gold" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden text-sm text-stone leading-relaxed data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className="pb-5">{children}</div>
    </AccordionPrimitive.Content>
  );
}
