/**
 * FloodOps AI ops advisor — proposes NL replan rationale + optional alternate.
 * Policy engine still picks auto vs human by COD; human approves refunds.
 *
 * Sync path (`adviseReplan`) stays offline fixture for UI/tests.
 * Async path (`adviseReplanAsync`) gates live via BIZMATE_MODE=live and
 * falls back to offline fixture when callLiveLlmStub throws — never invents
 * live LLM traffic or a successful llm source offline.
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

/** Pitch-ready split copy — Engine decides · AI explains · refund = human. */
export const TRUST_SPLIT_VI =
  "Engine quyết · AI giải thích · hoàn = human" as const;

export const UI_BADGES = {
  proposing: "AI đang đề xuất",
  trustSplit: TRUST_SPLIT_VI,
} as const;

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
  /** True when live hook attempted and fell back to offline fixture. */
  fallbackUsed: boolean;
}

const KIND_VI: Record<ActionKind, string> = {
  reschedule: "dời giao",
  reroute_clear_ward: "chuyển tuyến khô",
  hold: "giữ đơn",
  propose_refund: "đề xuất hoàn COD",
  noop: "không đổi",
};

function buildOfflineAdvice(
  action: ProposedAction,
  order: Order,
  ward: Ward,
  mode: AiMode,
  opts: { fallbackUsed: boolean; fallbackReason?: string } = {
    fallbackUsed: false,
  }
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

  let meta: AiProposalMeta;
  if (opts.fallbackUsed) {
    meta = {
      ...createAiMeta("offline_stub", "fixture"),
      // Honesty: do not attach modelId on fallback (would fake live).
      labelVi: "AI đề xuất (stub offline · live fallback)",
      labelEn: "AI proposed (offline stub · live fallback)",
    };
  } else if (mode === "live") {
    // Sync path called while env says live — still offline fixture; async wires hook.
    meta = {
      ...createAiMeta("offline_stub", "fixture"),
      labelVi: "AI đề xuất (stub offline · dùng adviseReplanAsync cho live)",
      labelEn: "AI proposed (offline stub · use adviseReplanAsync for live)",
    };
  } else {
    meta = createAiMeta(mode, "fixture");
  }

  const advice: OpsAdvice = {
    orderId: order.id,
    rationaleVi: opts.fallbackReason
      ? `${rationaleVi} · ${opts.fallbackReason}`
      : rationaleVi,
    alternateSuggestion,
    meta,
    engineKind: action.kind,
    engineStatus: action.status,
    fallbackUsed: opts.fallbackUsed,
  };
  return advice;
}

/**
 * Offline fixture advisor — labeled AI stub.
 * Sync path for UI/tests; does not call live LLM (never invents live traffic).
 */
export function adviseReplan(
  action: ProposedAction,
  order: Order,
  ward: Ward,
  mode: AiMode = resolveAiMode()
): OpsAdvice {
  return buildOfflineAdvice(action, order, ward, mode, { fallbackUsed: false });
}

/**
 * Live-gated async wrapper. When BIZMATE_MODE=live, tries `callLiveLlmStub`
 * from `@bizmate/core`; on throw (no provider in this build), falls back to
 * offline fixture with honest labels. meta.mode stays `offline_stub` after
 * fallback — never claims llm source success without a real provider.
 */
export async function adviseReplanAsync(
  action: ProposedAction,
  order: Order,
  ward: Ward,
  env: NodeJS.ProcessEnv = process.env
): Promise<OpsAdvice> {
  const mode = resolveAiMode(env);
  if (mode !== "live") {
    return buildOfflineAdvice(action, order, ward, mode, {
      fallbackUsed: false,
    });
  }

  const modelId = env.BIZMATE_LLM_MODEL;
  try {
    const { callLiveLlmStub } = await import("@bizmate/core");
    // Promise<never> today — when a real provider is wired, parse NL here.
    await callLiveLlmStub(
      `Advise floodops replan for order ${order.id} action ${action.kind} ward ${ward.name}`,
      { modelId }
    );
    // Unreachable until provider returns: still draft via offline (safe).
    return buildOfflineAdvice(action, order, ward, mode, {
      fallbackUsed: true,
      fallbackReason: "live provider returned but NL parser not wired → offline_stub",
    });
  } catch {
    return buildOfflineAdvice(action, order, ward, mode, {
      fallbackUsed: true,
      fallbackReason: "live hook unavailable → offline_stub",
    });
  }
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
        fallbackUsed: false,
      };
    }
    return adviseReplan(a, order, ward, mode);
  });
}

/** Async wave — uses live hook per action when BIZMATE_MODE=live. */
export async function adviseWaveAsync(
  actions: ProposedAction[],
  orders: Order[],
  wards: Ward[],
  env: NodeJS.ProcessEnv = process.env
): Promise<OpsAdvice[]> {
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const wardById = new Map(wards.map((w) => [w.id, w]));
  return Promise.all(
    actions.map(async (a) => {
      const order = orderById.get(a.orderId);
      const ward = order ? wardById.get(order.wardId) : undefined;
      if (!order || !ward) {
        return {
          orderId: a.orderId,
          rationaleVi: "AI-advisor: thiếu order/ward fixture — bỏ qua.",
          meta: createAiMeta("offline_stub", "fixture"),
          engineKind: a.kind,
          engineStatus: a.status,
          fallbackUsed: false,
        };
      }
      return adviseReplanAsync(a, order, ward, env);
    })
  );
}
