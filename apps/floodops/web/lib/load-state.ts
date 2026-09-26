/**
 * Server-side loaders for ops dashboard — read JSON state / fixture.
 * Sandbox only; never claims live SPX.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createCheckout,
  listPlans,
  type CheckoutResult,
  type Plan,
} from "@bizmate/billing";

export interface Ward {
  id: string;
  name: string;
  floodCm: number;
  status: "clear" | "flooded";
}

export interface Order {
  id: string;
  wardId: string;
  codVnd: number;
  slaHoursLeft: number;
  shopId?: string;
}

export interface ProposedAction {
  orderId: string;
  kind: string;
  reason: string;
  requiresHuman: boolean;
  impactEstimate: string;
  status: string;
  buyerNotifyVi?: string;
  roundTripFeeEstimateVnd?: number;
}

export interface WaveState {
  waveId: string;
  updatedAt: string;
  city: string;
  mode: string;
  honestyBanner: string;
  wards: Ward[];
  orders: Order[];
  events: unknown[];
  policy: {
    autoRescheduleMaxCodVnd: number;
    refundRequiresHumanAboveVnd: number;
  };
  actions: ProposedAction[];
  wardGeo: Record<string, { lat: number; lng: number }>;
}

const DEFAULT_WARD_GEO: Record<string, { lat: number; lng: number }> = {
  "q5-andong": { lat: 10.7552, lng: 106.6664 },
  "q1-bnghe": { lat: 10.7765, lng: 106.7054 },
  "q10-hoahung": { lat: 10.7728, lng: 106.6668 },
  "thu-duc": { lat: 10.8494, lng: 106.7537 },
};

/** Resolve apps/floodops root whether cwd is monorepo, floodops, or web/. */
export function appRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../.."),
    path.resolve(process.cwd()),
    path.resolve(process.cwd(), ".."),
    path.resolve(process.cwd(), "apps/floodops"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "fixtures", "hcm-flood-day.json"))) {
      return c;
    }
  }
  return candidates[0]!;
}

export function loadWaveState(): WaveState | null {
  const root = appRoot();
  const statePath = path.join(root, "data", "orders.json");
  if (fs.existsSync(statePath)) {
    try {
      return JSON.parse(fs.readFileSync(statePath, "utf8")) as WaveState;
    } catch {
      /* fall through to fixture */
    }
  }
  const fixturePath = path.join(root, "fixtures", "hcm-flood-day.json");
  if (!fs.existsSync(fixturePath)) return null;
  const data = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as {
    city: string;
    wards: Ward[];
    orders: Order[];
    events: unknown[];
    policy: WaveState["policy"];
  };
  return {
    waveId: "hcm-flood-day",
    updatedAt: new Date().toISOString(),
    city: data.city,
    mode: "sandbox_stub",
    honestyBanner:
      "⚠️ SANDBOX / STUB · Fixture fallback (chạy npm run worker để ghi data/orders.json) — không live SPX",
    wards: data.wards,
    orders: data.orders,
    events: data.events,
    policy: data.policy,
    actions: [],
    wardGeo: DEFAULT_WARD_GEO,
  };
}

export function loadBillingSeats(): {
  plans: Plan[];
  checkout: CheckoutResult;
} {
  const plans = listPlans("floodops");
  const checkout = createCheckout({
    appId: "floodops",
    planId: "floodops-site",
    mode: "offline_stub",
  });
  return { plans, checkout };
}

export function codAtRiskFromState(state: WaveState): number {
  const flooded = new Set(
    state.wards.filter((w) => w.status === "flooded").map((w) => w.id)
  );
  return state.orders
    .filter((o) => flooded.has(o.wardId))
    .reduce((s, o) => s + o.codVnd, 0);
}
