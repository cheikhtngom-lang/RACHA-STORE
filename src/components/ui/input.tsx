import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full border border-line bg-cream px-4 text-sm text-ink placeholder:text-stone-light focus-visible:outline-none focus-visible:border-gold transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full border border-line bg-cream px-4 py-3 text-sm text-ink placeholder:text-stone-light focus-visible:outline-none focus-visible:border-gold transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("font-sans-wide text-[0.65rem] uppercase text-stone mb-2 block", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
