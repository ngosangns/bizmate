import { afterEach, describe, expect, it, vi } from "vitest";
import { replanOrder, runWave, type Policy, type Ward } from "../engine.js";
import {
  adviseReplan,
  adviseReplanAsync,
  adviseWave,
  TRUST_SPLIT_VI,
  UI_BADGES,
} from "../ai-ops-advisor.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("floodops AI ops advisor", () => {
  const policy: Policy = {
    autoRescheduleMaxCodVnd: 500_000,
    refundRequiresHumanAboveVnd: 1_000_000,
  };
  const flooded: Ward = {
    id: "w1",
    name: "An Đông",
    floodCm: 40,
    status: "flooded",
  };
  const clear: Ward = {
    id: "w-clear",
    name: "Dry",
    floodCm: 0,
    status: "clear",
  };

  it("advises NL rationale next to engine refund action without auto-applying", () => {
    const order = {
      id: "o-hi",
      wardId: "w1",
      codVnd: 2_000_000,
      slaHoursLeft: 6,
    };
    const action = replanOrder(order, flooded, policy, [clear.id]);
    expect(action.kind).toBe("propose_refund");
    expect(action.requiresHuman).toBe(true);

    const advice = adviseReplan(action, order, flooded, "offline_stub");
    expect(advice.engineKind).toBe("propose_refund");
    expect(advice.rationaleVi).toMatch(/AI-advisor/i);
    expect(advice.meta.mode).toBe("offline_stub");
    expect(advice.meta.source).not.toBe("llm");
    expect(advice.meta.labelVi.toLowerCase()).toMatch(
      /stub|offline|advisor|đề xuất|fixture/
    );
    expect(advice.alternateSuggestion?.kind).toBe("hold");
    expect(advice.engineStatus).toBe(action.status);
    expect(advice.fallbackUsed).toBe(false);
    expect(action.requiresHuman).toBe(true);
  });

  it("adviseWave covers engine actions without changing kinds", () => {
    const orders = [
      { id: "o1", wardId: "w1", codVnd: 200_000, slaHoursLeft: 8 },
      { id: "o2", wardId: "w1", codVnd: 2_000_000, slaHoursLeft: 8 },
    ];
    const wards = [flooded, clear];
    const actions = runWave(orders, wards, policy, []);
    const advice = adviseWave(actions, orders, wards, "offline_stub");
    expect(advice).toHaveLength(actions.length);
    for (let i = 0; i < actions.length; i++) {
      expect(advice[i]!.engineKind).toBe(actions[i]!.kind);
      expect(advice[i]!.engineStatus).toBe(actions[i]!.status);
      expect(advice[i]!.rationaleVi.length).toBeGreaterThan(10);
      expect(advice[i]!.meta.source).not.toBe("llm");
    }
  });

  it("live missing key → missing_api_key fallback, no llm claim", async () => {
    const order = {
      id: "o-live",
      wardId: "w1",
      codVnd: 300_000,
      slaHoursLeft: 10,
    };
    const action = replanOrder(order, flooded, policy, [clear.id]);
    const beforeKind = action.kind;
    const beforeStatus = action.status;

    const advice = await adviseReplanAsync(action, order, flooded, {
      BIZMATE_MODE: "live",
    });

    expect(advice.fallbackUsed).toBe(true);
    expect(advice.meta.mode).toBe("offline_stub");
    expect(advice.meta.fallbackReason).toBe("missing_api_key");
    expect(advice.meta.source).not.toBe("llm");
    expect(advice.meta.modelId).toBeUndefined();
    expect(advice.rationaleVi).toMatch(/missing_api_key/i);
    expect(advice.engineKind).toBe(beforeKind);
    expect(advice.engineStatus).toBe(beforeStatus);
  });

  it("live with key mocked → live meta; engine kind unchanged", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [
            {
              message: {
                content: "Nước cao nên engine chọn hành động này; hoàn vẫn cần human.",
              },
            },
          ],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchImpl);

    const order = {
      id: "o-live-ok",
      wardId: "w1",
      codVnd: 2_000_000,
      slaHoursLeft: 4,
    };
    const action = replanOrder(order, flooded, policy, [clear.id]);
    expect(action.kind).toBe("propose_refund");

    const advice = await adviseReplanAsync(action, order, flooded, {
      BIZMATE_MODE: "live",
      OPENAI_API_KEY: "sk-test",
    });

    expect(advice.fallbackUsed).toBe(false);
    expect(advice.meta.mode).toBe("live");
    expect(advice.meta.source).toBe("llm");
    expect(advice.meta.modelId).toBe("gpt-4o-mini");
    expect(advice.rationaleVi).toMatch(/AI-live/);
    expect(advice.engineKind).toBe("propose_refund");
    expect(advice.engineStatus).toBe(action.status);
    expect(fetchImpl).toHaveBeenCalled();
  });

  it("offline async path does not set fallbackUsed", async () => {
    const order = {
      id: "o-off",
      wardId: "w1",
      codVnd: 200_000,
      slaHoursLeft: 12,
    };
    const action = replanOrder(order, flooded, policy, [clear.id]);
    const advice = await adviseReplanAsync(action, order, flooded, {
      BIZMATE_MODE: "offline",
    });
    expect(advice.fallbackUsed).toBe(false);
    expect(advice.meta.mode).toBe("offline_stub");
    expect(advice.meta.source).not.toBe("llm");
    expect(advice.meta.modelId).toBeUndefined();
  });

  it("propose_refund still requiresHuman — AI alternate never auto-applied", () => {
    const order = {
      id: "o-ref",
      wardId: "w1",
      codVnd: 2_500_000,
      slaHoursLeft: 4,
    };
    const action = replanOrder(order, flooded, policy, [clear.id]);
    expect(action.kind).toBe("propose_refund");
    expect(action.requiresHuman).toBe(true);
    expect(action.status).toBe("awaiting_human");

    const advice = adviseReplan(action, order, flooded, "offline_stub");
    expect(advice.engineKind).toBe("propose_refund");
    expect(advice.engineStatus).toBe("awaiting_human");
    expect(advice.alternateSuggestion?.kind).toBe("hold");
    expect(action.kind).toBe("propose_refund");
    expect(action.requiresHuman).toBe(true);
  });

  it("exports trust-split UI badges for pitch clarity", () => {
    expect(UI_BADGES.proposing).toBe("AI đang đề xuất");
    expect(TRUST_SPLIT_VI).toMatch(/Engine quyết/);
    expect(TRUST_SPLIT_VI).toMatch(/AI giải thích/);
    expect(TRUST_SPLIT_VI).toMatch(/hoàn = human/);
  });
});
