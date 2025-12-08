"use client";

import { cn } from "@/lib/utils";

export function ThinkingLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-8", className)}>
      <div className="flex gap-1.5">
        <div className="bg-primary/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
        <div className="bg-primary/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
        <div className="bg-primary/60 h-2 w-2 animate-bounce rounded-full" />
      </div>
      <span className="text-muted-foreground text-sm font-medium">Thinking...</span>
    </div>
  );
}
