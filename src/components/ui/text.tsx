import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  lead: "text-lg text-balance text-foreground/80",
  body: "text-base text-[hsl(var(--muted))]",
  small: "text-sm text-[hsl(var(--muted))]",
} as const;

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: keyof typeof variants;
};

export function Text({ variant = "body", className, ...props }: TextProps) {
  return <p className={cn(variants[variant], className)} {...props} />;
}
