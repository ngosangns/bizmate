import { describe, expect, it } from "vitest";
import { replanOrder } from "../engine.js";

describe("floodops", () => {
  const policy = {
    autoRescheduleMaxCodVnd: 500_000,
    refundRequiresHumanAboveVnd: 1_000_000,
  };
  const flooded = {
    id: "w1",
    name: "X",
    floodCm: 40,
    status: "flooded" as const,
  };

  it("auto-reschedules low COD in flood", () => {
    const a = replanOrder(
      { id: "o1", wardId: "w1", codVnd: 100_000, slaHoursLeft: 6 },
      flooded,
      policy,
      ["clear"]
    );
    expect(a.kind).toBe("reschedule");
    expect(a.requiresHuman).toBe(false);
  });

  it("escalates high COD refund to human", () => {
    const a = replanOrder(
      { id: "o2", wardId: "w1", codVnd: 2_500_000, slaHoursLeft: 2 },
      flooded,
      policy,
      ["clear"]
    );
    expect(a.kind).toBe("propose_refund");
    expect(a.requiresHuman).toBe(true);
  });
});
