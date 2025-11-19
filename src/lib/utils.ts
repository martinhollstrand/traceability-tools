import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number, fractionDigits = 1) {
  return Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCurrency(value: number, currency: string | undefined = "USD") {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number) {
  return Intl.NumberFormat("en-US").format(value);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function resolveAvatarFallback(name?: string) {
  if (!name) return "TT";
  const [first, second] = name.split(" ");
  return `${first?.[0] ?? "T"}${second?.[0] ?? first?.[1] ?? "T"}`.toUpperCase();
}
