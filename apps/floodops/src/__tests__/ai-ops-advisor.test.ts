import { describe, expect, it } from "vitest";
import { replanOrder, runWave, type Policy, type Ward } from "../engine.js";
import { adviseReplan, adviseWave } from "../ai-ops-advisor.js";

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
    expect(advice.meta.labelVi.toLowerCase()).toMatch(/stub|offline|advisor|đề xuất|fixture/);
    expect(advice.alternateSuggestion?.kind).toBe("hold");
    // engine status unchanged by advisor
    expect(advice.engineStatus).toBe(action.status);
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
      expect(advice[i]!.rationaleVi.length).toBeGreaterThan(10);
    }
  });
});
