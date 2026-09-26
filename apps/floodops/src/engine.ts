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
}

export interface Policy {
  autoRescheduleMaxCodVnd: number;
  refundRequiresHumanAboveVnd: number;
}

export type ActionKind =
  | "reschedule"
  | "reroute_clear_ward"
  | "hold"
  | "propose_refund"
  | "noop";

export interface ProposedAction {
  orderId: string;
  kind: ActionKind;
  reason: string;
  requiresHuman: boolean;
  impactEstimate: string;
  status: "proposed" | "auto_applied" | "awaiting_human" | "approved";
}

export interface FloodEvent {
  type: string;
  wardId?: string;
  floodCm?: number;
}

export interface EventSummary {
  floodAlerts: { wardId: string; floodCm: number }[];
  courierCancelWardIds: string[];
}

export interface AuditEntry {
  orderId: string;
  kind: ActionKind;
  requiresHuman: boolean;
  status: ProposedAction["status"];
  reason: string;
}

/** Pure event digest — deterministic order as given in fixture. */
export function summarizeEvents(events: FloodEvent[]): EventSummary {
  const floodAlerts: { wardId: string; floodCm: number }[] = [];
  const cancelSet = new Set<string>();
  for (const e of events) {
    if (e.type === "flood_alert" && e.wardId != null) {
      floodAlerts.push({ wardId: e.wardId, floodCm: e.floodCm ?? 0 });
    }
    if (e.type === "courier_cancel" && e.wardId != null) {
      cancelSet.add(e.wardId);
    }
  }
  return {
    floodAlerts,
    courierCancelWardIds: [...cancelSet],
  };
}

/** Compact audit trail for demo / judge — field order fixed. */
export function buildAuditLog(actions: ProposedAction[]): AuditEntry[] {
  return actions.map((a) => ({
    orderId: a.orderId,
    kind: a.kind,
    requiresHuman: a.requiresHuman,
    status: a.status,
    reason: a.reason,
  }));
}

/**
 * COD at-risk without replan: sum COD of orders sitting on flooded wards.
 * Deterministic fixture metric — not a live SPX KPI.
 */
export function codAtRiskVnd(orders: Order[], wards: Ward[]): number {
  const flooded = new Set(
    wards.filter((w) => w.status === "flooded").map((w) => w.id)
  );
  return orders
    .filter((o) => flooded.has(o.wardId))
    .reduce((sum, o) => sum + o.codVnd, 0);
}

/**
 * Lee Round-1: every action on a flooded ward with slaHoursLeft <= 2
 * must escalate to human — even reschedule / hold / reroute.
 * Refund proposals are always human (never auto-applied).
 */
function escalateTightSla(
  action: ProposedAction,
  order: Order,
  flooded: boolean
): ProposedAction {
  if (!flooded) return action;
  if (action.kind === "propose_refund") {
    // Money path: always human; never auto_applied
    return {
      ...action,
      requiresHuman: true,
      status: action.status === "approved" ? "approved" : "awaiting_human",
    };
  }
  if (order.slaHoursLeft <= 2) {
    const slaNote = ` · SLA còn ${order.slaHoursLeft}h — cần ops duyệt`;
    return {
      ...action,
      requiresHuman: true,
      status: "awaiting_human",
      reason: action.reason.includes("SLA còn")
        ? action.reason
        : `${action.reason}${slaNote}`,
    };
  }
  return action;
}

/**
 * COD tiers (exclusive mid band for refund):
 * - low  (<= autoRescheduleMaxCodVnd) + clear wards → reschedule
 * - mid  (auto < COD < refund) + clear wards → reroute_clear_ward
 * - high (>= refundRequiresHumanAboveVnd) → propose_refund (human)
 * courier_cancel on flooded ward: prefer hold over reschedule; note cancel in reason.
 * SLA <= 2h on flooded ward → always awaiting_human (Lee).
 */
export function replanOrder(
  order: Order,
  ward: Ward,
  policy: Policy,
  clearWardIds: string[],
  courierCancelled = false
): ProposedAction {
  if (ward.status !== "flooded") {
    return {
      orderId: order.id,
      kind: "noop",
      reason: "Ward clear",
      requiresHuman: false,
      impactEstimate: "on-time",
      status: "auto_applied",
    };
  }

  const cancelNote = courierCancelled
    ? " · courier cancel trên tuyến ngập"
    : "";
  const floodPrefix = `Ngập ${ward.floodCm}cm`;

  let action: ProposedAction;

  if (order.codVnd >= policy.refundRequiresHumanAboveVnd) {
    action = {
      orderId: order.id,
      kind: "propose_refund",
      reason: `${floodPrefix} · COD cao ${order.codVnd.toLocaleString("vi-VN")}₫${cancelNote}`,
      requiresHuman: true,
      impactEstimate: `Hoàn COD + phí 2 chiều (ước tính)`,
      status: "awaiting_human",
    };
  } else {
    const hasClear = clearWardIds.length > 0;
    const isLow = order.codVnd <= policy.autoRescheduleMaxCodVnd;
    const isMid =
      order.codVnd > policy.autoRescheduleMaxCodVnd &&
      order.codVnd < policy.refundRequiresHumanAboveVnd;

    // Mid COD + clear → reroute (đích ward khô; vẫn ghi cancel nếu có)
    if (isMid && hasClear) {
      const dest = clearWardIds[0]!;
      action = {
        orderId: order.id,
        kind: "reroute_clear_ward",
        reason: `${floodPrefix} · COD trung ${order.codVnd.toLocaleString("vi-VN")}₫ → chuyển tuyến ${dest}${cancelNote}`,
        requiresHuman: false,
        impactEstimate: `reroute → ${dest}`,
        status: "auto_applied",
      };
    } else if (isLow && hasClear && !courierCancelled) {
      // Low COD + clear → reschedule, unless courier cancelled (prefer hold)
      action = {
        orderId: order.id,
        kind: "reschedule",
        reason: `${floodPrefix} · dời giao sau khi rút nước / gom tuyến khô`,
        requiresHuman: false,
        impactEstimate: `SLA risk ${order.slaHoursLeft}h → +24h window`,
        status: "auto_applied",
      };
    } else {
      // Hold: no clear path, mid/low without clear, or courier cancel blocking reschedule
      const why = courierCancelled
        ? `${floodPrefix} — giữ đơn (courier cancel trên tuyến ngập)`
        : `${floodPrefix} — giữ đơn, chờ địa phương`;
      action = {
        orderId: order.id,
        kind: "hold",
        reason: why,
        requiresHuman: false,
        impactEstimate: "delay",
        status: "auto_applied",
      };
    }
  }

  return escalateTightSla(action, order, true);
}

export function runWave(
  orders: Order[],
  wards: Ward[],
  policy: Policy,
  events: FloodEvent[] = []
): ProposedAction[] {
  const byId = new Map(wards.map((w) => [w.id, w]));
  const clear = wards.filter((w) => w.status === "clear").map((w) => w.id);
  const cancelled = new Set(summarizeEvents(events).courierCancelWardIds);
  return orders.map((o) => {
    const w = byId.get(o.wardId);
    if (!w) {
      return {
        orderId: o.id,
        kind: "hold",
        reason: "Unknown ward",
        requiresHuman: true,
        impactEstimate: "unknown",
        status: "awaiting_human",
      };
    }
    return replanOrder(o, w, policy, clear, cancelled.has(o.wardId));
  });
}
