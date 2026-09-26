import { describe, expect, it } from "vitest";
import {
  createCheckout,
  getPlan,
  honestyBanner,
  listPlans,
  stubCharge,
} from "../index.js";

describe("honestyBanner", () => {
  it("labels every mode as sandbox or stub and denies live", () => {
    for (const mode of ["stripe_test", "vn_sandbox", "offline_stub"] as const) {
      const s = honestyBanner(mode);
      expect(s).toMatch(/SANDBOX|STUB/i);
      expect(
        /không phải thanh toán thật|không trừ tiền thật|không gọi cổng|not live|offline stub/i.test(
          s
        )
      ).toBe(true);
    }
  });
});

describe("listPlans", () => {
  it("returns BizMate Sea + Codex + SME roadmap tiers", () => {
    const plans = listPlans("bizmate");
    expect(plans.length).toBeGreaterThanOrEqual(3);
    expect(plans.some((p) => p.id === "bizmate-sea-seat")).toBe(true);
    expect(plans.some((p) => p.id === "bizmate-codex-partnership")).toBe(true);
    const sme = plans.find((p) => p.id === "bizmate-sme-pro");
    expect(sme?.roadmapOnly).toBe(true);
  });

  it("returns bookkeeper free + pro fixtures", () => {
    const plans = listPlans("bookkeeper");
    expect(plans.some((p) => p.id === "bookkeeper-free")).toBe(true);
    expect(plans.some((p) => p.id === "bookkeeper-pro")).toBe(true);
    expect(getPlan("bookkeeper-pro")?.priceDisplay).toMatch(/99\.000/);
  });

  it("returns shield family fixtures", () => {
    const plans = listPlans("shield");
    expect(plans.length).toBeGreaterThanOrEqual(1);
    expect(plans.every((p) => p.appId === "shield")).toBe(true);
  });

  it("returns floodops site + wave fixtures", () => {
    const plans = listPlans("floodops");
    expect(plans.some((p) => p.id === "floodops-site")).toBe(true);
    expect(plans.some((p) => p.id === "floodops-wave")).toBe(true);
    for (const p of plans) {
      expect(p.honestyNote.toLowerCase()).toMatch(/stub|fixture|internal/);
    }
  });
});

describe("createCheckout", () => {
  it("stripe_test returns cs_test session + honesty", () => {
    const r = createCheckout({
      appId: "bizmate",
      planId: "bizmate-sme-pro",
      mode: "stripe_test",
    });
    expect(r.ok).toBe(true);
    expect(r.sessionId.startsWith("cs_test_")).toBe(true);
    expect(r.url).toMatch(/checkout\.stripe\.com/);
    expect(r.honestyBanner).toMatch(/SANDBOX|TEST/i);
    expect(r.stub).toBe(false);
  });

  it("offline_stub never claims live URL + cost center", () => {
    const r = createCheckout({
      appId: "bizmate",
      planId: "bizmate-sea-seat",
      mode: "offline_stub",
    });
    expect(r.ok).toBe(true);
    expect(r.url).toBeNull();
    expect(r.stub).toBe(true);
    expect(r.costCenter).toBeTruthy();
    expect(r.honestyBanner).toMatch(/STUB/i);
  });

  it("vn_sandbox returns placeholder URL", () => {
    const r = createCheckout({
      appId: "bookkeeper",
      planId: "bookkeeper-pro",
      mode: "vn_sandbox",
    });
    expect(r.ok).toBe(true);
    expect(r.url).toMatch(/sandbox\.vnpayment\.vn/);
  });

  it("unknown plan fails softly with honesty", () => {
    const r = createCheckout({
      appId: "bizmate",
      planId: "nope",
      mode: "stripe_test",
    });
    expect(r.ok).toBe(false);
    expect(r.honestyBanner.length).toBeGreaterThan(0);
  });
});

describe("stubCharge", () => {
  it("labels offline cost-center charge", () => {
    const r = stubCharge({
      appId: "bizmate",
      planId: "bizmate-sea-seat",
      costCenter: "SEA-INTERNAL-TOOLING",
    });
    expect(r.ok).toBe(true);
    expect(r.mode).toBe("offline_stub");
    expect(r.chargeId.startsWith("ch_stub_")).toBe(true);
    expect(r.honestyBanner).toMatch(/STUB/i);
    expect(r.costCenter).toBe("SEA-INTERNAL-TOOLING");
  });
});
