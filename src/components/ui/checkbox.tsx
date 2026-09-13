"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "h-5 w-5 shrink-0 border border-line bg-cream data-[state=checked]:bg-ink data-[state=checked]:border-ink flex items-center justify-center transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={13} strokeWidth={2.5} className="text-cream" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
