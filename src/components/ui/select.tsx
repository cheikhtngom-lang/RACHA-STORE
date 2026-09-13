"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-11 items-center justify-between gap-2 border border-line bg-cream px-4 text-[0.7rem] font-sans-wide uppercase text-ink cursor-pointer hover:border-ink transition-colors focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown size={14} strokeWidth={1.5} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn("z-50 overflow-hidden border border-line bg-cream shadow-xl", className)}
        position="popper"
        sideOffset={6}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex items-center gap-2 px-3 py-2.5 text-[0.7rem] font-sans-wide uppercase text-ink cursor-pointer outline-none data-[highlighted]:bg-sand",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto">
        <Check size={13} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
