import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background active:scale-[0.985]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground shadow-glow ring-1 ring-primary/40 hover:brightness-[1.08] hover:ring-primary/50 focus-visible:ring-offset-2",
        secondary:
          "border border-border/70 bg-[hsl(var(--surface))]/85 text-foreground shadow-[0_22px_45px_-28px_hsl(var(--primary)/0.28)] hover:bg-[hsl(var(--surface-strong))]/90 hover:border-border/60",
        outline:
          "border border-border/70 bg-transparent text-foreground hover:bg-[hsl(var(--surface))]/70 hover:border-border/60",
        ghost:
          "border border-transparent bg-transparent text-foreground/80 hover:bg-[hsl(var(--surface))]/55 hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_24px_48px_-28px_hsl(var(--destructive)/0.55)] hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-11 rounded-full px-7 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
