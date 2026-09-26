/**
 * Lightweight shadcn-like primitives for vanilla TS + Tailwind.
 * No Radix/React runtime — class builders only (a11y patterns in markup).
 */

export type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
export type BadgeVariant = "allow" | "flag" | "block" | "neutral" | "sandbox";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-shield-allow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-shield-bg";

export function btnClass(variant: BtnVariant = "primary", extra = ""): string {
  const base = [
    "inline-flex items-center justify-center gap-2",
    "min-h-12 px-4 py-3 rounded-xl",
    "text-base font-semibold tracking-wide",
    "transition-colors duration-150",
    "disabled:opacity-45 disabled:cursor-not-allowed",
    focusRing,
  ].join(" ");

  const variants: Record<BtnVariant, string> = {
    primary:
      "bg-shield-accent text-white border border-shield-accent hover:bg-shield-accentHover",
    secondary:
      "bg-transparent text-shield-ink border border-shield-border hover:bg-shield-card",
    ghost:
      "bg-shield-surface text-shield-ink border border-transparent hover:border-shield-border",
    danger:
      "bg-shield-blockBg text-shield-block border border-shield-block/40 hover:bg-[#4a2222]",
  };

  return `${base} ${variants[variant]} ${extra}`.trim();
}

export function badgeClass(variant: BadgeVariant = "neutral"): string {
  const base =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide";
  const variants: Record<BadgeVariant, string> = {
    allow: "bg-shield-allowBg text-shield-allow border border-shield-allow/40",
    flag: "bg-shield-flagBg text-shield-flag border border-shield-flag/40",
    block: "bg-shield-blockBg text-shield-block border border-shield-block/40",
    neutral: "bg-shield-surface text-shield-muted border border-shield-border",
    sandbox:
      "bg-shield-flagBg text-shield-flag border border-dashed border-shield-flag/60 normal-case tracking-normal font-semibold",
  };
  return `${base} ${variants[variant]}`;
}

export function cardClass(action?: "allow" | "flag" | "block"): string {
  const base =
    "rounded-2xl border bg-shield-card p-4 sm:p-5 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-shield-allow/40";
  if (action === "block")
    return `${base} border-shield-block/50 border-l-4 border-l-shield-block`;
  if (action === "flag")
    return `${base} border-shield-flag/40 border-l-4 border-l-shield-flag`;
  if (action === "allow")
    return `${base} border-shield-allow/40 border-l-4 border-l-shield-allow`;
  return `${base} border-shield-border`;
}

export function sectionTitleClass(): string {
  return "text-sm font-bold uppercase tracking-widest text-shield-muted mb-3";
}
