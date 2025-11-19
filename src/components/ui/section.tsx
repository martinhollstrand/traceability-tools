import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

type SectionProps = {
  id?: string;
  kicker?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function Section({
  id,
  kicker,
  title,
  description,
  className,
  actions,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-12 md:py-20", className)}>
      <Container>
        <div className="flex flex-col gap-10">
          {(kicker || title || description || actions) && (
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                {kicker && (
                  <p className="text-sm font-semibold tracking-[0.2em] text-[hsl(var(--muted))] uppercase">
                    {kicker}
                  </p>
                )}
                {title && (
                  <h2 className="text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-base text-[hsl(var(--muted))]">{description}</p>
                )}
              </div>
              {actions && <div className="shrink-0">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </Container>
    </section>
  );
}
