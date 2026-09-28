import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans-wide text-[0.72rem] uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-ink text-cream hover:bg-ink-hover",
        gold: "bg-gold text-ink-dark hover:bg-gold-light",
        outline: "border border-ink text-ink hover:bg-ink hover:text-cream",
        outlineLight: "border border-cream/60 text-cream hover:bg-cream hover:text-ink",
        ghost: "text-ink hover:text-gold",
        link: "text-ink underline-offset-4 hover:underline normal-case tracking-normal font-body text-sm",
      },
      size: {
        sm: "h-9 px-4 text-[0.65rem]",
        md: "h-12 px-7",
        lg: "h-14 px-10 text-[0.75rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
