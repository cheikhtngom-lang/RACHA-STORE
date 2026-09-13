"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export const RadioGroup = RadioGroupPrimitive.Root;

export function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "h-5 w-5 shrink-0 rounded-full border border-line bg-cream data-[state=checked]:border-ink flex items-center justify-center cursor-pointer",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-ink" />
    </RadioGroupPrimitive.Item>
  );
}
