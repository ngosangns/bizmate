/**
 * FloodOps AI ops advisor — proposes NL replan rationale + optional alternate.
 * Policy engine still picks auto vs human by COD; human approves refunds.
 *
 * Soft A4: adviseReplanAsync + BIZMATE_MODE=live + API key → thin OpenAI NL;
 * engine kind/status unchanged. Missing key / failure → offline fixture with
 * fallbackUsed + reason (never invent live llm success).
 */
import {
  callLiveChatCompletion,
  createAiMeta,
  createFallbackAiMeta,
  liveLlmFallbackReason,
  resolveAiMode,
  resolveOpenAiApiKey,
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
  opts: {
    fallbackUsed: boolean;
    fallbackReason?: string;
    liveRationale?: string;
    liveModelId?: string;
  } = { fallbackUsed: false }
): OpsAdvice {
  const kindVi = KIND_VI[action.kind];
  const baseRationale = [
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
  let rationaleVi: string;

  if (opts.liveRationale && opts.liveModelId && !opts.fallbackUsed) {
    meta = createAiMeta("live", "llm", { modelId: opts.liveModelId });
    rationaleVi = `AI-live: ${opts.liveRationale} · (engine «${kindVi}» không đổi)`;
  } else if (opts.fallbackUsed) {
    meta = createFallbackAiMeta(
      "fixture",
      opts.fallbackReason ?? "provider_error"
    );
    rationaleVi = opts.fallbackReason
      ? `${baseRationale} · ${opts.fallbackReason}`
      : baseRationale;
  } else if (mode === "live") {
    meta = {
      ...createAiMeta("offline_stub", "fixture"),
      labelVi: "AI đề xuất (stub offline · dùng adviseReplanAsync cho live)",
      labelEn: "AI proposed (offline stub · use adviseReplanAsync for live)",
    };
    rationaleVi = baseRationale;
  } else {
    meta = createAiMeta(mode, "fixture");
    rationaleVi = baseRationale;
  }

  return {
    orderId: order.id,
    rationaleVi,
    alternateSuggestion,
    meta,
    engineKind: action.kind,
    engineStatus: action.status,
    fallbackUsed: opts.fallbackUsed,
  };
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
 * Soft A4 live-gated async. Key present → OpenAI NL rationale; engine untouched.
 * Missing key → missing_api_key. Any failure → offline fixture + fallbackUsed.
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

  if (!resolveOpenAiApiKey(env)) {
    return buildOfflineAdvice(action, order, ward, mode, {
      fallbackUsed: true,
      fallbackReason: "missing_api_key",
    });
  }

  try {
    const live = await callLiveChatCompletion(
      `Explain in 1-2 Vietnamese sentences why FloodOps engine chose ${action.kind} for order ${order.id} in ward ${ward.name} (flood ${ward.floodCm}cm, COD ${order.codVnd}). Do NOT change the engine action or invent refund approval.`,
      {
        env,
        system:
          "You are FloodOps AI ops advisor. Engine owns action kind. You explain only. Refunds need human.",
        timeoutMs: 12_000,
      }
    );
    const content = live.content.trim();
    if (!content) {
      return buildOfflineAdvice(action, order, ward, mode, {
        fallbackUsed: true,
        fallbackReason: "empty_content",
      });
    }
    return buildOfflineAdvice(action, order, ward, mode, {
      fallbackUsed: false,
      liveRationale: content,
      liveModelId: live.modelId,
    });
  } catch (err) {
    return buildOfflineAdvice(action, order, ward, mode, {
      fallbackUsed: true,
      fallbackReason: String(liveLlmFallbackReason(err)),
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
