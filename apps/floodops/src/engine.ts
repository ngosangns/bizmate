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

export function replanOrder(
  order: Order,
  ward: Ward,
  policy: Policy,
  clearWardIds: string[]
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

  if (order.codVnd >= policy.refundRequiresHumanAboveVnd) {
    return {
      orderId: order.id,
      kind: "propose_refund",
      reason: `Ngập ${ward.floodCm}cm · COD cao ${order.codVnd.toLocaleString("vi-VN")}₫`,
      requiresHuman: true,
      impactEstimate: `Hoàn COD + phí 2 chiều (ước tính)`,
      status: "awaiting_human",
    };
  }

  if (order.codVnd <= policy.autoRescheduleMaxCodVnd && clearWardIds.length) {
    return {
      orderId: order.id,
      kind: "reschedule",
      reason: `Ngập ${ward.floodCm}cm · dời giao sau khi rút nước / gom tuyến khô`,
      requiresHuman: false,
      impactEstimate: `SLA risk ${order.slaHoursLeft}h → +24h window`,
      status: "auto_applied",
    };
  }

  return {
    orderId: order.id,
    kind: "hold",
    reason: `Ngập ${ward.floodCm}cm — giữ đơn, chờ địa phương`,
    requiresHuman: order.slaHoursLeft <= 2,
    impactEstimate: "delay",
    status: order.slaHoursLeft <= 2 ? "awaiting_human" : "auto_applied",
  };
}

export function runWave(
  orders: Order[],
  wards: Ward[],
  policy: Policy
): ProposedAction[] {
  const byId = new Map(wards.map((w) => [w.id, w]));
  const clear = wards.filter((w) => w.status === "clear").map((w) => w.id);
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
    return replanOrder(o, w, policy, clear);
  });
}
