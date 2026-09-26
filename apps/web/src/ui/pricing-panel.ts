/**
 * Who-pays / Sea pilot / subscription pricing panel (BR2 fixture).
 */
import {
  createCheckout,
  honestyBanner,
  listPlans,
  stubCharge,
  type BillingMode,
} from "@bizmate/billing";
import { alertVariants, badgeVariants, card } from "./index.js";
import { escapeHtml } from "../format.js";
import { state } from "../state.js";

export function pricingPanelHtml(): string {
  const plans = listPlans("bizmate");
  const bannerStripe = honestyBanner("stripe_test");
  const bannerStub = honestyBanner("offline_stub");
  const rows = plans
    .map((p) => {
      const road = p.roadmapOnly
        ? `<span class="${badgeVariants({ variant: "roadmap" })}">roadmap</span>`
        : `<span class="${badgeVariants({ variant: "ok" })}">D-Day</span>`;
      return `<li class="rounded-lg border border-border bg-background/40 p-4">
        <div class="mb-1 flex flex-wrap items-baseline gap-2">
          <strong class="text-sm">${escapeHtml(p.nameVi)}</strong> ${road}
          <span class="ml-auto font-mono text-sm text-primary">${escapeHtml(p.priceDisplay)}</span>
        </div>
        <p class="text-xs text-muted-foreground">${escapeHtml(p.honestyNote)}</p>
        <ul class="mt-2 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">${p.features
          .map((f) => `<li>${escapeHtml(f)}</li>`)
          .join("")}</ul>
      </li>`;
    })
    .join("");

  let outcome = "";
  if (state.lastBilling?.kind === "checkout") {
    const r = state.lastBilling.result;
    outcome = `<div class="mt-4 rounded-lg border border-border bg-background/50 p-3" role="status">
      <p class="${alertVariants({ variant: "warn", className: "mb-2 font-semibold" })}">${escapeHtml(r.honestyBanner)}</p>
      <p class="text-xs text-muted-foreground"><code>${escapeHtml(r.sessionId)}</code> · ok=${r.ok} · stub=${r.stub}
      ${r.url ? ` · <span class="break-all font-mono text-[0.75rem]">${escapeHtml(r.url)}</span>` : ""}
      ${r.costCenter ? ` · CC=${escapeHtml(r.costCenter)}` : ""}</p>
      <p class="mt-1 text-xs text-muted-foreground">${escapeHtml(r.detail)}</p>
    </div>`;
  } else if (state.lastBilling?.kind === "stub") {
    const r = state.lastBilling.result;
    outcome = `<div class="mt-4 rounded-lg border border-border bg-background/50 p-3" role="status">
      <p class="${alertVariants({ variant: "warn", className: "mb-2 font-semibold" })}">${escapeHtml(r.honestyBanner)}</p>
      <p class="text-xs text-muted-foreground"><code>${escapeHtml(r.chargeId)}</code> · CC=${escapeHtml(r.costCenter)}</p>
      <p class="mt-1 text-xs text-muted-foreground">${escapeHtml(r.detail)}</p>
    </div>`;
  }

  return `
    <section class="${card.root("mb-4")}" id="pricing">
      <div class="${card.content()}">
        <h2 class="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          Giá / subscription
          <span class="${badgeVariants({ variant: "secondary" })}">BR2 · fixture</span>
        </h2>
        <p class="mb-3 text-xs text-muted-foreground">
          Payer D-Day: <strong>Sea internal tooling</strong> (cost-center). SME Pro = roadmap. Giá = fixture — không phải catalog live.
        </p>
        <ul class="mb-4 flex list-none flex-col gap-3 p-0">${rows}</ul>
        <div class="mb-4 flex flex-col gap-2">
          <p class="${alertVariants({ variant: "warn", className: "font-semibold" })}">${escapeHtml(bannerStub)}</p>
          <p class="${alertVariants({ variant: "warn", className: "font-semibold" })}">${escapeHtml(bannerStripe)}</p>
        </div>
        <p class="mb-3 text-xs text-muted-foreground">
          Money CTAs nằm trên <strong>ops rail</strong> (above fold) · STUB / SANDBOX labeled.
          Mode Stripe: <code>${state.billingMode}</code> · Sea path luôn <code>offline_stub</code>.
        </p>
        ${outcome}
      </div>
    </section>`;
}

export function applySeaStubCharge(): void {
  state.lastBilling = {
    kind: "stub",
    result: stubCharge({
      appId: "bizmate",
      planId: "bizmate-sea-seat",
      costCenter: "SEA-INTERNAL-TOOLING",
    }),
  };
}

export function applyStripeCheckout(planId: string, mode: BillingMode = "stripe_test"): void {
  state.billingMode = mode;
  state.lastBilling = {
    kind: "checkout",
    result: createCheckout({
      appId: "bizmate",
      planId,
      mode,
    }),
  };
}
