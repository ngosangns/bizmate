/**
 * FloodOps AI ops advisor — proposes NL replan rationale + optional alternate.
 * Policy engine still picks auto vs human by COD; human approves refunds.
 */
import {
  createAiMeta,
  resolveAiMode,
  type AiMode,
  type AiProposalMeta,
} from "@bizmate/core";
import type {
  ActionKind,
  Order,
  ProposedAction,
  Ward,
} from "./engine.js";

export interface OpsAdvice {
  orderId: string;
  /** Natural-language rationale for the engine action. */
  rationaleVi: string;
  /** Optional alternate suggestion — never auto-applied. */
  alternateSuggestion?: {
    kind: ActionKind;
    whyVi: string;
  };
  meta: AiProposalMeta;
  /** Engine action remains source of truth unless human picks alternate. */
  engineKind: ActionKind;
  engineStatus: ProposedAction["status"];
}

const KIND_VI: Record<ActionKind, string> = {
  reschedule: "dời giao",
  reroute_clear_ward: "chuyển tuyến khô",
  hold: "giữ đơn",
  propose_refund: "đề xuất hoàn COD",
  noop: "không đổi",
};

/** Offline fixture advisor — labeled AI stub. */
export function adviseReplan(
  action: ProposedAction,
  order: Order,
  ward: Ward,
  mode: AiMode = resolveAiMode()
): OpsAdvice {
  const kindVi = KIND_VI[action.kind];
  const rationaleVi = [
    `AI-advisor: Engine chọn «${kindVi}» cho đơn ${order.id}.`,
    `Phường ${ward.name} (${ward.status}, ${ward.floodCm}cm).`,
    `COD ${order.codVnd.toLocaleString("vi-VN")}₫ · SLA còn ${order.slaHoursLeft}h.`,
    action.requiresHuman
      ? "Cần ops/human duyệt trước khi chốt tiền."
      : "Policy cho phép auto_applied (không phải LLM quyết).",
  ].join(" ");

  let alternateSuggestion: OpsAdvice["alternateSuggestion"];
  if (action.kind === "hold" && ward.status === "flooded") {
    alternateSuggestion = {
      kind: "reschedule",
      whyVi:
        "AI gợi ý phụ: nếu seller chấp nhận +24h, có thể dời giao thay vì giữ — ops quyết.",
    };
  } else if (action.kind === "propose_refund") {
    alternateSuggestion = {
      kind: "hold",
      whyVi:
        "AI gợi ý phụ: tạm giữ chờ rút nước nếu buyer đồng ý — hoàn COD vẫn cần human.",
    };
  }

  const meta =
    mode === "live"
      ? {
          ...createAiMeta("offline_stub", "fixture"),
          labelVi: "AI ops advisor (stub · live hook chưa wire)",
          labelEn: "AI ops advisor (stub · live hook not wired)",
        }
      : createAiMeta(mode, "fixture");

  return {
    orderId: order.id,
    rationaleVi,
    alternateSuggestion,
    meta,
    engineKind: action.kind,
    engineStatus: action.status,
  };
}

export function adviseWave(
  actions: ProposedAction[],
  orders: Order[],
  wards: Ward[],
  mode: AiMode = resolveAiMode()
): OpsAdvice[] {
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const wardById = new Map(wards.map((w) => [w.id, w]));
  return actions.map((a) => {
    const order = orderById.get(a.orderId);
    const ward = order ? wardById.get(order.wardId) : undefined;
    if (!order || !ward) {
      return {
        orderId: a.orderId,
        rationaleVi: "AI-advisor: thiếu order/ward fixture — bỏ qua.",
        meta: createAiMeta("offline_stub", "fixture"),
        engineKind: a.kind,
        engineStatus: a.status,
      };
    }
    return adviseReplan(a, order, ward, mode);
  });
}
