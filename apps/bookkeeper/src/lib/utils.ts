import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-style `cn` — path MUST stay `@/lib/utils` for UI imports. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
