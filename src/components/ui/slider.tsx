"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex items-center select-none touch-none w-full h-5", className)}
      {...props}
    >
      <SliderPrimitive.Track className="bg-line relative grow rounded-full h-[2px]">
        <SliderPrimitive.Range className="absolute bg-gold rounded-full h-full" />
      </SliderPrimitive.Track>
      {(props.value ?? props.defaultValue ?? [0]).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-4 w-4 rounded-full bg-ink border-2 border-cream shadow cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      ))}
    </SliderPrimitive.Root>
  );
}
