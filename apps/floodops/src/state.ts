/**
 * Order / wave state persistence — JSON file (sandbox · stub).
 * Prefer JSON for order state + keep immutable audit JSONL separately.
 * Label: NOT live SPX / NOT a production DB.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FloodEvent, Order, Policy, ProposedAction, Ward } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface WaveState {
  waveId: string;
  updatedAt: string;
  city: string;
  /** Honesty label — always sandbox for this path */
  mode: "sandbox_stub";
  honestyBanner: string;
  wards: Ward[];
  orders: Order[];
  events: FloodEvent[];
  policy: Policy;
  actions: ProposedAction[];
  /** Approximate map pins (fixture) — not live GPS */
  wardGeo: Record<string, { lat: number; lng: number }>;
}

export const DEFAULT_WARD_GEO: Record<string, { lat: number; lng: number }> = {
  "q5-andong": { lat: 10.7552, lng: 106.6664 },
  "q1-bnghe": { lat: 10.7765, lng: 106.7054 },
  "q10-hoahung": { lat: 10.7728, lng: 106.6668 },
  "thu-duc": { lat: 10.8494, lng: 106.7537 },
};

export function defaultStatePath(): string {
  return path.join(__dirname, "..", "data", "orders.json");
}

export function writeWaveState(
  state: WaveState,
  statePath: string = defaultStatePath()
): void {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
}

export function readWaveState(
  statePath: string = defaultStatePath()
): WaveState | null {
  if (!fs.existsSync(statePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8")) as WaveState;
  } catch {
    return null;
  }
}

export function buildWaveState(input: {
  waveId?: string;
  city: string;
  wards: Ward[];
  orders: Order[];
  events: FloodEvent[];
  policy: Policy;
  actions: ProposedAction[];
  wardGeo?: Record<string, { lat: number; lng: number }>;
}): WaveState {
  return {
    waveId: input.waveId ?? "hcm-flood-day",
    updatedAt: new Date().toISOString(),
    city: input.city,
    mode: "sandbox_stub",
    honestyBanner:
      "⚠️ SANDBOX / STUB · Offline fixture + JSON state — không live SPX · không payment gateway",
    wards: input.wards,
    orders: input.orders,
    events: input.events,
    policy: input.policy,
    actions: input.actions,
    wardGeo: input.wardGeo ?? DEFAULT_WARD_GEO,
  };
}
